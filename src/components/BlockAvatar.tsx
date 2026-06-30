import React from 'react';
import { AvatarConfig } from '../types';

interface BlockAvatarProps {
  config: AvatarConfig;
  emote?: 'idle' | 'jump' | 'dance' | 'clap' | 'victory' | 'thumbsup';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function BlockAvatar({ config, emote = 'idle', size = 'md' }: BlockAvatarProps) {
  // Setup sizing classes
  const sizeClasses = {
    sm: "w-16 h-20 text-[6px]",
    md: "w-28 h-36 text-[10px]",
    lg: "w-40 h-52 text-[14px]",
    xl: "w-56 h-72 text-[18px]",
  };

  // Setup color maps
  const hairColors: Record<string, string> = {
    brown: "#78350f",
    black: "#1e293b",
    blonde: "#eab308",
    red: "#dc2626",
    blue: "#2563eb",
    pink: "#db2777"
  };

  const skinColor = "#fbcfe8"; // cute blocky pinkish peach skin
  const selectedHairColor = hairColors[config.hairColor] || config.hairColor || "#78350f";

  // Setup emote classes
  const getEmoteAnimation = () => {
    switch (emote) {
      case 'jump':
        return 'animate-bounce';
      case 'dance':
        return 'animate-pulse origin-bottom rotate-3 duration-500';
      case 'clap':
        return 'origin-center scale-x-95 scale-y-105 duration-200';
      case 'victory':
        return 'origin-bottom -rotate-2 scale-110';
      case 'thumbsup':
        return 'origin-center scale-105';
      default:
        return '';
    }
  };

  return (
    <div 
      id="block-avatar-wrapper"
      className={`relative flex flex-col items-center justify-center select-none ${sizeClasses[size]} ${getEmoteAnimation()}`}
    >
      {/* STEP EFFECT OR VICTORY EFFECT TRAIL */}
      {config.stepEffect !== 'none' && emote === 'dance' && (
        <div className="absolute -bottom-2 flex space-x-1 animate-ping">
          {config.stepEffect === 'stars' && <span className="text-yellow-400">⭐</span>}
          {config.stepEffect === 'sparkles' && <span className="text-pink-400">✨</span>}
          {config.stepEffect === 'dust' && <span className="text-slate-400">💨</span>}
        </div>
      )}

      {config.victoryEffect !== 'none' && emote === 'victory' && (
        <div className="absolute -top-10 flex space-x-2 text-xl animate-bounce">
          {config.victoryEffect === 'confetti' && <span className="text-rose-500">🎉</span>}
          {config.victoryEffect === 'fireworks' && <span className="text-amber-400">💥</span>}
          {config.victoryEffect === 'rainbow' && <span className="text-sky-400">🌈</span>}
        </div>
      )}

      {/* CHARACTER STAGE/STAND */}
      <div className="absolute bottom-0 w-[90%] h-4 bg-slate-800/30 rounded-full blur-[2px]" />

      {/* BLOCK AVATAR STRUCTURE */}
      <div className="relative w-full h-full flex flex-col items-center justify-end">
        
        {/* BAG / BACKPACK (Rendered behind) */}
        {config.bag !== 'none' && (
          <div className="absolute top-[35%] -left-1 w-[105%] h-[40%] bg-slate-700 border-4 border-slate-900 z-0 flex items-center justify-center">
            {config.bag === 'backpack' && <div className="w-full h-full bg-red-600 border-b-4 border-slate-900 flex items-center justify-center text-white font-bold text-[8px]">Adventure</div>}
            {config.bag === 'jetpack' && <div className="w-full h-full bg-slate-400 border-b-4 border-slate-900 flex justify-between px-1"><div className="w-2 h-full bg-red-500" /><div className="w-2 h-full bg-red-500" /></div>}
            {config.bag === 'scabbard' && <div className="w-2 h-full bg-amber-700 border-2 border-slate-900 transform rotate-45" />}
          </div>
        )}

        {/* HAT (Rendered on top of hair) */}
        {config.hat !== 'none' && (
          <div className="absolute top-0 w-[80%] h-[20%] z-30 flex justify-center">
            {config.hat === 'cap' && (
              <div className="w-full h-full bg-red-600 border-4 border-slate-900 relative">
                <div className="absolute -right-3 bottom-0 w-4 h-2.5 bg-red-700 border-2 border-slate-900" />
              </div>
            )}
            {config.hat === 'crown' && (
              <div className="w-full h-full bg-yellow-400 border-4 border-slate-900 flex items-end justify-around relative">
                <div className="absolute top-[-6px] left-[10%] w-2 h-2 bg-yellow-500 border-2 border-slate-900 transform rotate-45" />
                <div className="absolute top-[-6px] left-[45%] w-2 h-2 bg-yellow-500 border-2 border-slate-900 transform rotate-45" />
                <div className="absolute top-[-6px] right-[10%] w-2 h-2 bg-yellow-500 border-2 border-slate-900 transform rotate-45" />
                <span className="text-[6px] text-red-600 font-bold mb-1">💎</span>
              </div>
            )}
            {config.hat === 'cowboy' && (
              <div className="w-[110%] h-full bg-amber-800 border-4 border-slate-900 relative">
                <div className="absolute -left-2 -right-2 bottom-0 h-2 bg-amber-900 border-2 border-slate-900" />
              </div>
            )}
            {config.hat === 'explorer' && (
              <div className="w-full h-full bg-yellow-600 border-4 border-slate-900 relative">
                <div className="absolute -left-3 -right-3 bottom-0 h-2 bg-yellow-700 border-2 border-slate-900" />
                <div className="absolute top-1 left-2 right-2 h-2 bg-green-700" />
              </div>
            )}
          </div>
        )}

        {/* HAIR & HEAD */}
        <div className="relative w-[50%] h-[25%] bg-amber-200 border-4 border-slate-900 z-20 flex flex-col items-center justify-between" style={{ backgroundColor: skinColor }}>
          {/* Hair block layer */}
          <div className="absolute -top-3 -left-1 -right-1 h-5 border-b-4 border-slate-900 z-10" style={{ backgroundColor: selectedHairColor }}>
            {config.hairStyle === 'spiky' && (
              <div className="absolute -top-2 left-0 right-0 flex justify-between">
                <div className="w-2 h-2 border-t-4 border-l-4 border-slate-900" style={{ backgroundColor: selectedHairColor }} />
                <div className="w-2 h-2 border-t-4 border-slate-900" style={{ backgroundColor: selectedHairColor }} />
                <div className="w-2 h-2 border-t-4 border-r-4 border-slate-900" style={{ backgroundColor: selectedHairColor }} />
              </div>
            )}
            {config.hairStyle === 'twin' && (
              <div className="absolute -top-2 -left-3 -right-3 flex justify-between">
                <div className="w-4 h-4 border-4 border-slate-900" style={{ backgroundColor: selectedHairColor }} />
                <div className="w-4 h-4 border-4 border-slate-900" style={{ backgroundColor: selectedHairColor }} />
              </div>
            )}
          </div>

          {/* EYES */}
          <div className="flex justify-between w-full px-2 mt-4">
            <div className="w-2 h-2 bg-slate-900 flex items-center justify-center">
              <div className="w-1 h-1 bg-white" />
            </div>
            <div className="w-2 h-2 bg-slate-900 flex items-center justify-center">
              <div className="w-1 h-1 bg-white" />
            </div>
          </div>

          {/* GLASSES */}
          {config.glasses !== 'none' && (
            <div className="absolute top-3 left-0 right-0 h-3 z-20 flex items-center justify-between px-1">
              {config.glasses === 'round' && (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-900 bg-cyan-200/50" />
                  <div className="h-0.5 w-full bg-slate-900" />
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-900 bg-cyan-200/50" />
                </>
              )}
              {config.glasses === 'shades' && (
                <>
                  <div className="w-4 h-3 bg-slate-900 border border-slate-700" />
                  <div className="h-1 w-full bg-slate-900" />
                  <div className="w-4 h-3 bg-slate-900 border border-slate-700" />
                </>
              )}
              {config.glasses === 'cool' && (
                <>
                  <div className="w-4 h-3 bg-red-500 border border-slate-950 transform -skew-x-12" />
                  <div className="h-0.5 w-full bg-slate-950" />
                  <div className="w-4 h-3 bg-red-500 border border-slate-950 transform skew-x-12" />
                </>
              )}
            </div>
          )}

          {/* SMILE & CHEEKS */}
          <div className="flex items-center justify-between w-full px-3 mb-1">
            <div className="w-1.5 h-1 bg-rose-400 rounded-full" />
            <div className="w-3 h-1 bg-slate-900" />
            <div className="w-1.5 h-1 bg-rose-400 rounded-full" />
          </div>
        </div>

        {/* ARMS AND BODY */}
        <div className="relative w-[65%] h-[35%] flex items-stretch z-10">
          
          {/* LEFT ARM */}
          <div className="w-[20%] bg-slate-800 border-4 border-slate-900 border-r-0 flex flex-col justify-between origin-top"
               style={{ 
                 transform: emote === 'victory' ? 'rotate(-130deg) translate(-2px, -4px)' : 
                            emote === 'clap' ? 'rotate(30deg)' : 
                            emote === 'dance' ? 'rotate(15deg)' : 'none' 
               }}>
            <div className="h-[60%]" style={{ backgroundColor: config.costume === 'adventure' ? '#2563eb' : config.costume === 'robot' ? '#475569' : '#db2777' }} />
            <div className="h-[40%] bg-amber-200" style={{ backgroundColor: skinColor }} />
          </div>

          {/* BODY / TORSO */}
          <div className="w-[60%] border-4 border-slate-900 flex flex-col items-center justify-between"
               style={{ 
                 backgroundColor: config.costume === 'adventure' ? '#3b82f6' : 
                                 config.costume === 'robot' ? '#64748b' : 
                                 config.costume === 'casual' ? '#10b981' : 
                                 config.costume === 'superhero' ? '#ef4444' : '#8b5cf6' 
               }}>
            {/* Torso design badge / symbol */}
            <div className="mt-2 text-[8px] font-bold text-white bg-slate-900/30 px-1 border border-white/20">
              {config.costume === 'adventure' && '★'}
              {config.costume === 'robot' && '🤖'}
              {config.costume === 'casual' && '☺'}
              {config.costume === 'superhero' && '⚡'}
              {config.costume === 'royal' && '👑'}
            </div>

            {/* Pants portion */}
            <div className="w-full h-[25%] bg-slate-800 border-t-4 border-slate-900" />
          </div>

          {/* RIGHT ARM */}
          <div className="w-[20%] bg-slate-800 border-4 border-slate-900 border-l-0 flex flex-col justify-between origin-top"
               style={{ 
                 transform: emote === 'victory' ? 'rotate(130deg) translate(2px, -4px)' : 
                            emote === 'thumbsup' ? 'rotate(-60deg)' : 
                            emote === 'clap' ? 'rotate(-30deg)' : 
                            emote === 'dance' ? 'rotate(-15deg)' : 'none' 
               }}>
            <div className="h-[60%]" style={{ backgroundColor: config.costume === 'adventure' ? '#2563eb' : config.costume === 'robot' ? '#475569' : '#db2777' }} />
            <div className="h-[40%] bg-amber-200" style={{ backgroundColor: skinColor }} />
          </div>

        </div>

        {/* LEGS / FEET */}
        <div className="w-[50%] h-[20%] flex justify-between z-10">
          {/* Left Leg */}
          <div className="w-[45%] bg-slate-700 border-4 border-slate-900 border-t-0 flex flex-col justify-end"
               style={{ transform: emote === 'dance' ? 'translateY(-2px)' : 'none' }}>
            {/* Shoe */}
            <div className="h-[45%] border-t-2 border-slate-900"
                 style={{ 
                   backgroundColor: config.shoes === 'boots' ? '#78350f' : 
                                   config.shoes === 'sneakers' ? '#ffffff' : '#f59e0b' 
                 }} 
            />
          </div>

          {/* Right Leg */}
          <div className="w-[45%] bg-slate-700 border-4 border-slate-900 border-t-0 flex flex-col justify-end"
               style={{ transform: emote === 'dance' ? 'translateY(2px)' : 'none' }}>
            {/* Shoe */}
            <div className="h-[45%] border-t-2 border-slate-900"
                 style={{ 
                   backgroundColor: config.shoes === 'boots' ? '#78350f' : 
                                   config.shoes === 'sneakers' ? '#ffffff' : '#f59e0b' 
                 }} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}
