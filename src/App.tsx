import React, { useState, useEffect } from 'react';
import StudentLogin from './components/StudentLogin';
import GameWorld from './components/GameWorld';
import TeacherDashboard from './components/TeacherDashboard';
import CharacterCustomizer from './components/CharacterCustomizer';
import { AvatarConfig } from './types';

export default function App() {
  // Navigation Routing: 'login' | 'game' | 'guru'
  const [currentView, setCurrentView] = useState<'login' | 'game' | 'guru'>('login');

  // Student Profile Data
  const [studentData, setStudentData] = useState<{ name: string; group: string; grade: string; absentNo: string } | null>(() => {
    const saved = localStorage.getItem('math_adventure_active_student');
    return saved ? JSON.parse(saved) : null;
  });

  // Avatar customization properties state
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => {
    const saved = localStorage.getItem('math_adventure_avatar_config');
    return saved ? JSON.parse(saved) : {
      gender: 'laki-laki',
      hairStyle: 'spiky',
      hairColor: 'brown',
      hat: 'none',
      glasses: 'none',
      costume: 'adventure',
      shoes: 'boots',
      bag: 'none',
      stepEffect: 'none',
      victoryEffect: 'none'
    };
  });

  // Total balance of learning coins state
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('math_adventure_coins');
    return saved ? parseInt(saved, 10) : 50; // Give initial 50 coins so they can try customize early
  });

  // Control visibility of Avatar customizer modal
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Control visibility of Custom Exit Confirmation Modal
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  // Auto-redirect to active game if student already logged in previously
  useEffect(() => {
    if (studentData) {
      setCurrentView('game');
    }
  }, [studentData]);

  const handleStudentLogin = (data: { name: string; group: string; grade: string; absentNo: string }) => {
    setStudentData(data);
    localStorage.setItem('math_adventure_active_student', JSON.stringify(data));
    setCurrentView('game');
  };

  const handleExitGame = () => {
    setIsExitConfirmOpen(true);
  };

  const confirmExitGame = () => {
    localStorage.removeItem('math_adventure_active_student');
    setStudentData(null);
    setCurrentView('login');
    setIsExitConfirmOpen(false);
  };

  const handleUpdateAvatarConfig = (newConfig: AvatarConfig) => {
    setAvatarConfig(newConfig);
    localStorage.setItem('math_adventure_avatar_config', JSON.stringify(newConfig));
  };

  const handleUpdateCoins = (newCoins: number) => {
    setCoins(newCoins);
    localStorage.setItem('math_adventure_coins', newCoins.toString());
  };

  return (
    <div id="math-adventure-root" className="min-h-screen bg-slate-100 selection:bg-rose-500 selection:text-white">
      
      {/* 1. STUDENT LOGIN LAYER */}
      {currentView === 'login' && (
        <StudentLogin 
          onLogin={handleStudentLogin}
          onSwitchToGuru={() => setCurrentView('guru')}
        />
      )}

      {/* 2. MAIN ADVENTURE GAMEPLAY WORLD LAYER */}
      {currentView === 'game' && studentData && (
        <GameWorld 
          student={studentData}
          avatarConfig={avatarConfig}
          coins={coins}
          onChangeCoins={handleUpdateCoins}
          onExitGame={handleExitGame}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
        />
      )}

      {/* 3. TEACHER DASHBOARD PORTAL */}
      {currentView === 'guru' && (
        <TeacherDashboard 
          onClose={() => {
            if (studentData) {
              setCurrentView('game');
            } else {
              setCurrentView('login');
            }
          }}
        />
      )}

      {/* 4. AVATAR WORKSHOP OVERLAY MODAL */}
      {isCustomizerOpen && (
        <CharacterCustomizer 
          config={avatarConfig}
          onChangeConfig={handleUpdateAvatarConfig}
          coins={coins}
          onChangeCoins={handleUpdateCoins}
          onClose={() => setIsCustomizerOpen(false)}
        />
      )}

      {/* 5. CUSTOM EXIT CONFIRMATION MODAL */}
      {isExitConfirmOpen && (
        <div id="custom-exit-modal" className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-display">
          <div className="w-full max-w-md bg-amber-50 border-4 border-slate-800 shadow-[8px_8px_0px_#1e293b] p-6 text-center transform rotate-1">
            
            <div className="bg-rose-500 text-white border-4 border-slate-800 p-4 -mt-12 mb-6 shadow-[4px_4px_0px_#1e293b] transform -rotate-2">
              <span className="text-3xl">🚪</span>
              <h2 className="text-xl font-black tracking-tight leading-none uppercase mt-1">
                KELUAR PETUALANGAN?
              </h2>
            </div>

            <p className="text-sm font-bold text-slate-700 leading-relaxed mb-6">
              Apakah kamu yakin ingin keluar dari petualangan saat ini, {studentData?.name}? Progress belajarmu tersimpan dengan aman di database Guru!
            </p>

            <div className="flex space-x-3">
              <button
                id="confirm-exit-yes"
                onClick={confirmExitGame}
                className="flex-1 bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs py-3 border-4 border-slate-800 shadow-[3px_3px_0px_#1e293b] block-btn uppercase"
              >
                Ya, Keluar 👋
              </button>
              <button
                id="confirm-exit-no"
                onClick={() => setIsExitConfirmOpen(false)}
                className="flex-1 bg-slate-500 hover:bg-slate-400 text-white font-extrabold text-xs py-3 border-4 border-slate-800 shadow-[3px_3px_0px_#1e293b] block-btn uppercase"
              >
                Tidak, Tetap Main 🎮
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
