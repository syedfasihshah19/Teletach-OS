import { useEffect, useState, useCallback } from 'react';
import { topologyApi } from '../services/api';
import ReactFlow, { Background, Controls, MiniMap, type Node, type Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { CpuChipIcon } from '@heroicons/react/24/outline';

const typeColors: Record<string, string> = {
  data_center: '#A855F7', core_router: '#3B82F6',
  aggregation_switch: '#06B6D4', cell_tower: '#22C55E',
};

export default function NetworkTopology() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    topologyApi.get().then(topo => {
      const positions: Record<string, Record<string, number>> = {
        North: { x: 100, y: 50 }, South: { x: 100, y: 350 }, East: { x: 500, y: 200 },
      };
      const n: Node[] = (topo.nodes || []).map((node: any, i: number) => {
        const base = positions[node.region] || { x: 300, y: 200 };
        const typeOffset = node.type === 'data_center' ? 0 : node.type === 'core_router' ? 120 : node.type === 'aggregation_switch' ? 240 : 360;
        return {
          id: node.id, type: 'default',
          position: { x: base.x + (i % 4) * 100, y: base.y + typeOffset },
          data: { label: node.name, ...node },
          style: {
            background: '#0F172A', border: `2px solid ${typeColors[node.type] || '#64748B'}`,
            borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#F8FAFC',
            fontFamily: "'Fira Code', monospace", minWidth: 70, textAlign: 'center' as const,
            boxShadow: node.status === 'down' ? '0 0 8px rgba(239,68,68,0.5)' : 'none',
          },
        };
      });
      const e: Edge[] = (topo.links || []).map((link: any) => {
        const util = link.utilization_pct || 0;
        const color = util > 80 ? '#EF4444' : util > 60 ? '#F59E0B' : '#22C55E';
        return {
          id: link.id, source: link.source_id, target: link.target_id,
          style: { stroke: color, strokeWidth: util > 70 ? 2.5 : 1.5 },
          label: `${util.toFixed(0)}%`, labelStyle: { fontSize: 9, fill: '#94A3B8', fontFamily: "'Fira Code', monospace" },
          labelBgStyle: { fill: '#0F172A', fillOpacity: 0.8 },
          animated: link.status === 'down',
        };
      });
      setNodes(n); setEdges(e);
    }).catch(() => {});
  }, []);

  const onNodeClick = useCallback((_: any, node: Node) => setSelectedNode(node.data), []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: 16, height: isMobile ? 'auto' : 'calc(100vh - 120px)' }}>
      {/* Graph */}
      <div className="tg-card" style={{ padding: 0, overflow: 'hidden', height: isMobile ? 320 : 'auto', minHeight: isMobile ? 320 : undefined }}>
        <ReactFlow nodes={nodes} edges={edges} onNodeClick={onNodeClick}
          fitView style={{ background: '#020617' }}>
          <Background color="#1E293B" gap={20} />
          <Controls style={{ background: '#1E293B', borderColor: '#334155' }} />
          <MiniMap style={{ background: '#0F172A' }} nodeColor="#3B82F6" maskColor="rgba(2,6,23,0.7)" />
        </ReactFlow>
      </div>

      {/* Node Detail */}
      <div className="tg-card" style={{ overflow: 'auto', maxHeight: isMobile ? 360 : undefined }}>
        {selectedNode ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: typeColors[selectedNode.type] || '#64748B' }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedNode.label}</span>
            </div>
            {[
              { label: 'Type', value: selectedNode.type?.replace(/_/g, ' ') },
              { label: 'Region', value: selectedNode.region },
              { label: 'Status', value: selectedNode.status },
              { label: 'ID', value: selectedNode.id },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.label}</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{f.value}</span>
              </div>
            ))}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <CpuChipIcon style={{ width: 36, height: 36, margin: '0 auto 8px', opacity: 0.3 }} />
              <div style={{ fontSize: 13 }}>Click a node for details</div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <span className="section-label" style={{ display: 'block', marginBottom: 8 }}>Legend</span>
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{type.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
