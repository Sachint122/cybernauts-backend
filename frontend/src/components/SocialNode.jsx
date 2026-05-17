import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const SocialNode = ({ data }) => {
  const { name, popularityScore, hobbiesCount, hobbies, isCurrentUser } = data;
  
  const isHigh = popularityScore > 5;
  
  // Base intensity
  const intensity = Math.min(popularityScore * 0.1, 1);
  
  // Style config based on score tier
  const tierStyles = isHigh ? {
    glow: isCurrentUser ? '35px' : '25px',
    borderOpacity: 0.8,
    bgOpacity: 0.25,
    accent: isCurrentUser ? '#34d399' : '#60a5fa',
    ring: isCurrentUser ? 'ring-2 ring-emerald-500/40' : 'ring-1 ring-blue-500/20'
  } : {
    glow: '10px',
    borderOpacity: 0.3,
    bgOpacity: 0.08,
    accent: '#94a3b8', // Muted slate
    ring: ''
  };

  const bgColor = isCurrentUser 
    ? `rgba(16, 185, 129, ${tierStyles.bgOpacity + intensity * 0.3})` 
    : `rgba(59, 130, 246, ${tierStyles.bgOpacity + intensity * 0.3})`;
    
  const borderColor = isCurrentUser 
    ? `rgba(16, 185, 129, ${tierStyles.borderOpacity})` 
    : `rgba(59, 130, 246, ${tierStyles.borderOpacity})`;
    
  const shadowColor = isCurrentUser 
    ? `rgba(16, 185, 129, ${isHigh ? 0.4 : 0.1})` 
    : `rgba(59, 130, 246, ${isHigh ? 0.3 : 0.05})`;

  return (
    <div 
      className={`px-4 py-3 shadow-xl rounded-xl border-2 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${tierStyles.ring}`}
      style={{ 
        backgroundColor: '#141414', 
        borderColor: borderColor,
        boxShadow: `0 0 ${tierStyles.glow} ${shadowColor}`,
        opacity: isHigh ? 1 : 0.85
      }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="flex flex-col items-center">
        <div 
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black mb-2 transition-transform duration-500 ${isHigh ? 'scale-110' : 'scale-90'}`}
          style={{ backgroundColor: bgColor, color: tierStyles.accent, border: isHigh ? `2px solid ${borderColor}` : 'none' }}
        >
          {name.charAt(0)}
        </div>
        <div className={`text-sm font-bold text-center truncate w-24 mb-1 ${isHigh ? 'text-white' : 'text-gray-400'}`} title={name}>
          {name}
        </div>
        
        {isCurrentUser && (
          <div className="text-[8px] font-black tracking-widest uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1">
            YOU
          </div>
        )}
        
        <div className="flex gap-1.5 mt-1">
          <span className={`text-[9px] px-1.5 py-0.5 rounded shadow-sm border ${isHigh ? 'bg-blue-500/20 text-blue-300 border-blue-500/20' : 'bg-gray-500/10 text-gray-500 border-transparent'}`}>
            P: {popularityScore.toFixed(1)}
          </span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded shadow-sm border ${isHigh ? 'bg-purple-500/20 text-purple-300 border-purple-500/20' : 'bg-gray-500/10 text-gray-500 border-transparent'}`}>
            H: {hobbiesCount || hobbies?.length || 0}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

export default memo(SocialNode);
