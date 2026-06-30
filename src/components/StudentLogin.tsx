import React, { useState } from 'react';

interface StudentLoginProps {
  onLogin: (data: { name: string; group: string; grade: string; absentNo: string }) => void;
  onSwitchToGuru: () => void;
}

export default function StudentLogin({ onLogin, onSwitchToGuru }: StudentLoginProps) {
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [grade, setGrade] = useState('3-A');
  const [absentNo, setAbsentNo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Masukkan nama petualangmu!');
      return;
    }
    if (!group.trim()) {
      setError('Masukkan nama kelompok belajarmu!');
      return;
    }
    setError('');
    onLogin({
      name: name.trim(),
      group: group.trim(),
      grade,
      absentNo: absentNo.trim() || '-'
    });
  };

  return (
    <div id="student-login-container" className="min-h-screen bg-sky-200 flex flex-col items-center justify-center p-4 relative overflow-hidden font-display">
      
      {/* Decorative Cloud Blocks */}
      <div className="absolute top-10 left-10 w-24 h-12 bg-white rounded-none border-4 border-slate-800 shadow-[4px_4px_0px_#1e293b]" />
      <div className="absolute top-20 right-16 w-32 h-16 bg-white rounded-none border-4 border-slate-800 shadow-[4px_4px_0px_#1e293b]" />
      <div className="absolute bottom-16 left-20 w-36 h-12 bg-white rounded-none border-4 border-slate-800 shadow-[4px_4px_0px_#1e293b]" />
      
      {/* Sun Block */}
      <div className="absolute top-6 right-10 w-20 h-20 bg-amber-400 border-4 border-slate-800 shadow-[6px_6px_0px_#d97706]" />

      {/* Decorative Voxel Grass Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-emerald-500 border-t-4 border-slate-800" />
      <div className="absolute bottom-10 left-0 right-0 h-4 bg-emerald-600" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-amber-100 rounded-none border-4 border-slate-800 shadow-[8px_8px_0px_#1e293b] p-6 z-10 relative">
        
        {/* Banner Title */}
        <div className="bg-yellow-400 border-4 border-slate-800 p-4 -mt-12 mb-6 shadow-[4px_4px_0px_#1e293b] text-center transform -rotate-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
            MATH ADVENTURE
          </h1>
          <div className="text-lg font-bold text-slate-800 mt-1 tracking-wider uppercase">
            Block World 3D
          </div>
          <span className="inline-block bg-rose-500 text-white text-xs px-2 py-0.5 mt-2 border-2 border-slate-800 font-mono">
            KANTOR PUSAT KELAS 3
          </span>
        </div>

        {/* Character Illustration blocky preview */}
        <div className="flex justify-center mb-6">
          <div className="relative w-28 h-28 bg-emerald-400 border-4 border-slate-800 flex items-center justify-center shadow-[4px_4px_0px_#1e293b]">
            {/* Voxel head */}
            <div className="w-16 h-16 bg-amber-200 border-4 border-slate-800 relative">
              {/* Hair block */}
              <div className="absolute -top-3 -left-1 -right-1 h-6 bg-amber-900 border-b-4 border-slate-800" />
              {/* Eyes */}
              <div className="absolute top-5 left-2 w-3 h-3 bg-slate-900" />
              <div className="absolute top-5 right-2 w-3 h-3 bg-slate-900" />
              {/* Cheeks */}
              <div className="absolute top-8 left-1 w-2 h-1 bg-rose-400" />
              <div className="absolute top-8 right-1 w-2 h-1 bg-rose-400" />
              {/* Mouth */}
              <div className="absolute bottom-2 left-6 right-6 h-1 bg-slate-900" />
            </div>
            {/* Tiny hat badge */}
            <div className="absolute -top-4 bg-yellow-400 text-xs font-bold border-2 border-slate-800 px-1 transform rotate-6">
              PETUALANG!
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-400 text-slate-900 border-4 border-slate-800 p-2 mb-4 font-bold text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">
              NAMA PETUALANG (SISWA) *
            </label>
            <input
              id="student-name-input"
              type="text"
              placeholder="Contoh: Andi Pratama"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-white border-4 border-slate-800 shadow-[2px_2px_0px_#1e293b] font-bold text-slate-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                KELOMPOK BELAJAR *
              </label>
              <input
                id="student-group-input"
                type="text"
                placeholder="Contoh: Garuda, Melati"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full p-2.5 bg-white border-4 border-slate-800 shadow-[2px_2px_0px_#1e293b] font-bold text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                KELAS *
              </label>
              <select
                id="student-grade-select"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-2.5 bg-white border-4 border-slate-800 shadow-[2px_2px_0px_#1e293b] font-bold text-slate-800 focus:outline-none"
              >
                <option value="3-A">Kelas 3-A</option>
                <option value="3-B">Kelas 3-B</option>
                <option value="3-C">Kelas 3-C</option>
                <option value="3-D">Kelas 3-D</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">
              NOMOR ABSEN <span className="text-slate-500 font-normal">(pilihan)</span>
            </label>
            <input
              id="student-absent-input"
              type="number"
              placeholder="Contoh: 14"
              value={absentNo}
              onChange={(e) => setAbsentNo(e.target.value)}
              className="w-full p-2.5 bg-white border-4 border-slate-800 shadow-[2px_2px_0px_#1e293b] font-bold text-slate-800 focus:outline-none"
            />
          </div>

          <button
            id="student-start-btn"
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-lg py-3 px-4 border-4 border-slate-800 shadow-[4px_4px_0px_#1e293b] transition-all transform hover:-translate-y-0.5 active:translate-y-1 block-btn"
          >
            MULAI PETUALANGAN! 🚀
          </button>
        </form>

        <div className="border-t-4 border-dashed border-slate-800 my-4 pt-4 text-center">
          <button
            id="switch-to-guru-btn"
            onClick={onSwitchToGuru}
            className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm py-2 px-4 border-4 border-slate-800 shadow-[2px_2px_0px_#1e293b] block-btn"
          >
            Masuk Sebagai Guru 👩‍🏫
          </button>
        </div>
      </div>
    </div>
  );
}
