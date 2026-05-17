import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

import { useApi } from 'devil-frontend';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

import { MarkerType } from 'reactflow';

const GraphContext = createContext();

export const GraphProvider = ({ children }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(false);

  const { get } = useApi();
  const { user } = useAuth();

  // In-flight guard: prevents duplicate concurrent calls but allows fresh calls on each real page load
  const isFetching = React.useRef(false);

  const fetchGraph = useCallback(async (force = false) => {
    if (isFetching.current && !force) return;
    isFetching.current = true;

    setLoading(true);
    try {
      const response = await get("/graph");
      const data = response.data;

      if (!data || !data.nodes) return;

      const newNodes = data.nodes.map((node, i) => {
        const radius = i === 0 ? 0 : 180 + Math.floor((i - 1) / 8) * 220; // Concentric rings
        const angle = i === 0 ? 0 : ((i - 1) % 8) * (Math.PI * 2) / 8 + (Math.floor((i - 1) / 8) * 0.4); // Staggered angles
        return {
          id: node.id || node._id,
          type: 'social',
          data: {
            name: node.name,
            popularityScore: node.popularityScore,
            hobbies: node.hobbies,
            hobbiesCount: node.hobbies?.length || 0,
            isCurrentUser: user && (user.id === (node.id || node._id) || user._id === (node.id || node._id))
          },
          position: { x: radius * Math.cos(angle), y: radius * Math.sin(angle) },
        };
      });

      const edgeData = data.edges || data.links || [];
      const newEdges = edgeData.map((edge) => ({
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        animated: true,
        type: 'smoothstep', // Better routing
        style: { stroke: 'rgba(59, 130, 246, 0.35)', strokeWidth: 1.2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(59, 130, 246, 0.35)' },
      }));

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err) {
      toast.error("Failed to fetch social graph");
    } finally {
      setLoading(false);
      isFetching.current = false; // Reset so force-refresh works next time
    }
  }, []); // eslint-disable-line





  // ── Surgical edge updates — no re-fetch, no node re-render ──────────────────
  const EDGE_STYLE = { stroke: 'rgba(59, 130, 246, 0.35)', strokeWidth: 1.2 };

  const linkEdge = useCallback((sourceId, targetId) => {
    const forward  = `${sourceId}-${targetId}`;
    const backward = `${targetId}-${sourceId}`;
    setEdges((prev) => {
      // Don't duplicate
      if (prev.some((e) => e.id === forward || e.id === backward)) return prev;
      return [
        ...prev,
        {
          id: forward,
          source: sourceId,
          target: targetId,
          animated: true,
          type: 'smoothstep',
          style: EDGE_STYLE,
          markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(59, 130, 246, 0.35)' },
        },
      ];
    });
  }, [setEdges]); // eslint-disable-line

  const unlinkEdge = useCallback((sourceId, targetId) => {
    setEdges((prev) =>
      prev.filter(
        (e) =>
          !(
            (e.source === sourceId && e.target === targetId) ||
            (e.source === targetId && e.target === sourceId)
          )
      )
    );
  }, [setEdges]); // eslint-disable-line

  const updateNode = useCallback((nodeId, dataUpdate) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, ...dataUpdate } };
        }
        return n;
      })
    );
  }, [setNodes]);

  const value = useMemo(() => ({
    nodes,
    edges,
    loading,
    fetchGraph,
    setNodes,
    setEdges,
    linkEdge,
    unlinkEdge,
    updateNode,
  }), [nodes, edges, loading, fetchGraph, linkEdge, unlinkEdge, updateNode]); // eslint-disable-line



  return (
    <GraphContext.Provider value={value}>
      {children}
    </GraphContext.Provider>
  );
};



export const useGraph = () => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context;
};
