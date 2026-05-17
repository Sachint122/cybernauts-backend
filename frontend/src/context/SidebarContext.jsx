import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { useApi, useOptimistic } from 'devil-frontend';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useGraph } from './GraphContext';
import { useAuth } from './AuthContext';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [recommendations, setRecommendations] = useState({ friendRecommendations: [], hobbyRecommendations: [] });
  const [profileMeta, setProfileMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const { get, post, put } = useApi();
  const { linkEdge, unlinkEdge, updateNode } = useGraph();
  const { user } = useAuth();


  // ── useOptimistic manages the friends list with instant UI updates + rollback on error
  const {
    data: friends,
    loading: friendsLoading,
    optimisticUpdate,
    setOptimisticData: setFriends,
  } = useOptimistic([]);

  // ── In-flight guard so opening the same node twice doesn't double-fetch
  const fetchingFor = useRef(null);

  // ─────────────────────────────────────────────────────────────────
  const openSidebar = useCallback((userId) => {
    setSelectedUserId(userId);
    setIsOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
    setSelectedUserId(null);
    setProfileMeta(null);
    setFriends([]);
  }, [setFriends]);

  // ─────────────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async (userId) => {
    if (!userId || fetchingFor.current === userId) return;
    fetchingFor.current = userId;
    setLoading(true);
    try {
      const isSelf = user && (user.id === userId || user._id === userId);
      let userRes, recRes;

      if (isSelf) {
        [userRes, recRes] = await Promise.all([
          get(`/users/${userId}`),
          get(`/users/${userId}/recommendations`),
        ]);
      } else {
        userRes = await get(`/users/${userId}`);
      }

      const userData = userRes.data;
      // Separate friends from the rest so useOptimistic can manage them
      const { friends: friendList = [], ...meta } = userData;

      setProfileMeta(meta);
      setFriends(friendList);
      setRecommendations(recRes?.data || { friendRecommendations: [], hobbyRecommendations: [] });
    } catch (err) {
      toast.error('Profile sync failed');
    } finally {
      setLoading(false);
      fetchingFor.current = null;
    }
  }, [get, setFriends]); // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────
  // toggleConnection — fully optimistic, no full refetch
  const toggleConnection = useCallback(async (userId, targetId, isLinked) => {
    const baseURL = import.meta.env.VITE_API_URL;

    if (isLinked) {
      // ── Optimistic: remove from sidebar friends list immediately ──
      setFriends((prev) => prev.filter((f) => f.id !== targetId));
      // ── Optimistic: remove the graph edge immediately ──
      unlinkEdge(userId, targetId);

      try {
        await axios.delete(`${baseURL}/users/${userId}/unlink`, {
          data: { targetId },
          withCredentials: true,
        });

        // Sync fresh stats for both nodes to update Popularity Score instantly
        const [userRes, targetRes] = await Promise.all([
          get(`/users/${userId}`),
          get(`/users/${targetId}`),
        ]);
        setProfileMeta(prev => prev && (prev.id === userId || prev._id === userId) ? { ...prev, popularityScore: userRes.data.popularityScore } : prev);
        updateNode(userId, { popularityScore: userRes.data.popularityScore });
        updateNode(targetId, { popularityScore: targetRes.data.popularityScore });

        toast.success('Disconnected');
      } catch (err) {
        // Roll back both sidebar and graph on error
        toast.error(err?.response?.data?.message || 'Failed to disconnect');
        fetchingFor.current = null;
        await fetchProfile(userId);
        // Graph edge will re-appear on next full fetchGraph; for now re-add it
        linkEdge(userId, targetId);
      }
    } else {
      // ── Optimistic: add placeholder in sidebar ──
      const optimisticFriend = { id: targetId, name: '...', popularityScore: 0, _optimistic: true };
      setFriends((prev) => [...prev, optimisticFriend]);

      try {
        await post(`/users/${userId}/link`, { targetId });
        // ── Confirmed: add the real edge to graph ──
        linkEdge(userId, targetId);

        // Sync fresh stats for both nodes + real friend details
        const [userRes, targetRes] = await Promise.all([
          get(`/users/${userId}`),
          get(`/users/${targetId}`),
        ]);
        setFriends(userRes.data?.friends ?? []);
        setProfileMeta(prev => prev && (prev.id === userId || prev._id === userId) ? { ...prev, popularityScore: userRes.data.popularityScore } : prev);
        updateNode(userId, { popularityScore: userRes.data.popularityScore });
        updateNode(targetId, { popularityScore: targetRes.data.popularityScore });

        toast.success('Linked!');
      } catch (err) {
        // Roll back sidebar placeholder
        setFriends((prev) => prev.filter((f) => f.id !== targetId));
        toast.error(err?.response?.data?.message || 'Failed to link');
      }
    }
  }, [post, get, setFriends, fetchProfile, linkEdge, unlinkEdge, updateNode]); // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────
  // sendFeedback — POST /users/:id/recommendations/feedback
  // action: 'ACCEPT' | 'REJECT' | 'DISMISS'
  // targetType: 'USER' | 'HOBBY'
  const sendFeedback = useCallback(async (userId, targetId, targetType, action) => {
    try {
      await post(`/users/${userId}/recommendations/feedback`, { targetId, targetType, action });
      
      // Optimistically remove the dismissed/rejected/accepted recommendation from the list
      if (action === 'REJECT' || action === 'DISMISS' || action === 'ACCEPT') {
        setRecommendations((prev) => ({
          ...prev,
          friendRecommendations: (prev.friendRecommendations || []).filter(
            (r) => (r.id || r._id).toString() !== targetId.toString()
          ),
          hobbyRecommendations: (prev.hobbyRecommendations || []).filter(
            (r) => (r.id || r._id).toString() !== targetId.toString()
          ),
        }));
      }

      if (action === 'REJECT') toast.success("Recommendation dismissed");
    } catch (err) {
      // Feedback failed silently
    }
  }, [post]); // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────
  // updateProfile — PUT /users/:id (for the logged-in user's own profile)
  const updateProfile = useCallback(async (userId, updates) => {
    try {
      const res = await put(`/users/${userId}`, updates);
      // Merge the updates into local profileMeta immediately
      setProfileMeta((prev) => ({ ...prev, ...updates }));
      toast.success('Profile updated');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
      return false;
    }
  }, [put]); // eslint-disable-line


  // ─────────────────────────────────────────────────────────────────
  const details = useMemo(() => {
    if (!profileMeta) return null;
    return { ...profileMeta, friends };
  }, [profileMeta, friends]);

  const value = useMemo(() => ({
    isOpen,
    selectedUserId,
    details,
    recommendations,
    loading: loading || friendsLoading,
    openSidebar,
    closeSidebar,
    fetchProfile,
    toggleConnection,
    sendFeedback,
    updateProfile,
  }), [isOpen, selectedUserId, details, recommendations, loading, friendsLoading, openSidebar, closeSidebar, fetchProfile, toggleConnection, sendFeedback, updateProfile]);


  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider');
  return context;
};
