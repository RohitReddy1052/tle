import React, { useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useNavigate } from 'react-router-dom';

export default function RelationshipGraph({ graphData, height = 450, focusEntityId = null }) {
  const fgRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (fgRef.current && graphData && graphData.nodes.length > 0) {
      fgRef.current.d3Force('charge').strength(-220);
      fgRef.current.d3Force('link').distance(70);
    }
  }, [graphData]);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 text-sm">
        No graph connectivity data available for this case.
      </div>
    );
  }

  const handleNodeClick = (node) => {
    if (node.type === 'vendor') {
      navigate(`/vendors/${node.id}`);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
      <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 flex items-center space-x-3">
        <span className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
          <span>Vendor</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span>Shared Director/Address</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
          <span>Tender</span>
        </span>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={750}
        height={height}
        backgroundColor="#030712"
        nodeRelSize={7}
        nodeId="id"
        linkSource="source"
        linkTarget="target"
        linkLabel={(link) => link.label || link.type}
        nodeLabel={(node) => `${node.name} (${node.type.toUpperCase()})`}
        onNodeClick={handleNodeClick}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 11 / globalScale;
          ctx.font = `${fontSize}px Inter, sans-serif`;

          const isTender = node.type === 'tender';
          const isFocus = node.id === focusEntityId;

          // Color selection
          let color = '#38bdf8'; // Vendor cyan
          if (isTender) color = '#64748b'; // Tender slate
          if (node.community === 1 || node.hasRisk) color = '#f43f5e'; // Rose

          if (isFocus) color = '#fbbf24'; // Amber highlight for focused node

          // Draw Node Circle
          const radius = isTender ? 6 : 8;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.lineWidth = 1.5 / globalScale;
          ctx.strokeStyle = '#0f172a';
          ctx.stroke();

          // Outer ring for focus or vendor
          if (!isTender) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius + 2.5, 0, 2 * Math.PI, false);
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.8 / globalScale;
            ctx.stroke();
          }

          // Node Text Label
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isFocus ? '#fbbf24' : (isTender ? '#94a3b8' : '#f1f5f9');
          ctx.fillText(label, node.x, node.y + radius + 8 / globalScale);
        }}
        linkColor={(link) => {
          if (link.type === 'shared_address' || link.type === 'shared_director') return '#f43f5e';
          if (link.type === 'co_bidding') return '#f59e0b';
          return '#334155';
        }}
        linkWidth={(link) => {
          if (link.type === 'shared_address' || link.type === 'shared_director') return 2.5;
          if (link.type === 'co_bidding') return 2.0;
          return 1.0;
        }}
        linkDirectionalParticles={(link) => (link.type === 'co_bidding' ? 2 : 0)}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={3}
      />
    </div>
  );
}
