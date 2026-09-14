const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Vendor = require('../models/Vendor');
const Tender = require('../models/Tender');
const Bid = require('../models/Bid');
const Contract = require('../models/Contract');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');

const categories = [
  'Medical Supplies & Equipment',
  'IT Infrastructure & Software',
  'Road Infrastructure & Construction',
  'Heavy Machinery & Vehicles',
  'Public Education & School Supplies',
  'Energy & Power Grid Maintenance'
];

const seedData = async () => {
  try {
    console.log('--- Clearing Existing Collections ---');
    await Vendor.deleteMany({});
    await Tender.deleteMany({});
    await Bid.deleteMany({});
    await Contract.deleteMany({});
    await Payment.deleteMany({});
    await Settings.deleteMany({});

    // 1. Initialize Default Settings Weights
    await Settings.create({
      priceDeviationWeight: 0.30,
      singleBidderWeight: 0.20,
      winRateWeight: 0.15,
      bidRotationWeight: 0.15,
      relationshipWeight: 0.20
    });

    console.log('--- Generating Synthetic Vendors (~50) ---');
    const vendors = [];

    // Embedded Anomaly Ring 1: Medical Rotation Ring Vendors
    const vAlpha = await Vendor.create({
      name: 'Alpha Care Medical Ltd',
      registrationDate: new Date('2019-03-15'),
      address: '22 Healthcare Plaza, Sector 12, Capital City',
      directorNames: ['Dr. Arthur Vance', 'Eleanor Vance'],
      taxId: 'TAX-MED-9011'
    });
    vendors.push(vAlpha);

    const vBeta = await Vendor.create({
      name: 'Beta Med Solutions',
      registrationDate: new Date('2019-04-10'),
      address: '45 Health Commerce Way, Suite 3, Capital City',
      directorNames: ['Marcus Brody', 'Eleanor Vance'], // Shared director with Alpha!
      taxId: 'TAX-MED-9012'
    });
    vendors.push(vBeta);

    const vGamma = await Vendor.create({
      name: 'Gamma Health Global',
      registrationDate: new Date('2019-05-01'),
      address: '22 Healthcare Plaza, Sector 12, Capital City', // Shared address with Alpha!
      directorNames: ['Dr. Arthur Vance'],
      taxId: 'TAX-MED-9013'
    });
    vendors.push(vGamma);

    // Embedded Anomaly 2: Single Bidder IT Vendor
    const vApexTech = await Vendor.create({
      name: 'Apex Tech Solutions Inc',
      registrationDate: new Date('2017-08-20'),
      address: '88 Cybernetic Parkway, Innovation Hub',
      directorNames: ['David K. Miller'],
      taxId: 'TAX-IT-7701'
    });
    vendors.push(vApexTech);

    // Embedded Anomaly 3: Shared Director/Address Construction Cluster
    const vApexCivil = await Vendor.create({
      name: 'Apex Civil Works Ltd',
      registrationDate: new Date('2020-01-15'),
      address: '104 Commercial Tower, Suite 4B, Sector 7',
      directorNames: ['Robert Sterling', 'Julian Vance'],
      taxId: 'TAX-CONST-1001'
    });
    vendors.push(vApexCivil);

    const vSterlingCon = await Vendor.create({
      name: 'Sterling Construction Co',
      registrationDate: new Date('2020-02-10'),
      address: '104 Commercial Tower, Suite 4B, Sector 7', // Shared address!
      directorNames: ['Robert Sterling'], // Shared director!
      taxId: 'TAX-CONST-1002'
    });
    vendors.push(vSterlingCon);

    const vUrbanInfra = await Vendor.create({
      name: 'Urban Infrastructure Partners',
      registrationDate: new Date('2020-03-01'),
      address: '104 Commercial Tower, Suite 4B, Sector 7', // Shared address!
      directorNames: ['Robert Sterling', 'Claire Bennett'], // Shared director!
      taxId: 'TAX-CONST-1003'
    });
    vendors.push(vUrbanInfra);

    // Embedded Anomaly 4: Heavy Machinery Price Inflation Group
    const vVanguardHeavy = await Vendor.create({
      name: 'Vanguard Heavy Industries',
      registrationDate: new Date('2018-06-12'),
      address: '500 Industrial Ring Road, Zone B',
      directorNames: ['Vikram Patel'],
      taxId: 'TAX-HVY-3301'
    });
    vendors.push(vVanguardHeavy);

    const vTitanFleet = await Vendor.create({
      name: 'Titan Fleet Services',
      registrationDate: new Date('2018-07-04'),
      address: '502 Industrial Ring Road, Zone B',
      directorNames: ['Sanjay Gupta'],
      taxId: 'TAX-HVY-3302'
    });
    vendors.push(vTitanFleet);

    // Generate ~40 more realistic synthetic vendors
    const vendorNamesPrefixes = ['Global', 'Apex', 'Premier', 'Standard', 'National', 'Metro', 'Pacific', 'Alliance', 'Beacon', 'Summit'];
    const vendorSectors = ['Supplies', 'Logistics', 'Engineering', 'Systems', 'Services', 'Technologies', 'Networks', 'Enterprises'];

    for (let i = 1; i <= 40; i++) {
      const p = vendorNamesPrefixes[i % vendorNamesPrefixes.length];
      const s = vendorSectors[i % vendorSectors.length];
      const category = categories[i % categories.length];

      const v = await Vendor.create({
        name: `${p} ${s} Group ${i}`,
        registrationDate: new Date(2018 + (i % 5), (i % 12), (i % 28) + 1),
        address: `${100 + i * 15} Commerce Blvd, Sector ${1 + (i % 10)}, Metropolis`,
        directorNames: [`Director ${String.fromCharCode(65 + (i % 26))}. Miller`, `Partner ${i}`],
        taxId: `TAX-GEN-${1000 + i}`
      });
      vendors.push(v);
    }

    console.log(`Created ${vendors.length} Vendors.`);

    console.log('--- Generating Synthetic Tenders & Embedded Anomaly Scenarios (~200) ---');

    const tenders = [];
    const bids = [];
    const contracts = [];
    const payments = [];

    let tenderCount = 0;

    // SCENARIO 1: Embedded Medical Supplies Bid Rotation Ring (12 Tenders)
    const medRotationRingVendors = [vAlpha, vBeta, vGamma];
    for (let i = 0; i < 12; i++) {
      tenderCount++;
      const pubDate = new Date(2023, i % 12, (i * 2) + 1);
      const deadDate = new Date(pubDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      const estVal = 450000 + (i * 25000);

      const tender = await Tender.create({
        title: `Hospital ICU Medical Equipment & Supplies Batch #${100 + i}`,
        category: 'Medical Supplies & Equipment',
        estimatedValue: estVal,
        publishDate: pubDate,
        deadline: deadDate,
        status: 'awarded'
      });
      tenders.push(tender);

      // Designated Winner rotates: 0 -> vAlpha, 1 -> vBeta, 2 -> vGamma
      const winningVendorIndex = i % 3;
      const winnerVendor = medRotationRingVendors[winningVendorIndex];

      // Generate bids from all 3 ring vendors
      for (let j = 0; j < medRotationRingVendors.length; j++) {
        const vendor = medRotationRingVendors[j];
        const isWinner = (j === winningVendorIndex);

        // Inflation ratio: bids are between 1.15x and 1.25x estimated value!
        const bidRatio = isWinner ? 1.16 + (j * 0.01) : 1.20 + (j * 0.015);
        const bidAmount = Math.round(estVal * bidRatio);

        const bid = await Bid.create({
          tenderId: tender._id,
          vendorId: vendor._id,
          bidAmount: bidAmount,
          submittedAt: new Date(pubDate.getTime() + (j + 1) * 24 * 60 * 60 * 1000),
          status: isWinner ? 'accepted' : 'rejected'
        });
        bids.push(bid);
      }

      // Create Awarded Contract
      const winnerBid = bids.find(b => b.tenderId.toString() === tender._id.toString() && b.status === 'accepted');
      const contract = await Contract.create({
        tenderId: tender._id,
        winningVendorId: winnerVendor._id,
        awardedValue: winnerBid.bidAmount,
        awardDate: new Date(deadDate.getTime() + 5 * 24 * 60 * 60 * 1000)
      });
      contracts.push(contract);

      // Create Payment
      const payment = await Payment.create({
        contractId: contract._id,
        amount: winnerBid.bidAmount,
        paymentDate: new Date(contract.awardDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      });
      payments.push(payment);
    }

    // SCENARIO 2: Embedded Sole-Bidder Pattern (IT Infrastructure, 10 Tenders)
    for (let i = 0; i < 10; i++) {
      tenderCount++;
      const pubDate = new Date(2023, (i * 2) % 12, (i * 2) + 2);
      const deadDate = new Date(pubDate.getTime() + 10 * 24 * 60 * 60 * 1000);
      const estVal = 850000 + (i * 50000);

      const tender = await Tender.create({
        title: `Government Data Center Cloud Software Procurement Phase ${i + 1}`,
        category: 'IT Infrastructure & Software',
        estimatedValue: estVal,
        publishDate: pubDate,
        deadline: deadDate,
        status: 'awarded'
      });
      tenders.push(tender);

      // Only 1 bid submitted by Apex Tech Solutions at 99.8% of estimated value!
      const bidAmount = Math.round(estVal * 0.998);
      const bid = await Bid.create({
        tenderId: tender._id,
        vendorId: vApexTech._id,
        bidAmount,
        submittedAt: new Date(pubDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: 'accepted'
      });
      bids.push(bid);

      const contract = await Contract.create({
        tenderId: tender._id,
        winningVendorId: vApexTech._id,
        awardedValue: bidAmount,
        awardDate: new Date(deadDate.getTime() + 3 * 24 * 60 * 60 * 1000)
      });
      contracts.push(contract);

      const payment = await Payment.create({
        contractId: contract._id,
        amount: bidAmount,
        paymentDate: new Date(contract.awardDate.getTime() + 25 * 24 * 60 * 60 * 1000)
      });
      payments.push(payment);
    }

    // SCENARIO 3: Shared Address & Director Construction Cluster (8 Tenders)
    const constClusterVendors = [vApexCivil, vSterlingCon, vUrbanInfra];
    for (let i = 0; i < 8; i++) {
      tenderCount++;
      const pubDate = new Date(2023, i % 12, (i * 3) + 1);
      const deadDate = new Date(pubDate.getTime() + 20 * 24 * 60 * 60 * 1000);
      const estVal = 2500000 + (i * 300000);

      const tender = await Tender.create({
        title: `Metropolitan Expressway Bridge Construction Segment #${201 + i}`,
        category: 'Road Infrastructure & Construction',
        estimatedValue: estVal,
        publishDate: pubDate,
        deadline: deadDate,
        status: 'awarded'
      });
      tenders.push(tender);

      const winnerIdx = i % 3;
      const winnerVendor = constClusterVendors[winnerIdx];

      for (let j = 0; j < constClusterVendors.length; j++) {
        const v = constClusterVendors[j];
        const isWinner = (j === winnerIdx);
        const bidRatio = isWinner ? 1.08 : 1.12 + (j * 0.02);
        const bidAmount = Math.round(estVal * bidRatio);

        const bid = await Bid.create({
          tenderId: tender._id,
          vendorId: v._id,
          bidAmount,
          submittedAt: new Date(pubDate.getTime() + (j + 2) * 24 * 60 * 60 * 1000),
          status: isWinner ? 'accepted' : 'rejected'
        });
        bids.push(bid);
      }

      const contract = await Contract.create({
        tenderId: tender._id,
        winningVendorId: winnerVendor._id,
        awardedValue: Math.round(estVal * 1.08),
        awardDate: new Date(deadDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      });
      contracts.push(contract);

      const payment = await Payment.create({
        contractId: contract._id,
        amount: Math.round(estVal * 1.08),
        paymentDate: new Date(contract.awardDate.getTime() + 45 * 24 * 60 * 60 * 1000)
      });
      payments.push(payment);
    }

    // SCENARIO 4: Heavy Machinery Price Inflation Cluster (8 Tenders)
    const hvyVendors = [vVanguardHeavy, vTitanFleet];
    for (let i = 0; i < 8; i++) {
      tenderCount++;
      const pubDate = new Date(2023, (i * 2) % 12, (i * 3) + 2);
      const deadDate = new Date(pubDate.getTime() + 15 * 24 * 60 * 60 * 1000);
      const estVal = 1200000 + (i * 150000);

      const tender = await Tender.create({
        title: `Public Transit Heavy Excavator & Crane Fleet Renewal #${400 + i}`,
        category: 'Heavy Machinery & Vehicles',
        estimatedValue: estVal,
        publishDate: pubDate,
        deadline: deadDate,
        status: 'awarded'
      });
      tenders.push(tender);

      // Bids are +42% inflated above estimated value, with razor thin 0.2% variance
      for (let j = 0; j < hvyVendors.length; j++) {
        const v = hvyVendors[j];
        const isWinner = (j === 0);
        const bidRatio = 1.42 + (j * 0.003); // Razor thin spread
        const bidAmount = Math.round(estVal * bidRatio);

        const bid = await Bid.create({
          tenderId: tender._id,
          vendorId: v._id,
          bidAmount,
          submittedAt: new Date(pubDate.getTime() + (j + 1) * 24 * 60 * 60 * 1000),
          status: isWinner ? 'accepted' : 'rejected'
        });
        bids.push(bid);
      }

      const contract = await Contract.create({
        tenderId: tender._id,
        winningVendorId: vVanguardHeavy._id,
        awardedValue: Math.round(estVal * 1.42),
        awardDate: new Date(deadDate.getTime() + 4 * 24 * 60 * 60 * 1000)
      });
      contracts.push(contract);

      const payment = await Payment.create({
        contractId: contract._id,
        amount: Math.round(estVal * 1.42),
        paymentDate: new Date(contract.awardDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      });
      payments.push(payment);
    }

    // GENERATE NORMAL / NON-ANOMALOUS TENDERS (~160 Tenders to reach ~200 total)
    console.log('--- Generating Normal Category Benchmark Tenders (~160) ---');

    for (let i = 1; i <= 160; i++) {
      tenderCount++;
      const cat = categories[i % categories.length];
      const pubDate = new Date(2023, i % 12, (i % 28) + 1);
      const deadDate = new Date(pubDate.getTime() + 15 * 24 * 60 * 60 * 1000);
      const baseEstVal = 200000 + (i * 25000) + ((i % 7) * 100000);

      const tender = await Tender.create({
        title: `${cat} Procurement & Service Contract #${1000 + i}`,
        category: cat,
        estimatedValue: baseEstVal,
        publishDate: pubDate,
        deadline: deadDate,
        status: 'awarded'
      });
      tenders.push(tender);

      // Select 3-4 random non-ring vendors
      const numBidders = 2 + (i % 3); // 2 to 4 bidders
      const selectedVendorIndices = new Set();
      while (selectedVendorIndices.size < numBidders) {
        // Pick from index 10 to 49 (normal vendors)
        const randIdx = 10 + (Math.floor(Math.random() * 35));
        if (vendors[randIdx]) {
          selectedVendorIndices.add(randIdx);
        }
      }

      const tenderBidders = Array.from(selectedVendorIndices).map(idx => vendors[idx]);
      let lowestBidAmount = Infinity;
      let winningVendor = tenderBidders[0];

      for (let j = 0; j < tenderBidders.length; j++) {
        const v = tenderBidders[j];
        // Normal bids range realistically from 0.88x to 1.02x estimated value
        const randomRatio = 0.88 + (Math.random() * 0.14);
        const bidAmount = Math.round(baseEstVal * randomRatio);

        if (bidAmount < lowestBidAmount) {
          lowestBidAmount = bidAmount;
          winningVendor = v;
        }

        const bid = await Bid.create({
          tenderId: tender._id,
          vendorId: v._id,
          bidAmount,
          submittedAt: new Date(pubDate.getTime() + (j + 1) * 24 * 60 * 60 * 1000),
          status: 'submitted'
        });
        bids.push(bid);
      }

      // Mark lowest bid as accepted
      await Bid.updateOne(
        { tenderId: tender._id, vendorId: winningVendor._id, bidAmount: lowestBidAmount },
        { status: 'accepted' }
      );

      // Create Awarded Contract
      const contract = await Contract.create({
        tenderId: tender._id,
        winningVendorId: winningVendor._id,
        awardedValue: lowestBidAmount,
        awardDate: new Date(deadDate.getTime() + 5 * 24 * 60 * 60 * 1000)
      });
      contracts.push(contract);

      // Create Payment
      const payment = await Payment.create({
        contractId: contract._id,
        amount: lowestBidAmount,
        paymentDate: new Date(contract.awardDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      });
      payments.push(payment);
    }

    console.log(`Seed Complete! Total Stats:`);
    console.log(`- Vendors: ${vendors.length}`);
    console.log(`- Tenders: ${tenders.length}`);
    console.log(`- Bids: ${bids.length}`);
    console.log(`- Contracts: ${contracts.length}`);
    console.log(`- Payments: ${payments.length}`);

    return {
      vendorsCount: vendors.length,
      tendersCount: tenders.length,
      bidsCount: bids.length,
      contractsCount: contracts.length,
      paymentsCount: payments.length
    };
  } catch (err) {
    console.error('Error during data seeding:', err);
    throw err;
  }
};

// Allow standalone execution (`node scripts/seed.js`)
if (require.main === module) {
  connectDB().then(async () => {
    await seedData();
    console.log('Seeding finished successfully. Exiting.');
    process.exit(0);
  }).catch(err => {
    console.error('Seeding script failed:', err);
    process.exit(1);
  });
}

module.exports = seedData;
