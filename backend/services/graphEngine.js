const Graph = require('graphology');
const louvain = require('graphology-communities-louvain');

class GraphEngine {
  /**
   * Builds an undirected Graphology graph containing Vendor and Tender nodes
   * with edges representing shared attributes, co-bidding, or winning bids.
   */
  buildGraph(vendors, tenders, bids, contracts) {
    const graph = new Graph({ multi: true, type: 'undirected', allowSelfLoops: false });

    // 1. Add Vendor Nodes
    vendors.forEach(v => {
      const vId = v._id.toString();
      if (!graph.hasNode(vId)) {
        graph.addNode(vId, {
          id: vId,
          name: v.name,
          type: 'vendor',
          address: v.address,
          directors: v.directorNames || [],
          taxId: v.taxId,
          val: 12
        });
      }
    });

    // 2. Add Tender Nodes
    tenders.forEach(t => {
      const tId = t._id.toString();
      if (!graph.hasNode(tId)) {
        graph.addNode(tId, {
          id: tId,
          name: t.title,
          type: 'tender',
          category: t.category,
          estimatedValue: t.estimatedValue,
          val: 8
        });
      }
    });

    // 3. Connect Vendors to Tenders via Bids
    bids.forEach(b => {
      const vId = b.vendorId?._id?.toString() || b.vendorId?.toString();
      const tId = b.tenderId?._id?.toString() || b.tenderId?.toString();

      if (vId && tId && graph.hasNode(vId) && graph.hasNode(tId)) {
        const edgeKey = `bid_${vId}_${tId}`;
        if (!graph.hasEdge(edgeKey)) {
          graph.addEdgeWithKey(edgeKey, vId, tId, {
            type: 'bid',
            label: 'Submitted Bid',
            bidAmount: b.bidAmount,
            weight: 1
          });
        }
      }
    });

    // 4. Connect Vendors to each other via Shared Address & Shared Directors
    for (let i = 0; i < vendors.length; i++) {
      for (let j = i + 1; j < vendors.length; j++) {
        const v1 = vendors[i];
        const v2 = vendors[j];
        const v1Id = v1._id.toString();
        const v2Id = v2._id.toString();

        if (!graph.hasNode(v1Id) || !graph.hasNode(v2Id)) continue;

        // Shared Address Check (case-insensitive clean match)
        const addr1 = (v1.address || '').toLowerCase().trim();
        const addr2 = (v2.address || '').toLowerCase().trim();

        if (addr1 && addr2 && addr1 === addr2) {
          const edgeKey = `rel_addr_${v1Id}_${v2Id}`;
          if (!graph.hasEdge(edgeKey)) {
            graph.addEdgeWithKey(edgeKey, v1Id, v2Id, {
              type: 'shared_address',
              label: 'Shared Address',
              detail: v1.address,
              weight: 3
            });
          }
        }

        // Shared Directors Check
        const d1 = (v1.directorNames || []).map(d => d.toLowerCase().trim());
        const d2 = (v2.directorNames || []).map(d => d.toLowerCase().trim());
        const sharedDirectors = d1.filter(d => d2.includes(d));

        if (sharedDirectors.length > 0) {
          const edgeKey = `rel_dir_${v1Id}_${v2Id}`;
          if (!graph.hasEdge(edgeKey)) {
            graph.addEdgeWithKey(edgeKey, v1Id, v2Id, {
              type: 'shared_director',
              label: `Shared Director (${sharedDirectors.join(', ')})`,
              detail: sharedDirectors.join(', '),
              weight: 4
            });
          }
        }
      }
    }

    // 5. Co-Bidding Edges between Vendors
    // Group bids by tenderId
    const bidsByTender = {};
    bids.forEach(b => {
      const tId = b.tenderId?._id?.toString() || b.tenderId?.toString();
      const vId = b.vendorId?._id?.toString() || b.vendorId?.toString();
      if (tId && vId) {
        if (!bidsByTender[tId]) bidsByTender[tId] = [];
        bidsByTender[tId].push(vId);
      }
    });

    const coBiddingCounts = {};
    Object.values(bidsByTender).forEach(vList => {
      const uniqueVendors = Array.from(new Set(vList));
      for (let i = 0; i < uniqueVendors.length; i++) {
        for (let j = i + 1; j < uniqueVendors.length; j++) {
          const pairKey = [uniqueVendors[i], uniqueVendors[j]].sort().join('::');
          coBiddingCounts[pairKey] = (coBiddingCounts[pairKey] || 0) + 1;
        }
      }
    });

    Object.entries(coBiddingCounts).forEach(([pairKey, count]) => {
      if (count >= 2) { // Flag co-bidding if co-bidded on 2 or more tenders
        const [v1Id, v2Id] = pairKey.split('::');
        if (graph.hasNode(v1Id) && graph.hasNode(v2Id)) {
          const edgeKey = `cobid_${v1Id}_${v2Id}`;
          if (!graph.hasEdge(edgeKey)) {
            graph.addEdgeWithKey(edgeKey, v1Id, v2Id, {
              type: 'co_bidding',
              label: `Co-bidded ${count} Tenders`,
              count,
              weight: Math.min(count, 5)
            });
          }
        }
      }
    });

    // 6. Community Detection using Louvain
    try {
      if (graph.order > 0) {
        louvain.assign(graph, { property: 'community' });
      }
    } catch (e) {
      console.warn('Louvain community detection warning:', e.message);
    }

    return graph;
  }

  /**
   * Extract a localized subgraph for a specific tender or vendor ID
   * suitable for react-force-graph-2d
   */
  getSubgraph(graph, entityId) {
    if (!graph.hasNode(entityId)) {
      return { nodes: [], links: [] };
    }

    const neighborIds = new Set([entityId]);
    
    // First-degree neighbors
    graph.forEachNeighbor(entityId, neighbor => {
      neighborIds.add(neighbor);
      // 2nd-degree neighbors for vendors to capture shared director rings
      graph.forEachNeighbor(neighbor, secondNeighbor => {
        neighborIds.add(secondNeighbor);
      });
    });

    const nodesMap = new Map();
    const links = [];

    neighborIds.forEach(nId => {
      const attrs = graph.getNodeAttributes(nId);
      nodesMap.set(nId, {
        id: nId,
        name: attrs.name,
        type: attrs.type,
        category: attrs.category,
        address: attrs.address,
        directors: attrs.directors,
        taxId: attrs.taxId,
        community: attrs.community !== undefined ? attrs.community : 0,
        val: attrs.type === 'tender' ? 14 : (nId === entityId ? 18 : 10)
      });
    });

    graph.forEachEdge((edge, attrs, source, target) => {
      if (neighborIds.has(source) && neighborIds.has(target)) {
        links.push({
          id: edge,
          source,
          target,
          type: attrs.type,
          label: attrs.label,
          detail: attrs.detail,
          weight: attrs.weight || 1
        });
      }
    });

    return {
      nodes: Array.from(nodesMap.values()),
      links
    };
  }
}

module.exports = new GraphEngine();
