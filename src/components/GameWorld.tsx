import React, { useState, useEffect, useRef } from 'react';
import { Question, Island, ISLANDS, AvatarConfig, BADGES, Badge } from '../types';
import BlockAvatar from './BlockAvatar';

interface GameWorldProps {
  student: { name: string; group: string; grade: string; absentNo: string };
  avatarConfig: AvatarConfig;
  coins: number;
  onChangeCoins: (newCoins: number) => void;
  onExitGame: () => void;
  onOpenCustomizer: () => void;
}

export default function GameWorld({
  student,
  avatarConfig,
  coins,
  onChangeCoins,
  onExitGame,
  onOpenCustomizer
}: GameWorldProps) {
  // Game states
  const [activeIsland, setActiveIsland] = useState<Island | null>(null);
  const [completedIslands, setCompletedIslands] = useState<string[]>(() => {
    const saved = localStorage.getItem('math_adventure_completed_islands');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  
  // Timers
  const [totalPlayTime, setTotalPlayTime] = useState(0);
  const [levelPlayTime, setLevelPlayTime] = useState(0);
  const [answerTime, setAnswerTime] = useState(0);
  
  // Answering timers tracker
  const [isAnswering, setIsAnswering] = useState(false);
  const [attempts, setAttempts] = useState(1);
  const [levelAttempts, setLevelAttempts] = useState(0);

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeMiniGame, setActiveMiniGame] = useState<'race' | 'treasure' | 'jump' | 'bridge' | 'boss' | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Challenge popup state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrectFeedback, setIsCorrectFeedback] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Build Bridge State
  const [bridgeBlocks, setBridgeBlocks] = useState<number>(0);
  
  // Custom reset confirmation state (avoids blocked native confirm dialogues)
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Sound effects or feedback alerts
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Refs for tracking real times
  const startTimeRef = useRef<string>(new Date().toISOString());

  // Fetch Questions from API
  useEffect(() => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(resData => {
        if (resData.status === 'success') {
          setQuestions(resData.data);
        }
      })
      .catch(err => console.error("Gagal mengambil soal:", err));
  }, []);

  // Main game timer
  useEffect(() => {
    const mainTimer = setInterval(() => {
      setTotalPlayTime(prev => prev + 1);
      if (activeIsland) {
        setLevelPlayTime(prev => prev + 1);
      }
      if (isAnswering) {
        setAnswerTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(mainTimer);
  }, [activeIsland, isAnswering]);

  const handleStartIsland = (island: Island) => {
    // Check if previous levels are completed
    if (island.level > 1 && !completedIslands.includes(ISLANDS[island.level - 2].id)) {
      alert(`🔒 Pulau ini masih terkunci! Kamu harus menyelesaikan ${ISLANDS[island.level - 2].name} terlebih dahulu.`);
      return;
    }

    setActiveIsland(island);
    setLevelPlayTime(0);
    setCurrentQuestionIndex(0);
    setHearts(3);
    setSelectedAnswer(null);
    setIsCorrectFeedback(null);
    setShowExplanation(false);
    setBridgeBlocks(0);

    // Map Island category to corresponding mini game types
    switch (island.id) {
      case 'panjang':
        setActiveMiniGame('race');
        break;
      case 'berat':
        setActiveMiniGame('treasure');
        break;
      case 'waktu':
        setActiveMiniGame('jump');
        break;
      case 'volume':
        setActiveMiniGame('bridge');
        break;
      case 'gabungan':
        setActiveMiniGame('boss');
        break;
      default:
        setActiveMiniGame(null);
    }
  };

  const getFilteredQuestions = () => {
    if (!activeIsland) return [];
    return questions.filter(q => q.category === activeIsland.id);
  };

  const currentQuestionsList = getFilteredQuestions();
  const currentQuestion = currentQuestionsList[currentQuestionIndex];

  // Starts the timer for an active question
  useEffect(() => {
    if (currentQuestion) {
      setIsAnswering(true);
      setAnswerTime(0);
    } else {
      setIsAnswering(false);
    }
  }, [currentQuestionIndex, activeIsland]);

  const handleAnswerSubmit = (option: string) => {
    if (isCorrectFeedback !== null) return; // Prevent double answer submission
    
    setSelectedAnswer(option);
    const isCorrect = option === currentQuestion.correctAnswer;
    setIsCorrectFeedback(isCorrect);
    setIsAnswering(false); // Stop question timer

    if (isCorrect) {
      setScore(prev => prev + 20);
      setXp(prev => prev + 50);
      onChangeCoins(coins + 15);
      setFeedbackMsg("HEBAT! Jawabanmu benar! 🎉 +15 Koin & +50 XP");

      if (activeMiniGame === 'bridge') {
        setBridgeBlocks(prev => prev + 1);
      }

      // Check level progression or boss victory
      setTimeout(() => {
        setIsCorrectFeedback(null);
        setSelectedAnswer(null);
        if (currentQuestionIndex + 1 < currentQuestionsList.length) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          // Finished level!
          handleLevelComplete();
        }
      }, 2000);

    } else {
      setHearts(prev => {
        const nextHearts = prev - 1;
        if (nextHearts <= 0) {
          setIsGameOver(true);
          submitReportToTeacher(false);
        }
        return nextHearts;
      });
      setLevelAttempts(prev => prev + 1);
      setFeedbackMsg("Waduh, belum tepat! Coba pelajari penjelasannya ya! 💔");
      setShowExplanation(true);
    }
  };

  const handleRetryAfterExplanation = () => {
    setShowExplanation(false);
    setIsCorrectFeedback(null);
    setSelectedAnswer(null);
    // Let them answer again
    setIsAnswering(true);
  };

  const handleLevelComplete = () => {
    if (!activeIsland) return;

    // Award badge
    const badgeId = activeIsland.badgeId;
    let updatedBadges = [...earnedBadges];
    if (!updatedBadges.includes(badgeId)) {
      updatedBadges.push(badgeId);
      setEarnedBadges(updatedBadges);
    }

    // Save level completion
    let updatedCompleted = [...completedIslands];
    if (!updatedCompleted.includes(activeIsland.id)) {
      updatedCompleted.push(activeIsland.id);
      setCompletedIslands(updatedCompleted);
      localStorage.setItem('math_adventure_completed_islands', JSON.stringify(updatedCompleted));
    }

    // Display level victory modal / state
    setIsVictory(true);
    submitReportToTeacher(true);
  };

  const submitReportToTeacher = (isWin: boolean) => {
    if (!activeIsland) return;

    const reportData = {
      name: student.name,
      group: student.group,
      grade: student.grade,
      absentNo: student.absentNo,
      score: score,
      xpEarned: xp,
      coinsEarned: coins,
      badges: earnedBadges.length > 0 ? earnedBadges : [activeIsland.badgeId],
      totalPlayTime: totalPlayTime,
      totalAnswerTime: totalPlayTime - levelPlayTime + answerTime, // Estimate total answering time
      attempts: attempts + levelAttempts,
      completedLevels: completedIslands.includes(activeIsland.id) ? completedIslands : [...completedIslands, activeIsland.id]
    };

    fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    })
    .then(res => res.json())
    .then(data => {
      console.log("Laporan berhasil dikirim ke guru:", data);
    })
    .catch(err => console.error("Gagal mengirim laporan:", err));
  };

  const handleCloseVictoryModal = () => {
    setIsVictory(false);
    setActiveIsland(null);
    setActiveMiniGame(null);
  };

  const handleCloseGameOverModal = () => {
    setIsGameOver(false);
    setActiveIsland(null);
    setActiveMiniGame(null);
    setHearts(3);
  };

  return (
    <div id="game-world-container" className="min-h-screen bg-sky-300 font-display text-slate-800 relative flex flex-col overflow-hidden select-none">
      
      {/* PERSISTENT TOP UTILITY BAR */}
      <header className="bg-slate-900 text-white p-3 border-b-4 border-slate-900 flex justify-between items-center z-40 shadow-md">
        
        {/* Student Branding */}
        <div className="flex items-center space-x-3">
          <div className="bg-rose-500 w-10 h-10 border-2 border-white flex items-center justify-center font-bold text-lg text-white shadow-sm">
            3
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight flex items-center">
              👤 {student.name} <span className="ml-2 bg-yellow-400 text-slate-950 font-black text-[9px] px-1 py-0.5 border border-slate-900 uppercase">{student.grade}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              🚩 KELOMPOK: {student.group}
            </div>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center space-x-4">
          
          {/* XP & Level */}
          <div className="bg-indigo-950 border-2 border-indigo-700 px-3 py-1 text-xs font-mono font-bold flex items-center shadow-inner">
            <span className="text-indigo-400 mr-1.5">⚡ XP</span>
            <span className="text-white">{xp}</span>
          </div>

          {/* Coins Display */}
          <div className="bg-amber-950 border-2 border-amber-600 px-3 py-1 text-xs font-mono font-bold flex items-center shadow-inner">
            <span className="text-yellow-400 mr-1.5">🪙 KOIN</span>
            <span className="text-white">{coins}</span>
          </div>

          {/* Persistent Live Timer */}
          <div className="bg-slate-800 border-2 border-slate-600 px-3 py-1 text-xs font-mono font-bold flex items-center">
            <span className="text-emerald-400 mr-1.5">⏱️ WAKTU</span>
            <span className="text-white">
              {Math.floor(totalPlayTime / 60)}m {totalPlayTime % 60}s
            </span>
          </div>

          {/* Customize Avatar Quick Button */}
          <button
            id="quick-customizer-btn"
            onClick={onOpenCustomizer}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs px-3 py-1.5 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center space-x-1 block-btn"
          >
            <span>👕</span> <span>Toko Avatar</span>
          </button>

          {/* Exit Game */}
          <button
            id="exit-game-btn"
            onClick={onExitGame}
            className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-3 py-1.5 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] block-btn"
          >
            Keluar 🚪
          </button>
        </div>

      </header>

      {/* 2.5D WORLD MAP SCREEN (When no active island/game mode) */}
      {!activeIsland && (
        <div className="flex-1 p-6 relative overflow-y-auto flex flex-col items-center justify-start min-h-[500px]">
          
          {/* Title Banner */}
          <div className="text-center mb-8 max-w-2xl">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none drop-shadow-[2px_2px_0px_#ffffff]">
              MAP PETUALANGAN BALOK
            </h1>
            <p className="text-slate-700 text-sm font-bold mt-2 uppercase tracking-wide">
              Pilih pulau petualanganmu untuk mulai belajar & mengumpulkan badge!
            </p>
          </div>

          {/* CONGRATULATIONS ALL ISLANDS COMPLETED */}
          {completedIslands.length === 5 && (
            <div id="all-completed-celebration" className="w-full max-w-5xl bg-yellow-400 border-4 border-slate-900 p-5 mb-8 shadow-[6px_6px_0px_#1e293b] text-center transform rotate-1 animate-pulse relative overflow-hidden">
              <span className="absolute top-2 left-2 text-2xl">🏆</span>
              <span className="absolute top-2 right-2 text-2xl">🏆</span>
              <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">🎉 LUAR BIASA! PETUALANGAN SELESAI! 🎉</h2>
              <p className="text-xs font-black text-slate-900 mt-1 uppercase">
                Kamu telah menaklukkan seluruh pulau pengukuran matematika kelas 3! Hebat sekali!
              </p>
              
              <div className="mt-4 flex flex-wrap justify-center items-center gap-3">
                <button
                  id="celebration-exit-btn"
                  onClick={onExitGame}
                  className="bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs py-2 px-4 border-3 border-slate-900 shadow-[2px_2px_0px_#1e293b] block-btn uppercase"
                >
                  Keluar & Laporkan Hasil 🚪
                </button>
                
                {showResetConfirm ? (
                  <div className="bg-slate-900 text-white border-2 border-slate-950 p-2 text-xs flex items-center space-x-2 animate-fadeIn">
                    <span className="text-[10px] font-bold text-yellow-400 uppercase">Ulangi petualangan dari awal?</span>
                    <button
                      onClick={() => {
                        localStorage.removeItem('math_adventure_completed_islands');
                        setCompletedIslands([]);
                        setShowResetConfirm(false);
                      }}
                      className="bg-rose-500 hover:bg-rose-400 px-2.5 py-1 text-[10px] font-black uppercase border border-slate-950"
                    >
                      Ya, Hapus Progress 🔄
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="bg-slate-600 hover:bg-slate-500 px-2 py-1 text-[10px] font-bold border border-slate-950"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    id="trigger-reset-confirm-btn"
                    onClick={() => setShowResetConfirm(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs py-2 px-4 border-3 border-slate-950 shadow-[2px_2px_0px_#000] uppercase"
                  >
                    Ulangi Dari Awal 🔄
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3D MAP PLATFORMS CONTAINER */}
          <div className="w-full max-w-5xl bg-slate-100/50 border-4 border-slate-800 p-8 grid grid-cols-1 md:grid-cols-5 gap-6 relative shadow-[8px_8px_0px_#1e293b] min-h-[400px]">
            
            {/* Ambient decorations */}
            <div className="absolute top-2 left-4 text-xs font-mono text-slate-500 uppercase font-black">
              ⚓ KOORDINAT DUNIA: 3D_GRID_ACTIVE
            </div>

            {/* ISlands display as retro bento slots */}
            {ISLANDS.map((island, index) => {
              const isUnlocked = island.level === 1 || completedIslands.includes(ISLANDS[island.level - 2].id);
              const isCompleted = completedIslands.includes(island.id);

              return (
                <div 
                  key={island.id}
                  id={`island-card-${island.id}`}
                  className={`border-4 border-slate-900 flex flex-col justify-between p-4 relative overflow-hidden transition-all duration-200 transform hover:-translate-y-1 ${
                    isUnlocked 
                      ? 'bg-amber-100 shadow-[4px_4px_0px_#1e293b]' 
                      : 'bg-slate-300 opacity-80 shadow-[2px_2px_0px_#475569]'
                  }`}
                >
                  {/* Lock Overlay */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px] flex flex-col items-center justify-center text-white p-3 text-center">
                      <span className="text-3xl mb-1">🔒</span>
                      <span className="text-xs font-black uppercase">Terkunci</span>
                      <span className="text-[9px] mt-1 text-slate-300">Selesaikan level sebelumnya</span>
                    </div>
                  )}

                  {/* Level Badge */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="bg-slate-900 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 border border-slate-700">
                      LEVEL {island.level}
                    </span>
                    {isCompleted && (
                      <span className="bg-emerald-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 border border-slate-900 shadow-[1px_1px_0px_#1e293b] uppercase">
                        SELESAI ⭐
                      </span>
                    )}
                  </div>

                  {/* Island Visual Voxel Icon */}
                  <div className="my-3 flex justify-center">
                    <div className={`w-20 h-20 border-4 border-slate-900 flex flex-col items-center justify-center relative shadow-[3px_3px_0px_#1e293b] ${island.bgColor} ${island.borderColor}`}>
                      {island.id === 'panjang' && <span className="text-4xl filter drop-shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">📏</span>}
                      {island.id === 'berat' && <span className="text-4xl filter drop-shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">⚖️</span>}
                      {island.id === 'waktu' && <span className="text-4xl filter drop-shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">⏱️</span>}
                      {island.id === 'volume' && <span className="text-4xl filter drop-shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">🧪</span>}
                      {island.id === 'gabungan' && <span className="text-4xl filter drop-shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">👑</span>}
                    </div>
                  </div>

                  {/* Island Title & Info */}
                  <div className="mt-2 text-center">
                    <h3 className="text-sm font-black text-slate-950 uppercase leading-tight tracking-tight">
                      {island.name}
                    </h3>
                    <p className="text-[10px] text-slate-600 font-bold mt-1.5 leading-snug">
                      {island.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    id={`enter-island-${island.id}`}
                    onClick={() => handleStartIsland(island)}
                    disabled={!isUnlocked}
                    className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs py-2 border-3 border-slate-800 shadow-[2px_2px_0px_#1e293b] block-btn uppercase disabled:opacity-50"
                  >
                    Masuk Pulau 🚀
                  </button>
                </div>
              );
            })}

          </div>

          {/* COMPLETED STATUS & AVATAR STAND IN MAIN HALL */}
          <div className="w-full max-w-5xl mt-6 bg-slate-900 text-white border-4 border-slate-900 p-4 flex flex-col md:flex-row items-center justify-between shadow-[6px_6px_0px_#1e293b]">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-sky-200 p-2 border-2 border-white">
                <BlockAvatar config={avatarConfig} emote="idle" size="sm" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase text-yellow-400">STATUS PETUALANGAN</h3>
                <p className="text-xs text-slate-300">Kamu telah menaklukkan <span className="text-white font-bold">{completedIslands.length} dari 5 pulau</span> edukasi.</p>
                
                {/* Badges strip */}
                <div className="flex space-x-1.5 mt-2">
                  {BADGES.map(badge => {
                    const hasBadge = earnedBadges.includes(badge.id) || completedIslands.includes(
                      badge.id === 'Ahli Panjang' ? 'panjang' :
                      badge.id === 'Ahli Berat' ? 'berat' :
                      badge.id === 'Ahli Waktu' ? 'waktu' :
                      badge.id === 'Ahli Volume' ? 'volume' : 'gabungan'
                    );
                    return (
                      <div 
                        key={badge.id}
                        title={badge.title}
                        className={`w-8 h-8 rounded-none border border-white flex items-center justify-center text-xs ${
                          hasBadge ? badge.color : 'bg-slate-800 opacity-30 grayscale'
                        }`}
                      >
                        {badge.icon}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="inline-block bg-teal-500 text-slate-950 font-black px-2 py-0.5 uppercase mb-1 border border-slate-950">PETUNJUK GURU</span>
              <p className="text-slate-300">Hasil kemajuan belajar ini dikirim langsung ke laporan guru kelas.</p>
            </div>
          </div>

        </div>
      )}

      {/* ACTIVE ISLAND CHALLENGE PORT / ARENA */}
      {activeIsland && currentQuestion && (
        <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden relative min-h-[500px]">
          
          {/* LEFT INTERACTIVE MINI-GAME ARENA VIEW */}
          <div className="w-full md:w-3/5 bg-slate-950 border-4 border-slate-800 flex flex-col justify-between p-4 relative overflow-hidden min-h-[300px]">
            
            {/* Mini Game Headers */}
            <div className="flex justify-between items-center z-10">
              <span className="bg-yellow-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 border-2 border-slate-900 uppercase">
                🕹️ MINI GAME: {activeMiniGame === 'race' && "RACE CHALLENGE"}
                {activeMiniGame === 'treasure' && "TREASURE HUNT"}
                {activeMiniGame === 'jump' && "JUMP CHALLENGE"}
                {activeMiniGame === 'bridge' && "BUILD BRIDGE"}
                {activeMiniGame === 'boss' && "BOSS BATTLE"}
              </span>

              {/* HEARTS HEALTH GAUGE */}
              <div className="flex items-center space-x-1 bg-slate-850 px-2 py-1 border-2 border-slate-800 text-xs">
                <span className="text-[10px] font-black text-slate-400 uppercase mr-1">NYAWA:</span>
                {[...Array(3)].map((_, i) => (
                  <span key={i} className="text-lg">
                    {i < hearts ? "❤️" : "🖤"}
                  </span>
                ))}
              </div>
            </div>

            {/* MAIN GAME VISUALIZATION */}
            <div className="flex-1 flex flex-col items-center justify-center relative my-4">
              
              {/* FEEDBACK STATUS TEXT */}
              {feedbackMsg && (
                <div className="absolute top-0 bg-yellow-400 text-slate-950 border-2 border-slate-900 px-4 py-1 font-bold text-xs z-30 uppercase animate-bounce">
                  {feedbackMsg}
                </div>
              )}

              {/* GAME TYPE 1: RACE CHALLENGE (Pulau Panjang) */}
              {activeMiniGame === 'race' && (
                <div className="w-full h-full flex flex-col items-center justify-center text-white text-center p-4 relative">
                  {/* Track lanes representation */}
                  <div className="w-full h-40 bg-slate-800 border-t-4 border-b-4 border-dashed border-slate-600 relative flex flex-col justify-around overflow-hidden">
                    
                    {/* Horizon grid layout */}
                    <div className="absolute inset-0 bg-grid-lines opacity-10" />

                    {/* Finish Gate voxel representation */}
                    <div className="absolute right-6 top-2 bottom-2 w-4 bg-emerald-500 border-2 border-white flex flex-col justify-between">
                      <div className="h-4 w-full bg-slate-900" />
                      <div className="h-4 w-full bg-slate-900" />
                    </div>

                    {/* Lanes */}
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border-b-2 border-slate-700/50 w-full h-0.5" />
                    ))}

                    {/* Voxel Avatar on Track */}
                    <div 
                      className="absolute top-[40%] transform scale-75 z-10 transition-all duration-1000 ease-in-out"
                      style={{ 
                        left: `${isVictory ? 85 : (currentQuestionsList.length > 0 ? 10 + (currentQuestionIndex / currentQuestionsList.length) * 72 : 10)}%` 
                      }}
                    >
                      <BlockAvatar config={avatarConfig} emote={isCorrectFeedback === true ? "dance" : (isCorrectFeedback === false ? "idle" : "dance")} size="sm" />
                    </div>

                    {/* Lanes answer portals obstacles */}
                    <div className="absolute right-20 inset-y-0 flex flex-col justify-around py-2">
                      <div className="bg-emerald-600 text-white font-mono text-[9px] px-1.5 py-0.5 border border-white">Gerbang Panjang</div>
                      <div className="bg-sky-600 text-white font-mono text-[9px] px-1.5 py-0.5 border border-white">Suhu Udara</div>
                    </div>

                  </div>
                  <div className="text-xs text-slate-400 mt-4 font-bold">
                    🏃 <em>Petunjuk: Bantulah avatar berlari melewati gerbang pengukuran panjang untuk membuka portal rahasia!</em>
                  </div>
                </div>
              )}

              {/* GAME TYPE 2: TREASURE HUNT (Pulau Berat) */}
              {activeMiniGame === 'treasure' && (
                <div className="w-full h-full flex flex-col items-center justify-center text-white text-center p-4">
                  {/* Chest grid representation */}
                  <div className="grid grid-cols-4 gap-4 my-2">
                    {[...Array(4)].map((_, idx) => (
                      <div 
                        key={idx} 
                        className="w-16 h-16 bg-amber-800 border-4 border-amber-950 flex flex-col items-center justify-center shadow-lg relative transform hover:scale-105 transition-all"
                      >
                        <span className="text-3xl filter drop-shadow-[1px_1px_0px_#000]">📦</span>
                        <div className="absolute -bottom-2 bg-yellow-400 text-slate-950 border border-slate-950 text-[8px] font-mono font-bold px-1">
                          PETI {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Character sitting waiting */}
                  <div className="mt-4 transform scale-75">
                    <BlockAvatar config={avatarConfig} emote="idle" size="sm" />
                  </div>

                  <div className="text-xs text-slate-400 mt-4 font-bold">
                    🔑 <em>Petunjuk: Cari dan buka peti harta karun dengan jawaban berat kilogram yang paling tepat!</em>
                  </div>
                </div>
              )}

              {/* GAME TYPE 3: JUMP CHALLENGE (Pulau Waktu) */}
              {activeMiniGame === 'jump' && (
                <div className="w-full h-full flex flex-col items-center justify-center text-white text-center p-4">
                  
                  {/* Platform jumps layout */}
                  <div className="flex space-x-6 justify-center items-end h-32 w-full">
                    
                    {/* Platform 1 */}
                    <div className="w-16 h-12 bg-indigo-600 border-4 border-indigo-900 relative flex items-center justify-center">
                      <span className="text-[10px] font-bold">Platform A</span>
                    </div>

                    {/* Active Jump Platform */}
                    <div className="w-20 h-16 bg-pink-500 border-4 border-pink-900 relative flex flex-col items-center justify-end">
                      <div className="absolute -top-16 scale-50">
                        <BlockAvatar config={avatarConfig} emote="jump" size="sm" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider mb-1">LONCATAN</span>
                    </div>

                    {/* Platform 3 */}
                    <div className="w-16 h-12 bg-indigo-600 border-4 border-indigo-900 relative flex items-center justify-center">
                      <span className="text-[10px] font-bold">Platform B</span>
                    </div>

                  </div>

                  <div className="text-xs text-slate-400 mt-6 font-bold">
                    ⏱️ <em>Petunjuk: Melompatlah ke platform waktu sebelum jarum jam menunjuk angka batas akhir!</em>
                  </div>
                </div>
              )}

              {/* GAME TYPE 4: BUILD BRIDGE (Pulau Volume) */}
              {activeMiniGame === 'bridge' && (
                <div className="w-full h-full flex flex-col items-center justify-center text-white text-center p-4">
                  
                  {/* Bridge layout stackable blocks */}
                  <div className="w-full max-w-md h-32 bg-slate-900 border-2 border-slate-800 rounded-none p-2 flex items-end justify-center space-x-2 relative">
                    
                    {/* Left cliff */}
                    <div className="w-12 h-full bg-slate-700 border-r-4 border-slate-900" />

                    {/* Bridge Area with Dynamic Block Counter */}
                    <div className="flex-1 h-full flex flex-col-reverse justify-start items-center p-1 border-b-4 border-dashed border-slate-700">
                      
                      {bridgeBlocks === 0 ? (
                        <div className="text-xs text-slate-500 font-mono italic mb-2">Belum ada jembatan</div>
                      ) : (
                        <div className="flex flex-col-reverse space-y-reverse space-y-1 w-full max-w-[150px]">
                          {[...Array(bridgeBlocks)].map((_, i) => (
                            <div key={i} className="h-6 bg-cyan-500 border-2 border-slate-950 shadow-sm flex items-center justify-center text-[8px] font-mono font-bold">
                              BALOK VOLUME {i + 1}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Character standing on the built bridge */}
                      <div className="transform scale-50 -mb-2 z-10">
                        <BlockAvatar config={avatarConfig} emote={bridgeBlocks > 0 ? 'dance' : 'idle'} size="sm" />
                      </div>
                    </div>

                    {/* Right cliff */}
                    <div className="w-12 h-full bg-slate-700 border-l-4 border-slate-900" />

                  </div>

                  <div className="text-xs text-slate-400 mt-4 font-bold">
                    🌉 <em>Petunjuk: Setiap jawaban liter/ml yang benar akan membentuk 1 balok jembatan penyeberangan!</em>
                  </div>
                </div>
              )}

              {/* GAME TYPE 5: BOSS BATTLE (Pulau Master Pengukuran) */}
              {activeMiniGame === 'boss' && (
                <div className="w-full h-full flex flex-col items-center justify-between p-4 text-white">
                  
                  {/* Dragon Boss */}
                  <div className="flex flex-col items-center text-center mt-2">
                    {/* Boss voxel rendering block */}
                    <div className="w-24 h-24 bg-rose-600 border-4 border-slate-900 relative flex items-center justify-center shadow-lg animate-bounce">
                      {/* Voxel eyes */}
                      <div className="absolute top-4 left-4 w-4 h-4 bg-slate-900 flex items-center justify-center">
                        <div className="w-2 h-2 bg-yellow-400" />
                      </div>
                      <div className="absolute top-4 right-4 w-4 h-4 bg-slate-900 flex items-center justify-center">
                        <div className="w-2 h-2 bg-yellow-400" />
                      </div>
                      {/* Dragon snout */}
                      <div className="absolute bottom-4 left-6 right-6 h-6 bg-rose-800 border-2 border-slate-900" />
                      <span className="absolute bottom-1 bg-yellow-400 text-slate-950 font-black text-[7px] px-1">NAGA DRAGOROCK</span>
                    </div>

                    {/* Boss HP Bar */}
                    <div className="w-40 h-3 bg-slate-800 border-2 border-slate-900 mt-2 rounded-none overflow-hidden relative">
                      <div 
                        className="h-full bg-rose-500 transition-all duration-300" 
                        style={{ width: `${Math.max(100 - (currentQuestionIndex * 33.3), 10)}%` }} 
                      />
                    </div>
                  </div>

                  {/* Character fighting */}
                  <div className="flex justify-between items-center w-full px-8 my-2">
                    <div className="transform scale-75">
                      <BlockAvatar config={avatarConfig} emote="victory" size="sm" />
                    </div>
                    
                    <div className="text-xs text-yellow-400 font-bold bg-slate-900 border border-slate-800 p-2">
                      ⚔️ Boss HP: {3 - currentQuestionIndex}/3
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 font-bold">
                    🐉 <em>Petunjuk: Selesaikan soal gabungan pengukuran untuk melempar balok sihir ke naga penjaga pulau!</em>
                  </div>
                </div>
              )}

            </div>

            {/* LEVEL PROGRESS TIMERS */}
            <div className="bg-slate-900 p-2 border-t border-slate-800 text-white font-mono text-[10px] flex justify-between">
              <span>⏱️ LEVEL PLAYTIME: {Math.floor(levelPlayTime / 60)}m {levelPlayTime % 60}s</span>
              <span>❓ SOAL {currentQuestionIndex + 1} DARI {currentQuestionsList.length}</span>
            </div>

          </div>

          {/* RIGHT MATH CHALLENGE QUESTION AREA */}
          <div className="w-full md:w-2/5 flex flex-col justify-between">
            
            {/* QUESTION PANEL */}
            <div className="bg-amber-100 border-4 border-slate-800 p-6 shadow-[4px_4px_0px_#1e293b] flex-1 flex flex-col justify-between">
              
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-slate-800/20">
                  <span className="bg-rose-500 text-white font-mono text-[10px] px-2 py-0.5 border border-slate-950">
                    MATERI KELAS 3
                  </span>
                  <span className={`font-black text-xs uppercase px-2 py-0.5 border border-slate-950 ${
                    currentQuestion.difficulty === 'mudah' ? 'bg-emerald-400 text-slate-950' :
                    currentQuestion.difficulty === 'sedang' ? 'bg-amber-400 text-slate-950' : 'bg-rose-400 text-slate-950'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight leading-relaxed mb-6">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* OPTIONS GRID */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const letters = ["Balok A", "Balok B", "Balok C", "Balok D"];
                  const isOptionSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  
                  let optionStyle = "bg-white text-slate-800 hover:bg-slate-100 border-slate-900 shadow-[3px_3px_0px_#1e293b]";
                  if (selectedAnswer) {
                    if (isOptionSelected) {
                      optionStyle = isCorrect 
                        ? "bg-emerald-400 text-slate-950 border-slate-900 shadow-[2px_2px_0px_#1e293b]"
                        : "bg-rose-400 text-slate-950 border-slate-900 shadow-[2px_2px_0px_#1e293b]";
                    } else if (isCorrect) {
                      optionStyle = "bg-emerald-200 text-slate-950 border-slate-900 border-dashed";
                    } else {
                      optionStyle = "bg-white text-slate-400 border-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      id={`option-btn-${idx}`}
                      onClick={() => handleAnswerSubmit(option)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 text-left font-black text-sm border-4 rounded-none transition-all flex items-center justify-between ${optionStyle}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="bg-slate-950 text-white font-mono text-[10px] w-6 h-6 flex items-center justify-center">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      
                      {/* Visual indicator tag */}
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider bg-slate-200/50 px-1.5 py-0.5 border border-slate-300">
                        {letters[idx]}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* EXPLANATION POPUP */}
            {showExplanation && (
              <div id="explanation-box" className="bg-sky-100 border-4 border-slate-800 p-4 mt-3 shadow-[4px_4px_0px_#1e293b] animate-fadeIn">
                <div className="flex justify-between items-center mb-2 pb-1 border-b border-sky-800/20">
                  <h4 className="font-extrabold text-xs text-sky-900 uppercase tracking-wide">
                    💡 PENJELASAN GURU
                  </h4>
                  <span className="text-[9px] bg-sky-300 text-sky-900 font-black px-1 border border-sky-500">
                    KUNCI JAWABAN
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
                <div className="mt-3 text-right">
                  <button
                    id="retry-answer-btn"
                    onClick={handleRetryAfterExplanation}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-[10px] py-1.5 px-3 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] block-btn uppercase"
                  >
                    Coba Lagi 💪
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* VICTORY LEVEL COMPLETION MODAL */}
      {isVictory && activeIsland && (
        <div id="victory-modal" className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-amber-50 border-4 border-slate-800 shadow-[8px_8px_0px_#1e293b] rounded-none p-6 text-center transform rotate-1">
            
            <div className="bg-emerald-400 border-4 border-slate-800 p-4 -mt-12 mb-6 shadow-[4px_4px_0px_#1e293b] transform -rotate-2">
              <span className="text-3xl">🏆</span>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight leading-none uppercase mt-1">
                MISI SELESAI!
              </h2>
              <div className="text-[10px] font-bold text-emerald-950 mt-1 uppercase tracking-wider">
                KAMU MENAKLUKKAN {activeIsland.name}
              </div>
            </div>

            {/* Avatar Pose */}
            <div className="flex justify-center mb-6">
              <BlockAvatar config={avatarConfig} emote="victory" size="md" />
            </div>

            {/* Rewards Card */}
            <div className="bg-white border-4 border-slate-800 p-4 mb-6 shadow-[3px_3px_0px_#1e293b] text-left space-y-3">
              <div className="flex justify-between font-bold text-xs pb-1 border-b border-slate-100">
                <span className="text-slate-500">WAKTU SELESAI:</span>
                <span className="font-mono text-slate-900">{Math.floor(levelPlayTime / 60)} menit {levelPlayTime % 60} detik</span>
              </div>
              <div className="flex justify-between font-bold text-xs pb-1 border-b border-slate-100">
                <span className="text-slate-500">KOIN YANG DIPEROLEH:</span>
                <span className="text-emerald-600 font-mono">+45 Koin 🪙</span>
              </div>
              <div className="flex justify-between font-bold text-xs pb-1 border-b border-slate-100">
                <span className="text-slate-500">XP YANG DIPEROLEH:</span>
                <span className="text-indigo-600 font-mono">+150 XP ⚡</span>
              </div>
              <div className="flex justify-between font-bold text-xs">
                <span className="text-slate-500">BADGE BARU:</span>
                <span className="bg-yellow-400 text-slate-950 px-2 py-0.5 border border-slate-900 text-[10px] font-black uppercase">
                  ⭐ {activeIsland.badgeId}
                </span>
              </div>
            </div>

            <button
              id="continue-campaign-btn"
              onClick={handleCloseVictoryModal}
              className="w-full bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-lg py-3 border-4 border-slate-800 shadow-[4px_4px_0px_#1e293b] block-btn uppercase"
            >
              Lanjutkan Petualangan 🚀
            </button>

          </div>
        </div>
      )}

      {/* GAME OVER LIVES EXHAUSTED MODAL */}
      {isGameOver && (
        <div id="game-over-modal" className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-amber-50 border-4 border-slate-800 shadow-[8px_8px_0px_#1e293b] rounded-none p-6 text-center transform -rotate-1">
            
            <div className="bg-rose-500 border-4 border-slate-800 p-4 -mt-12 mb-6 shadow-[4px_4px_0px_#1e293b] transform rotate-2 text-white">
              <span className="text-3xl">💔</span>
              <h2 className="text-2xl font-black tracking-tight leading-none uppercase mt-1">
                KESEMPATAN HABIS!
              </h2>
              <div className="text-[10px] font-bold text-rose-100 mt-1 uppercase tracking-wider">
                Gagal Menyelesaikan Tantangan Matematika
              </div>
            </div>

            <p className="text-sm font-bold text-slate-700 leading-relaxed mb-6">
              Jangan patah semangat! Setiap petualang hebat pernah gagal. Kamu bisa mencoba lagi pulau ini untuk melatih keterampilan mengukurnya. Guru kelasmu tetap bangga atas usahamu!
            </p>

            <div className="flex space-x-3">
              <button
                id="retry-game-over-btn"
                onClick={handleCloseGameOverModal}
                className="flex-1 bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-sm py-3 border-4 border-slate-800 shadow-[3px_3px_0px_#1e293b] block-btn uppercase"
              >
                Coba Lagi 🔄
              </button>
              <button
                id="exit-game-over-btn"
                onClick={handleCloseGameOverModal}
                className="flex-1 bg-slate-500 hover:bg-slate-400 text-white font-extrabold text-sm py-3 border-4 border-slate-800 shadow-[3px_3px_0px_#1e293b] block-btn uppercase"
              >
                Ke Map 🗺️
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
