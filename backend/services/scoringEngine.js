const stats = require('simple-statistics');

const getStrId = (obj) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (obj._id) return obj._id.toString();
  return obj.toString();
};

class ScoringEngine {
  /**
   * Computes anomaly scores and trigger reasons for all tenders.
   * @param {Array} tenders 
   * @param {Array} bids 
   * @param {Array} vendors 
   * @param {Array} contracts 
   * @param {Object} graphEngine 
   * @param {Object} weights 
   */
  evaluateTenders(tenders, bids, vendors, contracts, graphEngine, weights = {}) {
    const {
      priceDeviationWeight = 0.30,
      singleBidderWeight = 0.20,
      winRateWeight = 0.15,
      bidRotationWeight = 0.15,
      relationshipWeight = 0.20
    } = weights;

    // Helper maps
    const vendorMap = new Map(vendors.map(v => [v._id.toString(), v]));
    const contractMap = new Map(contracts.map(c => [c.tenderId.toString(), c]));

    // Group bids by tenderId
    const bidsByTender = new Map();
    bids.forEach(b => {
      const tId = b.tenderId._id ? b.tenderId._id.toString() : b.tenderId.toString();
      if (!bidsByTender.has(tId)) bidsByTender.set(tId, []);
      bidsByTender.get(tId).push(b);
    });

    // Group tenders by category to compute category benchmarks
    const tendersByCategory = new Map();
    tenders.forEach(t => {
      if (!tendersByCategory.has(t.category)) tendersByCategory.set(t.category, []);
      tendersByCategory.get(t.category).push(t);
    });

    // Compute Category Price Ratios (Winning Bid / Estimated Value or Bid / Estimated Value)
    const categoryRatios = new Map();
    tendersByCategory.forEach((catTenders, category) => {
      const ratios = [];
      catTenders.forEach(t => {
        const tBids = bidsByTender.get(t._id.toString()) || [];
        tBids.forEach(b => {
          if (t.estimatedValue > 0) {
            ratios.push(b.bidAmount / t.estimatedValue);
          }
        });
      });
      
      if (ratios.length > 0) {
        const mean = stats.mean(ratios);
        const std = ratios.length > 1 ? stats.standardDeviation(ratios) : 0.05;
        const median = stats.median(ratios);
        const q1 = stats.quantile(ratios, 0.25);
        const q3 = stats.quantile(ratios, 0.75);
        const iqr = q3 - q1;
        categoryRatios.set(category, { mean, std: std || 0.05, median, q1, q3, iqr: iqr || 0.05, allRatios: ratios });
      } else {
        categoryRatios.set(category, { mean: 1.0, std: 0.05, median: 1.0, q1: 0.95, q3: 1.05, iqr: 0.1, allRatios: [1.0] });
      }
    });

    // Build Graph for Relationship Scoring
    const graph = graphEngine.buildGraph(vendors, tenders, bids, contracts);

    // Compute Vendor Category Win Rates
    const vendorWinsByCategory = new Map(); // vendorId -> { category: count }
    const totalWinsByCategory = new Map(); // category -> totalAwardedCount
    contracts.forEach(c => {
      const winnerId = c.winningVendorId._id ? c.winningVendorId._id.toString() : c.winningVendorId.toString();
      const tender = tenders.find(t => t._id.toString() === c.tenderId.toString());
      if (tender) {
        const cat = tender.category;
        totalWinsByCategory.set(cat, (totalWinsByCategory.get(cat) || 0) + 1);
        if (!vendorWinsByCategory.has(winnerId)) vendorWinsByCategory.set(winnerId, {});
        const vWins = vendorWinsByCategory.get(winnerId);
        vWins[cat] = (vWins[cat] || 0) + 1;
      }
    });

    // Evaluate each Tender
    const evaluatedCases = tenders.map(tender => {
      const tId = tender._id.toString();
      const tBids = bidsByTender.get(tId) || [];
      const contract = contractMap.get(tId);
      const winningVendorId = contract ? (contract.winningVendorId._id ? contract.winningVendorId._id.toString() : contract.winningVendorId.toString()) : null;
      const winningVendor = winningVendorId ? vendorMap.get(winningVendorId) : null;
      const categoryStats = categoryRatios.get(tender.category);

      const triggerReasons = [];
      let priceScore = 0;
      let singleBidderScore = 0;
      let winRateScore = 0;
      let rotationScore = 0;
      let relationshipScore = 0;

      // 1. PRICE DEVIATION SCORE (Category-based Z-score / IQR)
      if (tBids.length > 0 && categoryStats) {
        const bidRatios = tBids.map(b => b.bidAmount / tender.estimatedValue);
        const maxRatio = Math.max(...bidRatios);
        const minRatio = Math.min(...bidRatios);
        const winningBid = tBids.find(b => getStrId(b.vendorId) === winningVendorId) || tBids[0];
        const winningRatio = winningBid ? (winningBid.bidAmount / tender.estimatedValue) : maxRatio;

        const zScore = (winningRatio - categoryStats.mean) / categoryStats.std;
        
        if (zScore > 1.8) {
          priceScore = Math.min(100, Math.round((zScore - 1.0) * 35));
          triggerReasons.push({
            rule: 'Price Benchmark Deviation',
            description: `Awarded price ratio (${(winningRatio * 100).toFixed(1)}%) is +${zScore.toFixed(2)} Z-scores above category median benchmark (${(categoryStats.median * 100).toFixed(1)}%).`,
            severity: zScore > 3.0 ? 'high' : 'medium',
            metrics: { zScore: Number(zScore.toFixed(2)), winningRatio, median: categoryStats.median, mean: categoryStats.mean }
          });
        }

        // Extremely low spread among multiple bids (tight clustering at inflated price)
        if (tBids.length >= 3) {
          const spread = maxRatio - minRatio;
          if (spread < 0.015 && winningRatio > 1.05) {
            priceScore = Math.max(priceScore, 85);
            triggerReasons.push({
              rule: 'Artificial Price Clustering',
              description: `Abnormally tight bid spread (${(spread * 100).toFixed(2)}% variance) among ${tBids.length} co-bidders at above-benchmark prices.`,
              severity: 'high',
              metrics: { spread: Number((spread * 100).toFixed(2)), numBidders: tBids.length }
            });
          }
        }
      }

      // 2. SINGLE-BIDDER FREQUENCY SCORE
      if (tBids.length === 1) {
        singleBidderScore = 75;
        const soleVendorId = getStrId(tBids[0].vendorId);
        const vendor = vendorMap.get(soleVendorId);
        
        // Count how many sole-bidder tenders this vendor won in category
        let soleCount = 0;
        tendersByCategory.get(tender.category).forEach(catTender => {
          const catBids = bidsByTender.get(getStrId(catTender)) || [];
          if (catBids.length === 1 && getStrId(catBids[0].vendorId) === soleVendorId) {
            soleCount++;
          }
        });

        if (soleCount >= 3) {
          singleBidderScore = 95;
          triggerReasons.push({
            rule: 'Repeated Sole-Bidder Pattern',
            description: `Sole bid received on tender. Vendor '${vendor ? vendor.name : 'Unknown'}' has won ${soleCount} single-bidder tenders in ${tender.category}.`,
            severity: 'high',
            metrics: { soleCount, category: tender.category }
          });
        } else {
          triggerReasons.push({
            rule: 'Single Bidder Tender',
            description: `Only 1 bid received for estimated value \$${tender.estimatedValue.toLocaleString()}.`,
            severity: 'medium',
            metrics: { biddersCount: 1 }
          });
        }
      }

      // 3. WIN-RATE CONCENTRATION SCORE
      if (winningVendorId) {
        const vWins = (vendorWinsByCategory.get(winningVendorId) || {})[tender.category] || 0;
        const totalCatWins = totalWinsByCategory.get(tender.category) || 1;
        const winShare = vWins / totalCatWins;

        if (winShare >= 0.40 && totalCatWins >= 5) {
          winRateScore = Math.min(100, Math.round(winShare * 100));
          triggerReasons.push({
            rule: 'High Category Market Concentration',
            description: `Winning vendor holds ${(winShare * 100).toFixed(1)}% of all awarded tenders (${vWins}/${totalCatWins}) in ${tender.category}.`,
            severity: winShare >= 0.60 ? 'high' : 'medium',
            metrics: { winShare: Number((winShare * 100).toFixed(1)), wins: vWins, totalCategoryAwards: totalCatWins }
          });
        }
      }

      // 4. BID ROTATION RING SCORE
      // Check if winning vendor and co-bidders repeatedly co-bid and alternate awards
      const bidderIds = tBids.map(b => getStrId(b.vendorId));
      if (bidderIds.length >= 2) {
        // Find previous tenders in this category with overlapping bidders
        const catTenders = tendersByCategory.get(tender.category) || [];
        let rotationPatternMatches = 0;
        const pastWinners = [];

        catTenders.forEach(otherTender => {
          if (getStrId(otherTender) !== tId) {
            const otherBids = bidsByTender.get(getStrId(otherTender)) || [];
            const otherBidderIds = otherBids.map(b => getStrId(b.vendorId));
            const overlap = bidderIds.filter(id => otherBidderIds.includes(id));
            if (overlap.length >= 2) {
              const otherContract = contractMap.get(getStrId(otherTender));
              if (otherContract) {
                pastWinners.push(getStrId(otherContract.winningVendorId));
              }
            }
          }
        });

        // Check if multiple distinct vendors from this co-bidding group have won in turn
        const uniquePastWinners = Array.from(new Set(pastWinners));
        if (uniquePastWinners.length >= 2 && pastWinners.length >= 3) {
          rotationScore = 90;
          triggerReasons.push({
            rule: 'Sequential Bid Rotation Pattern',
            description: `Co-bidding group of ${bidderIds.length} vendors alternate winning contract awards across ${pastWinners.length + 1} category tenders.`,
            severity: 'high',
            metrics: { coBiddingGroupSize: bidderIds.length, uniqueWinnersInGroup: uniquePastWinners.length }
          });
        }
      }

      // 5. VENDOR RELATIONSHIP GRAPH SCORE
      // Check if bidders share address or directorships or have frequent co-bidding
      if (bidderIds.length >= 2) {
        let sharedAddressFound = false;
        let sharedDirectorFound = false;
        let highCoBidding = false;

        for (let i = 0; i < bidderIds.length; i++) {
          for (let j = i + 1; j < bidderIds.length; j++) {
            const v1Id = bidderIds[i];
            const v2Id = bidderIds[j];

            if (graph.hasNode(v1Id) && graph.hasNode(v2Id)) {
              if (graph.hasEdge(`rel_addr_${v1Id}_${v2Id}`) || graph.hasEdge(`rel_addr_${v2Id}_${v1Id}`)) {
                sharedAddressFound = true;
              }
              if (graph.hasEdge(`rel_dir_${v1Id}_${v2Id}`) || graph.hasEdge(`rel_dir_${v2Id}_${v1Id}`)) {
                sharedDirectorFound = true;
              }
              const cobidEdge = graph.hasEdge(`cobid_${v1Id}_${v2Id}`) ? graph.getEdgeAttributes(`cobid_${v1Id}_${v2Id}`) : null;
              if (cobidEdge && cobidEdge.count >= 4) {
                highCoBidding = true;
              }
            }
          }
        }

        if (sharedAddressFound || sharedDirectorFound) {
          relationshipScore = 100;
          const relDetails = [];
          if (sharedAddressFound) relDetails.push('Shared Registered Address');
          if (sharedDirectorFound) relDetails.push('Shared Director / Key Management');

          triggerReasons.push({
            rule: 'Entity Relationship Risk Cluster',
            description: `Co-bidders on this tender share institutional links: ${relDetails.join(' & ')}.`,
            severity: 'high',
            metrics: { sharedAddress: sharedAddressFound, sharedDirector: sharedDirectorFound }
          });
        } else if (highCoBidding) {
          relationshipScore = 65;
          triggerReasons.push({
            rule: 'Frequent Co-Bidding Cluster',
            description: `Bidders have co-submitted bids together on 4+ previous tenders.`,
            severity: 'medium',
            metrics: { highCoBidding: true }
          });
        }
      }

      // Compute Weighted Composite Priority Score
      const weightedSum = 
        (priceScore * priceDeviationWeight) +
        (singleBidderScore * singleBidderWeight) +
        (winRateScore * winRateWeight) +
        (rotationScore * bidRotationWeight) +
        (relationshipScore * relationshipWeight);

      const maxSubScore = Math.max(priceScore, singleBidderScore, winRateScore, rotationScore, relationshipScore);
      const highSeverityCount = triggerReasons.filter(r => r.severity === 'high').length;

      // Boost composite score if multiple rules or high severity rules are triggered
      let compositeScore = Math.round(weightedSum * 1.5);
      if (highSeverityCount >= 2) {
        compositeScore = Math.max(compositeScore, Math.round(maxSubScore * 0.85) + 15);
      } else if (triggerReasons.length >= 1) {
        compositeScore = Math.max(compositeScore, Math.round(maxSubScore * 0.6) + 10);
      }
      compositeScore = Math.min(100, Math.max(0, compositeScore));

      // Determine Risk Level badge
      let riskLevel = 'Low';
      if (compositeScore >= 65 || highSeverityCount >= 2) riskLevel = 'High';
      else if (compositeScore >= 40 || triggerReasons.length > 0) riskLevel = 'Medium';

      return {
        tenderId: tId,
        tender,
        contract,
        winningVendor,
        bidsCount: tBids.length,
        compositeScore,
        riskLevel,
        isFlagged: compositeScore >= 40 || triggerReasons.length > 0,
        subScores: {
          priceScore,
          singleBidderScore,
          winRateScore,
          rotationScore,
          relationshipScore
        },
        triggerReasons
      };
    });

    // Sort cases by composite priority score descending
    return evaluatedCases.sort((a, b) => b.compositeScore - a.compositeScore);
  }
}

module.exports = new ScoringEngine();
