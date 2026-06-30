import React, { useState, useEffect } from 'react';
import { Question, StudentReport, BADGES } from '../types';

interface TeacherDashboardProps {
  onClose: () => void;
}

export default function TeacherDashboard({ onClose }: TeacherDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('guru3a');
  const [password, setPassword] = useState('kelas3keren');
  const [loginError, setLoginError] = useState('');

  // Dashboard state tabs
  const [activeTab, setActiveTab] = useState<'monitoring' | 'banksoal' | 'generate'>('monitoring');

  // Question bank state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Question Form state (Add/Edit)
  const [isEditing, setIsEditing] = useState<string | null>(null); // question ID
  const [formCategory, setFormCategory] = useState<'panjang' | 'berat' | 'waktu' | 'volume' | 'gabungan'>('panjang');
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectAnswer, setFormCorrectAnswer] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'mudah' | 'sedang' | 'sulit'>('sedang');
  const [formExplanation, setFormExplanation] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // AI Generator Form State
  const [aiCategory, setAiCategory] = useState<'panjang' | 'berat' | 'waktu' | 'volume' | 'gabungan'>('panjang');
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<'mudah' | 'sedang' | 'sulit'>('sedang');
  const [aiIsGenerating, setAiIsGenerating] = useState(false);
  const [aiGeneratedList, setAiGeneratedList] = useState<Question[]>([]);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  // CSV Import State
  const [csvFileContent, setCsvFileContent] = useState('');
  const [csvSuccessMsg, setCsvSuccessMsg] = useState('');

  // Ranking view state
  const [rankingType, setRankingType] = useState<'individu' | 'kelompok'>('individu');

  useEffect(() => {
    if (isAuthenticated) {
      fetchQuestions();
      fetchReports();
    }
  }, [isAuthenticated]);

  const fetchQuestions = () => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(resData => {
        if (resData.status === 'success') {
          setQuestions(resData.data);
        }
      });
  };

  const fetchReports = () => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(resData => {
        if (resData.status === 'success') {
          setReports(resData.data);
        }
      });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'guru3a' && password === 'kelas3keren') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Username atau password salah! (Tips: gunakan guru3a / kelas3keren)');
    }
  };

  // CRUD Actions
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formCorrectAnswer.trim() || formOptions.some(opt => !opt.trim()) || !formExplanation.trim()) {
      setFormError('Harap lengkapi semua isian pertanyaan beserta penjelasannya!');
      return;
    }

    if (!formOptions.includes(formCorrectAnswer)) {
      setFormError('Jawaban yang benar harus ada dalam daftar 4 opsi jawaban!');
      return;
    }

    const payload = {
      category: formCategory,
      question: formQuestion.trim(),
      options: formOptions.map(o => o.trim()),
      correctAnswer: formCorrectAnswer.trim(),
      difficulty: formDifficulty,
      explanation: formExplanation.trim()
    };

    const url = isEditing ? `/api/questions/${isEditing}` : '/api/questions';
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.status === 'success') {
          setFormSuccess(isEditing ? 'Soal berhasil diperbarui!' : 'Soal baru berhasil ditambahkan!');
          setFormError('');
          resetQuestionForm();
          fetchQuestions();
        } else {
          setFormError(resData.message || 'Gagal menyimpan soal.');
        }
      })
      .catch(err => setFormError('Gagal terhubung dengan server: ' + err.message));
  };

  const handleEditClick = (q: Question) => {
    setIsEditing(q.id);
    setFormCategory(q.category);
    setFormQuestion(q.question);
    setFormOptions([...q.options]);
    setFormCorrectAnswer(q.correctAnswer);
    setFormDifficulty(q.difficulty);
    setFormExplanation(q.explanation);
    setFormError('');
    setFormSuccess('');
    // Scroll to form
    const formElement = document.getElementById('question-form-box');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Apakah Ibu/Bapak Guru yakin ingin menghapus soal ini dari petualangan siswa?')) {
      fetch(`/api/questions/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(resData => {
          if (resData.status === 'success') {
            fetchQuestions();
          }
        });
    }
  };

  const resetQuestionForm = () => {
    setIsEditing(null);
    setFormQuestion('');
    setFormOptions(['', '', '', '']);
    setFormCorrectAnswer('');
    setFormExplanation('');
  };

  // AI Question Generator
  const handleGenerateAI = (e: React.FormEvent) => {
    e.preventDefault();
    setAiIsGenerating(true);
    setAiSuccessMsg('');

    fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: aiCategory,
        topic: aiTopic.trim(),
        difficulty: aiDifficulty
      })
    })
      .then(res => res.json())
      .then(resData => {
        setAiIsGenerating(false);
        if (resData.status === 'success') {
          setAiGeneratedList(resData.data);
          setAiSuccessMsg('Berhasil merumuskan soal matematika kelas 3 berkat bantuan AI Gemini! 🌟');
        } else {
          alert('Gagal menghasilkan soal: ' + resData.message);
        }
      })
      .catch(err => {
        setAiIsGenerating(false);
        alert('Gagal memproses AI: ' + err.message);
      });
  };

  const handleAcceptAIQuestion = (aiQ: Question) => {
    fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: aiQ.category,
        question: aiQ.question,
        options: aiQ.options,
        correctAnswer: aiQ.correctAnswer,
        difficulty: aiQ.difficulty,
        explanation: aiQ.explanation
      })
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.status === 'success') {
          alert('Soal hasil AI berhasil dimasukkan ke Bank Soal Aktif! ✅');
          setAiGeneratedList(prev => prev.filter(q => q.id !== aiQ.id));
          fetchQuestions();
        }
      });
  };

  // CSV Import / Export Actions
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,Question,Option1,Option2,Option3,Option4,CorrectAnswer,Difficulty,Explanation\n";
    
    questions.forEach(q => {
      const row = [
        q.category,
        `"${q.question.replace(/"/g, '""')}"`,
        `"${q.options[0].replace(/"/g, '""')}"`,
        `"${q.options[1].replace(/"/g, '""')}"`,
        `"${q.options[2].replace(/"/g, '""')}"`,
        `"${q.options[3].replace(/"/g, '""')}"`,
        `"${q.correctAnswer.replace(/"/g, '""')}"`,
        q.difficulty,
        `"${q.explanation.replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bank_soal_math_adventure.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSVTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFileContent.trim()) {
      alert("Silakan masukkan teks CSV atau template terlebih dahulu!");
      return;
    }

    try {
      const lines = csvFileContent.split("\n");
      let count = 0;
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Custom parser to handle quotes simply
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (matches && matches.length >= 9) {
          const clean = matches.map(m => m.replace(/^"|"$/g, '').trim());
          const category = clean[0] as any;
          const question = clean[1];
          const options = [clean[2], clean[3], clean[4], clean[5]];
          const correctAnswer = clean[6];
          const difficulty = clean[7] as any;
          const explanation = clean[8];

          // Post to server
          fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, question, options, correctAnswer, difficulty, explanation })
          });
          count++;
        }
      }

      setCsvSuccessMsg(`Berhasil mengimpor ${count} soal baru dari teks CSV! ✅`);
      setCsvFileContent('');
      setTimeout(() => {
        fetchQuestions();
        setCsvSuccessMsg('');
      }, 2000);

    } catch (err: any) {
      alert("Format CSV salah! Mohon gunakan template header yang ditentukan.");
    }
  };

  // Group Rankings Calculation
  const getGroupRankings = () => {
    const groupMap: Record<string, { name: string; totalXp: number; totalScore: number; studentCount: number }> = {};
    
    reports.forEach(r => {
      if (!groupMap[r.group]) {
        groupMap[r.group] = { name: r.group, totalXp: 0, totalScore: 0, studentCount: 0 };
      }
      groupMap[r.group].totalXp += r.xpEarned;
      groupMap[r.group].totalScore += r.score;
      groupMap[r.group].studentCount += 1;
    });

    return Object.values(groupMap).map(g => ({
      ...g,
      averageScore: Math.round(g.totalScore / g.studentCount)
    })).sort((a, b) => b.totalScore - a.totalScore);
  };

  // Filtered & Sorted reports
  const getSortedIndividualReports = () => {
    return [...reports].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Higher score first
      }
      return a.totalPlayTime - b.totalPlayTime; // Faster completion first
    });
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || q.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="teacher-dashboard-wrapper" className="min-h-screen bg-slate-100 font-display text-slate-800 flex flex-col">
      
      {/* HEADER BAR */}
      <header className="bg-slate-900 text-white px-6 py-4 border-b-4 border-slate-900 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">👩‍🏫</span>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase text-yellow-400">
              Math Adventure: Dashboard Guru
            </h1>
            <p className="text-[10px] text-slate-300 font-bold uppercase">
              Pemantauan Belajar & Bank Soal Kelas 3 SD
            </p>
          </div>
        </div>
        <button
          id="close-dashboard-btn"
          onClick={onClose}
          className="bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-sm py-2 px-4 border-3 border-slate-800 shadow-[2px_2px_0px_#1e293b] block-btn uppercase"
        >
          Masuk ke Game 🚪
        </button>
      </header>

      {/* LOGIN VIEW */}
      {!isAuthenticated ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-200">
          <div className="w-full max-w-md bg-amber-50 border-4 border-slate-800 p-6 shadow-[6px_6px_0px_#1e293b]">
            <div className="bg-sky-500 text-white border-4 border-slate-800 p-3 mb-6 shadow-[3px_3px_0px_#1e293b] text-center">
              <h2 className="text-lg font-black uppercase tracking-tight">KONTROL GURU & INSTRUKTUR</h2>
              <p className="text-xs text-sky-100 font-bold">Harap masuk menggunakan akun guru yang terdaftar</p>
            </div>

            {loginError && (
              <div className="bg-rose-400 text-slate-950 border-4 border-slate-800 p-2 mb-4 font-bold text-xs text-center">
                ⚠️ {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase mb-1">Username Guru</label>
                <input
                  id="guru-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 bg-white border-4 border-slate-800 font-bold text-sm"
                  placeholder="Masukkan username"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase mb-1">Password</label>
                <input
                  id="guru-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 bg-white border-4 border-slate-800 font-bold text-sm"
                  placeholder="Masukkan password"
                />
                <span className="text-[10px] text-slate-500 font-bold italic mt-1 block">Petunjuk Masuk Default: <strong>guru3a</strong> / <strong>kelas3keren</strong></span>
              </div>

              <button
                id="guru-login-submit"
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-3 border-4 border-slate-800 shadow-[4px_4px_0px_#1e293b] block-btn uppercase text-sm"
              >
                Masuk Dashboard 🔑
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* MAIN DASHBOARD CONTENT (AUTHENTICATED) */
        <div className="flex-1 flex flex-col md:flex-row">
          
          {/* SIDEBAR TABS */}
          <aside className="w-full md:w-56 bg-slate-900 text-white border-r-4 border-slate-900 p-4 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="bg-slate-800 p-3 mb-4 text-center border-2 border-slate-700">
                <div className="text-xl">👩‍🏫</div>
                <div className="text-xs font-black uppercase text-yellow-400 mt-1">Ibu Sri Wahyuni</div>
                <div className="text-[8px] text-slate-400 uppercase tracking-widest mt-0.5">Guru Matematika SD</div>
              </div>

              <button
                id="tab-monitoring-btn"
                onClick={() => setActiveTab('monitoring')}
                className={`w-full text-left p-3 text-xs font-black uppercase border-2 flex items-center justify-between ${
                  activeTab === 'monitoring' ? 'bg-amber-100 text-slate-950 border-amber-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                }`}
              >
                <span>📊 Monitor Siswa</span>
                <span className="bg-slate-950 text-white text-[9px] px-1 font-mono">{reports.length}</span>
              </button>

              <button
                id="tab-banksoal-btn"
                onClick={() => setActiveTab('banksoal')}
                className={`w-full text-left p-3 text-xs font-black uppercase border-2 flex items-center justify-between ${
                  activeTab === 'banksoal' ? 'bg-amber-100 text-slate-950 border-amber-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                }`}
              >
                <span>📝 Bank Soal CRUD</span>
                <span className="bg-slate-950 text-white text-[9px] px-1 font-mono">{questions.length}</span>
              </button>

              <button
                id="tab-generate-btn"
                onClick={() => setActiveTab('generate')}
                className={`w-full text-left p-3 text-xs font-black uppercase border-2 flex items-center justify-between ${
                  activeTab === 'generate' ? 'bg-amber-100 text-slate-950 border-amber-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                }`}
              >
                <span>🤖 AI Question Lab</span>
                <span className="bg-rose-500 text-white text-[8px] px-1 font-mono">NEW</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-500 text-center font-bold">
              ©️ Math Adventure Voxel 2026
            </div>
          </aside>

          {/* MAIN WORKING CANVAS */}
          <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-80px)]">

            {/* TAB 1: MONITORING SISWA & RANKINGS */}
            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                
                {/* Ranking Summary Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* INDIVIDUAL RANKINGS LIST */}
                  <div className="bg-amber-50 border-4 border-slate-800 p-4 shadow-[4px_4px_0px_#1e293b]">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-slate-800/20">
                      <h3 className="font-black text-sm uppercase text-slate-900">🏆 Peringkat Individu (Skor & Waktu)</h3>
                      <span className="bg-sky-500 text-white text-[8px] font-black px-1.5 uppercase">TERKINI</span>
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {getSortedIndividualReports().map((rep, idx) => (
                        <div key={rep.id} className="bg-white border-2 border-slate-800 p-2.5 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`w-6 h-6 flex items-center justify-center font-bold text-xs text-white ${
                              idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700' : 'bg-slate-800'
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <div className="text-xs font-black text-slate-900">{rep.name}</div>
                              <div className="text-[9px] text-slate-500 font-bold uppercase">{rep.grade} | {rep.group}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-extrabold text-emerald-600 font-mono">{rep.score} Pts</div>
                            <div className="text-[9px] text-slate-400 font-mono">⏱️ {rep.totalPlayTime}s</div>
                          </div>
                        </div>
                      ))}
                      {reports.length === 0 && (
                        <div className="text-xs italic text-slate-400 text-center py-6">Belum ada data pengerjaan siswa.</div>
                      )}
                    </div>
                  </div>

                  {/* GROUP RANKINGS LIST */}
                  <div className="bg-amber-50 border-4 border-slate-800 p-4 shadow-[4px_4px_0px_#1e293b]">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-slate-800/20">
                      <h3 className="font-black text-sm uppercase text-slate-900">🚩 Peringkat Kelompok Belajar</h3>
                      <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 uppercase">KUMULATIF</span>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {getGroupRankings().map((g, idx) => (
                        <div key={idx} className="bg-white border-2 border-slate-800 p-2.5 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">🚩</span>
                            <div>
                              <div className="text-xs font-black text-slate-900">{g.name}</div>
                              <div className="text-[9px] text-slate-500 font-bold uppercase">{g.studentCount} Siswa Berpartisipasi</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-black text-indigo-600 font-mono">Tot: {g.totalScore} Pts</div>
                            <div className="text-[9px] text-slate-400 font-bold">Rata-rata: {g.averageScore} Pts</div>
                          </div>
                        </div>
                      ))}
                      {reports.length === 0 && (
                        <div className="text-xs italic text-slate-400 text-center py-6">Belum ada data pengerjaan kelompok.</div>
                      )}
                    </div>
                  </div>

                </div>

                {/* DETAILED MONITORING TABLE */}
                <div className="bg-white border-4 border-slate-800 p-4 shadow-[4px_4px_0px_#1e293b]">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-slate-100">
                    <div>
                      <h3 className="font-black text-base text-slate-900">📊 Tabel Pemantauan Aktivitas Siswa</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Catatan performa pengerjaan soal dan durasi bermain langsung</p>
                    </div>
                    <button
                      id="refresh-reports-btn"
                      onClick={fetchReports}
                      className="bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-[10px] py-1.5 px-3 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] block-btn uppercase"
                    >
                      Segarkan Data 🔄
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b-4 border-slate-900 text-xs font-black uppercase text-slate-700">
                          <th className="p-3">Nama</th>
                          <th className="p-3">Kelas</th>
                          <th className="p-3">Kelompok</th>
                          <th className="p-3 text-center">Nilai</th>
                          <th className="p-3 text-center">XP</th>
                          <th className="p-3 text-center">Percobaan</th>
                          <th className="p-3">Lama Bermain</th>
                          <th className="p-3">Lama Jawab Soal</th>
                          <th className="p-3">Badge Diperoleh</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {reports.map((rep) => (
                          <tr key={rep.id} className="text-xs hover:bg-slate-50 font-bold">
                            <td className="p-3 text-slate-900">{rep.name}</td>
                            <td className="p-3 text-slate-500">{rep.grade}</td>
                            <td className="p-3 text-slate-600">{rep.group}</td>
                            <td className="p-3 text-center text-emerald-600 font-black">{rep.score}</td>
                            <td className="p-3 text-center text-indigo-600 font-mono">{rep.xpEarned}</td>
                            <td className="p-3 text-center font-mono">{rep.attempts}</td>
                            <td className="p-3 text-slate-500 font-mono">{Math.floor(rep.totalPlayTime / 60)}m {rep.totalPlayTime % 60}s</td>
                            <td className="p-3 text-slate-500 font-mono">{Math.floor(rep.totalAnswerTime / 60)}m {rep.totalAnswerTime % 60}s</td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {rep.badges.map((b, i) => (
                                  <span key={i} className="bg-amber-100 text-amber-950 px-1.5 py-0.5 border border-amber-300 text-[8px] font-black uppercase">
                                    ⭐ {b}
                                  </span>
                                ))}
                                {rep.badges.length === 0 && <span className="text-slate-400 italic text-[10px]">Belum ada</span>}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {reports.length === 0 && (
                          <tr>
                            <td colSpan={9} className="p-8 text-center text-xs italic text-slate-400">Belum ada siswa yang masuk dan memulai petualangan matematika.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: BANK SOAL CRUD & EXCEL IMPORT/EXPORT */}
            {activeTab === 'banksoal' && (
              <div className="space-y-6">
                
                {/* TOP CONTROL GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* FORM TO ADD/EDIT QUESTION */}
                  <div id="question-form-box" className="lg:col-span-2 bg-amber-50 border-4 border-slate-800 p-5 shadow-[4px_4px_0px_#1e293b]">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-slate-800/20">
                      <h3 className="font-black text-sm uppercase text-slate-900">
                        {isEditing ? `📝 Edit Soal (${isEditing})` : "➕ Tambah Soal Pengukuran Baru"}
                      </h3>
                      {isEditing && (
                        <button
                          id="cancel-edit-btn"
                          onClick={resetQuestionForm}
                          className="bg-slate-500 text-white font-bold text-[9px] px-2 py-1 uppercase"
                        >
                          Batal Edit
                        </button>
                      )}
                    </div>

                    {formError && (
                      <div className="bg-rose-400 text-slate-950 border-4 border-slate-800 p-2 mb-4 font-bold text-xs">
                        ⚠️ {formError}
                      </div>
                    )}

                    {formSuccess && (
                      <div className="bg-emerald-400 text-slate-950 border-4 border-slate-800 p-2 mb-4 font-bold text-xs">
                        🎉 {formSuccess}
                      </div>
                    )}

                    <form onSubmit={handleSaveQuestion} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-800 uppercase mb-1">Materi / Kategori</label>
                          <select
                            id="form-category-select"
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value as any)}
                            className="w-full p-2 bg-white border-2 border-slate-800 text-xs font-bold"
                          >
                            <option value="panjang">Satuan Panjang 📏</option>
                            <option value="berat">Satuan Berat ⚖️</option>
                            <option value="waktu">Satuan Waktu ⏱️</option>
                            <option value="volume">Satuan Volume 🧪</option>
                            <option value="gabungan">Gabungan/Master 👑</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-800 uppercase mb-1">Kesulitan</label>
                          <select
                            id="form-difficulty-select"
                            value={formDifficulty}
                            onChange={(e) => setFormDifficulty(e.target.value as any)}
                            className="w-full p-2 bg-white border-2 border-slate-800 text-xs font-bold"
                          >
                            <option value="mudah">Mudah</option>
                            <option value="sedang">Sedang</option>
                            <option value="sulit">Sulit</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-800 uppercase mb-1">Teks Pertanyaan</label>
                        <textarea
                          id="form-question-textarea"
                          rows={2}
                          value={formQuestion}
                          onChange={(e) => setFormQuestion(e.target.value)}
                          className="w-full p-2 bg-white border-2 border-slate-800 text-xs font-bold"
                          placeholder="Masukkan pertanyaan yang ramah anak SD kelas 3..."
                        />
                      </div>

                      {/* 4 Options Fields */}
                      <div className="grid grid-cols-2 gap-3">
                        {formOptions.map((opt, idx) => (
                          <div key={idx}>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">
                              Balok {String.fromCharCode(65 + idx)} (Opsi {idx + 1})
                            </label>
                            <input
                              id={`form-option-input-${idx}`}
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const copy = [...formOptions];
                                copy[idx] = e.target.value;
                                setFormOptions(copy);
                              }}
                              className="w-full p-2 bg-white border-2 border-slate-800 text-xs font-bold"
                              placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-800 uppercase mb-1">Jawaban yang Benar (Harus Persis Sama)</label>
                          <input
                            id="form-correct-input"
                            type="text"
                            value={formCorrectAnswer}
                            onChange={(e) => setFormCorrectAnswer(e.target.value)}
                            className="w-full p-2 bg-white border-2 border-slate-800 text-xs font-bold"
                            placeholder="Masukkan teks jawaban benar..."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-800 uppercase mb-1">Langkah Penjelasan Singkat (Pembahasan)</label>
                          <input
                            id="form-explanation-input"
                            type="text"
                            value={formExplanation}
                            onChange={(e) => setFormExplanation(e.target.value)}
                            className="w-full p-2 bg-white border-2 border-slate-800 text-xs font-bold"
                            placeholder="Mengapa jawaban ini benar? Jelaskan sederhana..."
                          />
                        </div>
                      </div>

                      <button
                        id="form-save-submit"
                        type="submit"
                        className="w-full bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs py-2.5 border-3 border-slate-800 shadow-[2px_2px_0px_#1e293b] block-btn uppercase"
                      >
                        {isEditing ? "Perbarui Soal Petualangan 📝" : "Masukkan ke Pulau Petualangan 🚀"}
                      </button>
                    </form>
                  </div>

                  {/* IMPORT EXCEL / CSV TOOL */}
                  <div className="bg-sky-50 border-4 border-slate-800 p-5 shadow-[4px_4px_0px_#1e293b] flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-sm uppercase text-slate-900 mb-2 pb-1 border-b border-sky-800/20">
                        📥 Import dari Excel / CSV
                      </h3>
                      <p className="text-[10px] text-slate-600 font-bold mb-4 leading-relaxed">
                        Tempelkan data baris CSV dengan format kolom:<br />
                        <code>Category,Question,Option1,Option2,Option3,Option4,CorrectAnswer,Difficulty,Explanation</code>
                      </p>

                      {csvSuccessMsg && (
                        <div className="bg-emerald-400 text-slate-950 border-2 border-slate-800 p-2 mb-3 text-xs font-bold">
                          {csvSuccessMsg}
                        </div>
                      )}

                      <form onSubmit={handleImportCSVTextSubmit} className="space-y-3">
                        <textarea
                          id="csv-text-area"
                          rows={4}
                          value={csvFileContent}
                          onChange={(e) => setCsvFileContent(e.target.value)}
                          placeholder='panjang,"2 m = ... cm","20 cm","200 cm","2000 cm","50 cm","200 cm","mudah","1 m = 100 cm"'
                          className="w-full p-2 bg-white border-2 border-slate-800 text-xs font-mono"
                        />
                        <button
                          id="csv-import-submit"
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]"
                        >
                          Impor Baris CSV 📂
                        </button>
                      </form>
                    </div>

                    <div className="border-t border-sky-800/20 pt-3 mt-4 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">EKSPOR DAFTAR SOAL</span>
                      <button
                        id="csv-export-btn"
                        onClick={handleExportCSV}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-[10px] py-1.5 px-3 border-2 border-slate-950 shadow-[1px_1px_0px_#000]"
                      >
                        Ekspor ke Excel/CSV 💾
                      </button>
                    </div>
                  </div>

                </div>

                {/* CURRENT ACTIVE QUESTIONS LIST & FILTERING */}
                <div className="bg-white border-4 border-slate-800 p-4 shadow-[4px_4px_0px_#1e293b]">
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 pb-3 border-b-2 border-slate-100">
                    <div>
                      <h3 className="font-black text-base text-slate-900">📝 Soal yang Aktif di Pulau</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Total {filteredQuestions.length} soal termuat dalam database</p>
                    </div>

                    {/* Search & Category Filter */}
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      <input
                        id="question-search-input"
                        type="text"
                        placeholder="Cari kata kunci..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="p-2 border-2 border-slate-800 text-xs font-bold"
                      />
                      <select
                        id="category-filter-select"
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        className="p-2 border-2 border-slate-800 text-xs font-bold"
                      >
                        <option value="all">Semua Pulau 🗺️</option>
                        <option value="panjang">Pulau Panjang 📏</option>
                        <option value="berat">Pulau Berat ⚖️</option>
                        <option value="waktu">Pulau Waktu ⏱️</option>
                        <option value="volume">Pulau Volume 🧪</option>
                        <option value="gabungan">Pulau Master 👑</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {filteredQuestions.map((q, idx) => (
                      <div key={q.id} className="bg-slate-50 border-2 border-slate-800 p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="bg-slate-900 text-white font-mono text-[9px] px-1.5 py-0.5">
                              {q.category.toUpperCase()}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-1 border ${
                              q.difficulty === 'mudah' ? 'bg-emerald-100 text-emerald-800' :
                              q.difficulty === 'sedang' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900">{idx + 1}. {q.question}</h4>
                          <p className="text-[10px] text-slate-500 font-bold">Opsi: {q.options.join(" | ")}</p>
                          <p className="text-[10px] text-emerald-600 font-black">✔️ Jawaban Benar: {q.correctAnswer}</p>
                          <p className="text-[10px] text-slate-600 font-bold italic">💡 Penjelasan: {q.explanation}</p>
                        </div>

                        <div className="flex space-x-2 self-end md:self-center">
                          <button
                            id={`edit-question-btn-${q.id}`}
                            onClick={() => handleEditClick(q)}
                            className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-[10px] px-2 py-1 border border-slate-900 shadow-[1px_1px_0px_#000]"
                          >
                            Edit
                          </button>
                          <button
                            id={`delete-question-btn-${q.id}`}
                            onClick={() => handleDeleteClick(q.id)}
                            className="bg-rose-500 hover:bg-rose-400 text-white font-bold text-[10px] px-2 py-1 border border-slate-900 shadow-[1px_1px_0px_#000]"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredQuestions.length === 0 && (
                      <div className="text-center italic text-slate-400 text-xs py-8">Soal tidak ditemukan untuk filter saat ini.</div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: AI GENERATE LAB */}
            {activeTab === 'generate' && (
              <div className="space-y-6">
                
                <div className="bg-amber-50 border-4 border-slate-800 p-5 shadow-[4px_4px_0px_#1e293b]">
                  <div className="bg-rose-500 text-white border-2 border-slate-950 p-3 mb-4">
                    <h3 className="font-black text-sm uppercase tracking-wide">🤖 Ruang Kerja Gemini AI Question Planner</h3>
                    <p className="text-[10px] text-rose-100 font-bold">Ketik konteks petualangan impian anak-anak (misalnya: harta karun kelinci, dunia buah, zirah besi) dan biarkan AI merumuskan soal matematika kelas 3 yang interaktif.</p>
                  </div>

                  <form onSubmit={handleGenerateAI} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-800 uppercase mb-1">Materi Matematika</label>
                      <select
                        id="ai-category-select"
                        value={aiCategory}
                        onChange={(e) => setAiCategory(e.target.value as any)}
                        className="w-full p-2 bg-white border-2 border-slate-800 text-xs font-bold"
                      >
                        <option value="panjang">Pengukuran Panjang 📏</option>
                        <option value="berat">Pengukuran Berat ⚖️</option>
                        <option value="waktu">Pengukuran Waktu ⏱️</option>
                        <option value="volume">Pengukuran Volume 🧪</option>
                        <option value="gabungan">Gabungan/Master 👑</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-800 uppercase mb-1">Tingkat Kesulitan</label>
                      <select
                        id="ai-difficulty-select"
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value as any)}
                        className="w-full p-2 bg-white border-2 border-slate-800 text-xs font-bold"
                      >
                        <option value="mudah">Mudah (Dasar)</option>
                        <option value="sedang">Sedang (Kontekstual)</option>
                        <option value="sulit">Sulit (Pemecahan Masalah)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 flex gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-800 uppercase mb-1">Topik Petualangan Anak (Konteks)</label>
                        <input
                          id="ai-topic-input"
                          type="text"
                          value={aiTopic}
                          onChange={(e) => setAiTopic(e.target.value)}
                          className="w-full p-2 bg-white border-2 border-slate-800 text-xs font-bold"
                          placeholder="Misal: Spiderman, Candi Prambanan, Kebun Wortel..."
                        />
                      </div>

                      <button
                        id="ai-generate-submit"
                        type="submit"
                        disabled={aiIsGenerating}
                        className="bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs px-4 h-[38px] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center min-w-[120px]"
                      >
                        {aiIsGenerating ? (
                          <span className="flex items-center space-x-1">
                            <span className="animate-spin text-sm">🌀</span> <span>Berpikir...</span>
                          </span>
                        ) : "Cari/Buat Soal AI 🪄"}
                      </button>
                    </div>
                  </form>

                  {aiSuccessMsg && (
                    <div className="bg-emerald-400 text-slate-950 border-4 border-slate-800 p-2 mb-4 font-bold text-xs">
                      {aiSuccessMsg}
                    </div>
                  )}

                  {/* PROPOSAL OF AI QUESTIONS */}
                  <div className="space-y-4">
                    {aiGeneratedList.map((aiQ, idx) => (
                      <div key={idx} className="bg-white border-4 border-dashed border-slate-800 p-4 relative">
                        <span className="absolute top-2 right-2 bg-rose-500 text-white text-[8px] font-black px-1 border border-slate-950">USULAN SOAL AI</span>
                        
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-black text-slate-900">📝 {aiQ.question}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {aiQ.options.map((opt, i) => (
                              <div key={i} className="bg-slate-100 border border-slate-300 p-1.5 text-xs rounded-none font-bold">
                                <span className="text-slate-400 font-mono text-[9px]">{String.fromCharCode(65 + i)}.</span> {opt}
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-emerald-600 font-black">✔️ Jawaban Benar: {aiQ.correctAnswer}</div>
                          <div className="text-xs text-slate-600 font-bold italic">💡 Pembahasan: {aiQ.explanation}</div>
                        </div>

                        <button
                          id={`accept-ai-question-${idx}`}
                          onClick={() => handleAcceptAIQuestion(aiQ)}
                          className="mt-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[10px] py-1.5 px-3 border-2 border-slate-900 shadow-[1px_1px_0px_#000]"
                        >
                          Masukkan ke Petualangan Anak Kelas 3 ✅
                        </button>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

          </main>
        </div>
      )}

    </div>
  );
}
