import React, { useEffect, useState } from 'react';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import { useApi } from 'devil-frontend';

const Sidebar = () => {
  const { get } = useApi();
  const { user: authUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHobbies, setEditHobbies] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [availableHobbies, setAvailableHobbies] = useState([]);
  const {
    isOpen,
    details: user,
    recommendations,
    loading,
    closeSidebar,
    selectedUserId: userId,
    fetchProfile,
    toggleConnection,
    updateProfile,
    sendFeedback,
  } = useSidebar();

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile(userId);
      setIsEditing(false); // Reset edit state when switching nodes
    }
  }, [isOpen, userId]); // eslint-disable-line

  useEffect(() => {
    if (isEditing && availableHobbies.length === 0) {
      get('/hobbies').then(res => {
        if (res.data?.data) {
          setAvailableHobbies(res.data.data.hobbies || res.data.data);
        } else if (res.data) {
          setAvailableHobbies(res.data.hobbies || res.data);
        }
      }).catch(() => {});
    }
  }, [isEditing]); // eslint-disable-line

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      if (user.hobbies) {
        setEditHobbies(user.hobbies.map(h => typeof h === 'object' ? h.name : h).join(', '));
      } else {
        setEditHobbies('');
      }
    }
  }, [user]);

  if (!isOpen || !userId) return null;

  const handleLink   = (targetId) => toggleConnection(userId, targetId, false);
  const handleUnlink = (targetId) => toggleConnection(userId, targetId, true);

  const isAlreadyFriend = (id) => user?.friends?.some((f) => f.id === id);
  const isCurrentUser = authUser && (authUser.id === userId || authUser._id === userId);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const newHobbies = editHobbies.split(',').map(s => s.trim()).filter(s => s);
    const success = await updateProfile(userId, { name: editName, hobbies: newHobbies });
    if (success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  return (
    <div
      className="fixed lg:relative right-0 top-0 h-full w-full sm:w-[400px] flex flex-col z-[60] lg:z-20 transition-transform duration-300 shadow-2xl"
      style={{ background: '#0c0f1a', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h2 className="text-base font-extrabold text-white tracking-tight">Node Profile</h2>
          <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#4f75ff' }}>
            Social Intelligence
          </p>
        </div>
        <button
          onClick={closeSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}>
        {loading && !user ? (
          /* Initial skeleton load */
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-10 h-10 rounded-full border-t-2 border-blue-500 animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Syncing…</p>
          </div>
        ) : user ? (
          <div className="p-5 space-y-6">

            {/* ── Identity card ── */}
            <div
              className="p-5 rounded-2xl"
              style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.15),rgba(124,58,237,0.08))', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-none uppercase shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#1d4ed8,#6d28d9)' }}
                >
                  {user.name?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-[#07090f] text-white text-sm font-bold px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Your Name"
                        disabled={isSaving}
                      />
                      <input 
                        type="text" 
                        value={editHobbies}
                        onChange={(e) => setEditHobbies(e.target.value)}
                        className="w-full bg-[#07090f] text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Hobbies (comma separated)"
                        disabled={isSaving}
                      />
                      
                      {/* Available Hobbies Chips */}
                      {availableHobbies?.length > 0 && (
                         <div className="flex flex-wrap gap-1 mt-1">
                           {Array.isArray(availableHobbies) && availableHobbies.slice(0, 15).map(h => {
                             const hobbyName = typeof h === 'object' ? h.name : h;
                             const isSelected = editHobbies.toLowerCase().includes(hobbyName.toLowerCase());
                             if (isSelected) return null; // Hide if already typed
                             return (
                               <button 
                                 key={typeof h === 'object' ? h._id : h} 
                                 onClick={() => setEditHobbies(prev => (prev ? `${prev}, ${hobbyName}` : hobbyName))}
                                 disabled={isSaving}
                                 className="text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all"
                                 style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', borderColor: 'rgba(59,130,246,0.2)' }}
                               >
                                 + {hobbyName}
                               </button>
                             );
                           })}
                         </div>
                      )}
                      
                      <div className="flex gap-2 mt-1">
                        <button 
                          onClick={handleSaveProfile} 
                          disabled={isSaving}
                          className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-1 rounded-md transition-colors"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                          onClick={() => { 
                            setIsEditing(false); 
                            setEditName(user.name || ''); 
                            setEditHobbies(user.hobbies ? user.hobbies.map(h => typeof h === 'object' ? h.name : h).join(', ') : ''); 
                          }}
                          disabled={isSaving}
                          className="text-[10px] bg-gray-700 hover:bg-gray-600 text-white font-bold px-2.5 py-1 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group flex items-center gap-2">
                      <h3 className="text-lg font-black text-white leading-tight truncate">{user.name}</h3>
                      {isCurrentUser && (
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="opacity-70 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-300"
                          title="Edit Profile"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      )}
                    </div>
                  )}

                  {!isEditing && user.email && <p className="text-gray-500 text-xs mt-0.5 truncate">{user.email}</p>}
                  
                  {!isEditing && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">{isCurrentUser ? "You (Active session)" : "Active Node"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)' }}>
                  <p className="text-lg font-black" style={{ color: '#60a5fa' }}>
                    {typeof user.popularityScore === 'number' ? user.popularityScore.toFixed(1) : '—'}
                  </p>
                  <p className="text-[9px] font-bold uppercase text-gray-500 mt-0.5">Popularity</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <p className="text-lg font-black" style={{ color: '#a78bfa' }}>{user.friends?.length ?? 0}</p>
                  <p className="text-[9px] font-bold uppercase text-gray-500 mt-0.5">Connections</p>
                </div>
              </div>
            </div>

            {/* ── Hobbies ── */}
            {user.hobbies?.length > 0 && (
              <section>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2.5">Hobbies</p>
                <div className="flex flex-wrap gap-2">
                  {user.hobbies.map((h, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all hover:brightness-125 cursor-default"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {typeof h === 'object' ? h.name : h}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* ── Direct connections ── */}
            <section>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2.5">
                Connections {loading && <span className="ml-1 text-blue-500">↻</span>}
              </p>
              {user.friends?.length === 0 && (
                <p className="text-xs text-gray-500 italic py-2">No connections yet.</p>
              )}
              <div className="space-y-2">
                {user.friends?.map((friend) => (
                  <div
                    key={friend.id}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all group ${friend._optimistic ? 'opacity-50' : ''}`}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-none uppercase"
                        style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa' }}
                      >
                        {friend.name?.charAt(0) ?? '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{friend.name}</p>
                        <p className="text-[9px] text-gray-600 font-medium">Score: {friend.popularityScore ?? '—'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnlink(friend.id)}
                      disabled={friend._optimistic}
                      className="flex-none p-1.5 rounded-lg transition-all opacity-30 hover:opacity-100"
                      style={{ color: '#ef4444' }}
                      title="Remove connection"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* ── AI Friend Recommendations ── */}
            {recommendations.friendRecommendations?.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Recommended Connections</p>
                </div>
                <div className="space-y-3">
                  {recommendations.friendRecommendations.map((rec, i) => {
                    const linked = isAlreadyFriend(rec.id);
                    return (
                      <div
                        key={rec.id ?? i}
                        className="p-4 rounded-2xl transition-all relative group/rec"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-none uppercase"
                              style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.2)' }}
                            >
                              {rec.name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-white truncate">{rec.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[9px] font-black" style={{ color: '#60a5fa' }}>
                                  {rec.score?.toFixed(1)}% match
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!linked) {
                                handleLink(rec.id);
                                sendFeedback(userId, rec.id, 'USER', 'ACCEPT');
                              }
                            }}
                            disabled={linked}
                            className="flex-none w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                            style={linked
                              ? { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }
                              : { background: '#2563eb', color: '#fff' }
                            }
                            title={linked ? 'Already connected' : 'Add connection'}
                          >
                            {linked
                              ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                              : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            }
                          </button>
                        </div>

                        {rec.reason && (
                          <p className="text-[10px] text-gray-500 mt-2.5 leading-relaxed line-clamp-2">{rec.reason}</p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          {rec.sourceSignals?.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {rec.sourceSignals.map((s, si) => (
                                <span
                                  key={si}
                                  className="text-[8px] font-black px-1.5 py-0.5 rounded-md"
                                  style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}
                                >
                                  {s.type?.replace(/_/g, ' ')} {s.count ? `×${s.count}` : ''}
                                </span>
                              ))}
                            </div>
                          ) : <div />}

                          {/* Feedback Actions */}
                          {!linked && (
                            <div className="flex items-center gap-1 opacity-0 group-hover/rec:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  sendFeedback(userId, rec.id, 'USER', 'REJECT');
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                                title="Not interested"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Hobby Recommendations ── */}
            {recommendations.hobbyRecommendations?.length > 0 && (
              <section className="pb-6">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2.5">Trending Interests</p>
                <div className="grid grid-cols-2 gap-2">
                  {recommendations.hobbyRecommendations.slice(0, 4).map((hobby, i) => (
                    <div
                      key={hobby.id || i}
                      className="p-3 rounded-xl cursor-default relative group"
                      style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.15)' }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#a78bfa' }} />
                        <span className="text-[9px] font-black uppercase text-gray-400">{hobby.name}</span>
                      </div>
                      {hobby.reason && (
                        <p className="text-[8px] text-gray-600 line-clamp-2 leading-tight">{hobby.reason}</p>
                      )}

                      {/* Feedback UI */}
                      {isCurrentUser && (
                        <div className="flex gap-1 mt-2 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const targetId = hobby.id || hobby._id;
                              if (!targetId) return;
                              sendFeedback(userId, targetId, 'HOBBY', 'ACCEPT');
                              const currentHobbies = user.hobbies ? user.hobbies.map(h => typeof h === 'object' ? h.name : h) : [];
                              if (!currentHobbies.includes(hobby.name)) {
                                updateProfile(userId, { hobbies: [...currentHobbies, hobby.name] });
                              }
                            }}
                            className="flex-1 py-1 rounded text-[9px] font-bold text-emerald-400 hover:bg-emerald-500/20 bg-emerald-500/10 border border-emerald-500/20 transition-all cursor-pointer"
                            title="Add to hobbies"
                          >
                            ADD
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const targetId = hobby.id || hobby._id;
                              if (targetId) sendFeedback(userId, targetId, 'HOBBY', 'REJECT');
                            }}
                            className="px-2 py-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/20 bg-white/5 border border-white/5 transition-all cursor-pointer"
                            title="Dismiss"
                          >
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Sidebar;
