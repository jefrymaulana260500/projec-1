export interface Question {
  id: string;
  category: 'panjang' | 'berat' | 'waktu' | 'volume' | 'gabungan';
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'mudah' | 'sedang' | 'sulit';
  explanation: string;
}

export interface StudentReport {
  id: string;
  name: string;
  group: string;
  grade: string;
  absentNo: string;
  score: number;
  xpEarned: number;
  coinsEarned: number;
  badges: string[];
  totalPlayTime: number; // in seconds
  totalAnswerTime: number; // in seconds
  attempts: number;
  completedLevels: string[];
  date: string;
}

export interface AvatarConfig {
  gender: 'laki-laki' | 'perempuan';
  hairStyle: string; // e.g. 'spiky', 'curly', 'straight', 'twin'
  hairColor: string; // hex string
  hat: string; // 'none', 'cap', 'crown', 'cowboy', 'explorer'
  glasses: string; // 'none', 'round', 'shades', 'cool'
  costume: string; // 'adventure', 'robot', 'casual', 'superhero', 'royal'
  shoes: string; // 'boots', 'sneakers', 'sandals'
  bag: string; // 'none', 'backpack', 'jetpack', 'scabbard'
  stepEffect: string; // 'none', 'stars', 'dust', 'sparkles'
  victoryEffect: string; // 'none', 'confetti', 'fireworks', 'rainbow'
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const BADGES: Badge[] = [
  {
    id: "Ahli Panjang",
    title: "Ahli Panjang",
    description: "Menyelesaikan misi di Pulau Panjang dengan gemilang!",
    icon: "📏",
    color: "bg-emerald-500"
  },
  {
    id: "Ahli Berat",
    title: "Ahli Berat",
    description: "Menyelesaikan misi di Pulau Berat dengan gemilang!",
    icon: "⚖️",
    color: "bg-amber-500"
  },
  {
    id: "Ahli Waktu",
    title: "Ahli Waktu",
    description: "Menyelesaikan misi di Pulau Waktu dengan tepat waktu!",
    icon: "⏱️",
    color: "bg-indigo-500"
  },
  {
    id: "Ahli Volume",
    title: "Ahli Volume",
    description: "Menyelesaikan misi di Pulau Volume dengan takaran pas!",
    icon: "🧪",
    color: "bg-cyan-500"
  },
  {
    id: "Master Pengukuran",
    title: "Master Pengukuran",
    description: "Menaklukkan semua pulau dan menyelesaikan Pulau Master!",
    icon: "👑",
    color: "bg-rose-500"
  }
];

export type IslandId = 'panjang' | 'berat' | 'waktu' | 'volume' | 'gabungan';

export interface Island {
  id: IslandId;
  name: string;
  title: string;
  level: number;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeId: string;
}

export const ISLANDS: Island[] = [
  {
    id: "panjang",
    name: "Pulau Panjang",
    title: "Misi Pengukuran Panjang",
    level: 1,
    description: "Belajar tentang Meter, Sentimeter, konversi panjang, serta alat ukur baku dan tidak baku.",
    color: "from-emerald-400 to-emerald-600",
    bgColor: "bg-emerald-100",
    borderColor: "border-emerald-600",
    badgeId: "Ahli Panjang"
  },
  {
    id: "berat",
    name: "Pulau Berat",
    title: "Misi Timbangan Berat",
    level: 2,
    description: "Belajar tentang Kilogram, Gram, timbangan pasar, dan konversi berat sederhana.",
    color: "from-amber-400 to-amber-600",
    bgColor: "bg-amber-100",
    borderColor: "border-amber-600",
    badgeId: "Ahli Berat"
  },
  {
    id: "waktu",
    name: "Pulau Waktu",
    title: "Misi Detik & Jarum Jam",
    level: 3,
    description: "Membaca jarum jam analog, menghitung durasi kegiatan, dan satuan Jam, Menit, Detik.",
    color: "from-indigo-400 to-indigo-600",
    bgColor: "bg-indigo-100",
    borderColor: "border-indigo-600",
    badgeId: "Ahli Waktu"
  },
  {
    id: "volume",
    name: "Pulau Volume",
    title: "Misi Takaran Cairan",
    level: 4,
    description: "Belajar tentang Liter, Mililiter, kapasitas wadah air, serta takaran baku dan tidak baku.",
    color: "from-cyan-400 to-cyan-600",
    bgColor: "bg-cyan-100",
    borderColor: "border-cyan-600",
    badgeId: "Ahli Volume"
  },
  {
    id: "gabungan",
    name: "Pulau Master Pengukuran",
    title: "Misi Master Pengukuran",
    level: 5,
    description: "Uji keahlianmu memecahkan tantangan gabungan seluruh materi pengukuran kelas 3!",
    color: "from-rose-400 to-rose-600",
    bgColor: "bg-rose-100",
    borderColor: "border-rose-600",
    badgeId: "Master Pengukuran"
  }
];
