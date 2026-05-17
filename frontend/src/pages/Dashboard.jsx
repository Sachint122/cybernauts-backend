import React, { useEffect, useCallback } from 'react'; // useMemo add kiya
import ReactFlow, {
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import SocialNode from '../components/SocialNode';
import Sidebar from '../components/Sidebar';
import { useGraph } from '../context/GraphContext';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const Dashboard = React.memo(() => {
  const nodeTypes = React.useMemo(() => ({ social: SocialNode }), []);
  const edgeTypes = React.useMemo(() => ({}), []);
  const flowStyle = React.useMemo(() => ({ background: '#07090f' }), []);

  const { nodes: allNodes, edges: allEdges, loading, fetchGraph, setNodes, setEdges } = useGraph();
  const { user, logout, deleteAccount } = useAuth();
  const { openSidebar } = useSidebar();

  const [visibleCount, setVisibleCount] = React.useState(20);
  const nodes = React.useMemo(() => allNodes.slice(0, visibleCount), [allNodes, visibleCount]);
  const edges = React.useMemo(() => allEdges.filter(e => 
    nodes.some(n => n.id === e.source) && nodes.some(n => n.id === e.target)
  ), [allEdges, nodes]);

  useEffect(() => {
    if (visibleCount < allNodes.length) {
      const timer = setTimeout(() => setVisibleCount(prev => Math.min(prev + 10, allNodes.length)), 100);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, allNodes.length]);

  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => { fetchGraph(); }, []); // eslint-disable-line

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onNodesChangeHandler = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChangeHandler = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onNodeClick = (_e, node) => openSidebar(node.id);
  const handleSync = () => fetchGraph(true);

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden"
      style={{ background: '#07090f', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ─── NAVBAR ─── */}
      <header
        className="flex-none flex items-center justify-between px-4 sm:px-6 h-[64px] z-50 backdrop-blur-xl"
        style={{ background: 'rgba(10,13,22,0.96)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-none">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-white text-[10px] sm:text-xs shadow-lg"
              style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}
            >
              CN
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border-2 border-[#07090f] bg-emerald-400 animate-pulse" />
          </div>
          <div className="hidden xs:block">
            <p className="text-white font-extrabold text-[12px] sm:text-sm tracking-widest uppercase leading-none">Cybernauts</p>
            <p className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase mt-0.5" style={{ color: '#4f75ff' }}>
              Social Intelligence
            </p>
          </div>
        </div>

        {/* Center greeting (Desktop only) */}
        <div className="hidden lg:flex flex-col items-center gap-0.5">
          <p className="text-gray-400 text-[11px] font-medium">
            {getGreeting()},&nbsp;
            <span className="text-white font-black">{user?.name ?? '...'}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
              Connected
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">

          {/* Graph stats */}
          <div className="hidden md:flex items-center gap-2">
            <span
              className="text-[10px] font-black px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(37,99,235,0.12)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.25)' }}
            >
              {nodes.length} Nodes
            </span>
            <span
              className="text-[10px] font-black px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}
            >
              {edges.length} Links
            </span>
          </div>

          {/* Sync */}
          <button
            onClick={handleSync}
            className="group flex items-center gap-1.5 px-2 sm:px-3 py-2 text-[10px] sm:text-[11px] font-bold text-gray-400 hover:text-white rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden xs:inline">Sync</span>
          </button>

          <div className="w-px h-6 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* User chip + dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-2 pr-2 sm:pr-3 pl-1 py-1 rounded-2xl transition-all ${showDropdown ? 'brightness-125' : ''}`}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-white text-xs sm:text-sm uppercase flex-none"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#6d28d9)' }}
              >
                {user?.name?.charAt(0) ?? '?'}
              </div>
              <div className="text-left hidden xs:block">
                <p className="text-white text-[10px] sm:text-[11px] font-bold leading-none">{user?.name?.split(' ')[0]}</p>
              </div>
              <svg className={`w-3 h-3 text-gray-600 transition-transform duration-200 ${showDropdown ? 'rotate-180 text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            <div
              className={`absolute top-full right-0 mt-2 w-56 rounded-2xl shadow-2xl z-[100] overflow-hidden transition-all duration-200 origin-top-right 
                          ${showDropdown ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
              style={{ background: '#0f1321', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {/* Profile info */}
              <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white uppercase flex-none text-sm"
                    style={{ background: 'linear-gradient(135deg,#1d4ed8,#6d28d9)' }}
                  >
                    {user?.name?.charAt(0) ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold truncate">{user?.name}</p>
                    <p className="text-gray-500 text-[9px] truncate">{user?.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-4 py-2.5 text-center" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-sm font-black" style={{ color: '#60a5fa' }}>{nodes.length}</p>
                  <p className="text-gray-600 text-[9px] font-bold uppercase">Nodes</p>
                </div>
                <div className="px-4 py-2.5 text-center">
                  <p className="text-sm font-black" style={{ color: '#a78bfa' }}>{edges.length}</p>
                  <p className="text-gray-600 text-[9px] font-bold uppercase">Links</p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-2 space-y-1">
                <button
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone, and you must have 0 connections to proceed (un-link all friends first).")) {
                      await deleteAccount();
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-[11px] font-black"
                  style={{ color: '#fb923c' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,146,60,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Delete Account
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                <button
                  onClick={logout}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-[11px] font-black"
                  style={{ color: '#f87171' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Sign Out
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── CONTENT ─── */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10" style={{ background: '#07090f' }}>
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-10 h-10 rounded-full border-t-2 border-blue-500 animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping" />
              </div>
              <p className="text-white text-sm font-bold">Mapping Social Graph</p>
              <p className="text-gray-600 text-xs mt-1">Fetching connections for <span className="text-gray-400">{user?.name}</span>…</p>
            </div>
          ) : (
            <>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChangeHandler}
                onEdgesChange={onEdgesChangeHandler}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                style={flowStyle}
                onError={(errId, msg) => {
                  if (errId === '002') return; // ✅ nodeTypes/edgeTypes warning suppress
                  console.warn(msg);
                }}
              >
                <Background color="#111827" gap={24} size={1} />
                <Controls
                  style={{
                    background: '#0f1321',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                />
              </ReactFlow>

              {/* Onboarding Hint */}
              {user && !edges.some(e => e.source === (user.id || user._id) || e.target === (user.id || user._id)) && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-[90%] sm:w-max">
                  <div className="bg-[#141414] border border-blue-500/30 shadow-2xl shadow-blue-900/20 px-5 py-3 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-xs font-bold">Welcome to your network!</p>
                      <p className="text-gray-400 text-[10px] mt-0.5">Click on any node to view their profile and connect.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <Sidebar />
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;