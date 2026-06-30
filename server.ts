import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API Client lazily
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI generation will be unavailable.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Default questions for Grade 3 math petualangan
interface Question {
  id: string;
  category: 'panjang' | 'berat' | 'waktu' | 'volume' | 'gabungan';
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'mudah' | 'sedang' | 'sulit';
  explanation: string;
}

let questions: Question[] = [
  {
    id: "q1",
    category: "panjang",
    question: "1 meter sama dengan berapa sentimeter?",
    options: ["10 sentimeter", "100 sentimeter", "1.000 sentimeter", "50 sentimeter"],
    correctAnswer: "100 sentimeter",
    difficulty: "mudah",
    explanation: "1 meter (m) setara dengan 100 sentimeter (cm). Satuan m diturunkan ke cm dengan dikali 100."
  },
  {
    id: "q2",
    category: "panjang",
    question: "Ibu memiliki tali sepanjang 3 meter. Berapa cm panjang tali Ibu?",
    options: ["30 cm", "300 cm", "3.000 cm", "150 cm"],
    correctAnswer: "300 cm",
    difficulty: "sedang",
    explanation: "Karena 1 meter = 100 cm, maka 3 meter = 3 x 100 cm = 300 cm."
  },
  {
    id: "q3",
    category: "panjang",
    question: "Manakah di bawah ini yang merupakan satuan panjang TIDAK baku?",
    options: ["Meter", "Sentimeter", "Jengkal tangan", "Kilometer"],
    correctAnswer: "Jengkal tangan",
    difficulty: "mudah",
    explanation: "Jengkal tangan adalah satuan tidak baku karena ukuran jengkal setiap orang berbeda-beda."
  },
  {
    id: "q4",
    category: "berat",
    question: "1 kilogram (kg) sama dengan berapa gram (g)?",
    options: ["100 gram", "500 gram", "1.000 gram", "10.000 gram"],
    correctAnswer: "1.000 gram",
    difficulty: "mudah",
    explanation: "Satuan baku berat menentukan bahwa 1 kg setara dengan 1.000 gram."
  },
  {
    id: "q5",
    category: "berat",
    question: "Adit membeli gula seberat 2 kg dan tepung terigu seberat 500 gram. Berapa gram total belanjaan Adit?",
    options: ["700 gram", "2.500 gram", "5.200 gram", "2.050 gram"],
    correctAnswer: "2.500 gram",
    difficulty: "sedang",
    explanation: "Ubah dulu 2 kg menjadi gram: 2 kg = 2.000 gram. Kemudian tambahkan: 2.000 g + 500 g = 2.500 gram."
  },
  {
    id: "q6",
    category: "berat",
    question: "Alat yang paling tepat digunakan untuk mengukur berat buah apel di pasar adalah...",
    options: ["Penggaris", "Timbangan buah", "Meteran pita", "Gelas ukur"],
    correctAnswer: "Timbangan buah",
    difficulty: "mudah",
    explanation: "Timbangan adalah alat untuk mengukur berat benda, sedangkan penggaris dan meteran untuk panjang."
  },
  {
    id: "q7",
    category: "waktu",
    question: "1 jam sama dengan berapa menit?",
    options: ["30 menit", "60 menit", "100 menit", "120 menit"],
    correctAnswer: "60 menit",
    difficulty: "mudah",
    explanation: "Berdasarkan jam analog, satu putaran penuh jarum menit adalah 1 jam yang sama dengan 60 menit."
  },
  {
    id: "q8",
    category: "waktu",
    question: "Budi mulai mengerjakan PR matematika pukul 08.00 dan selesai pada pukul 09.30. Berapa lama Budi belajar?",
    options: ["1 jam", "1 jam 30 menit", "2 jam", "45 menit"],
    correctAnswer: "1 jam 30 menit",
    difficulty: "sedang",
    explanation: "Selisih dari pukul 08.00 ke 09.30 adalah 1 jam (ke pukul 09.00) ditambah 30 menit (ke pukul 09.30)."
  },
  {
    id: "q9",
    category: "waktu",
    question: "Jarum pendek menunjuk angka 10 dan jarum panjang menunjuk angka 3. Jam tersebut menunjukkan pukul...",
    options: ["10.03", "10.15", "03.10", "10.30"],
    correctAnswer: "10.15",
    difficulty: "sedang",
    explanation: "Jarum pendek di angka 10 berarti pukul 10. Jarum panjang di angka 3 berarti 3 x 5 menit = 15 menit. Jadi pukul 10.15."
  },
  {
    id: "q10",
    category: "volume",
    question: "1 liter (L) sama dengan berapa mililiter (ml)?",
    options: ["100 mililiter", "500 mililiter", "1.000 mililiter", "2.000 mililiter"],
    correctAnswer: "1.000 mililiter",
    difficulty: "mudah",
    explanation: "1 liter setara dengan 1.000 mililiter. Satuan L ke ml dikalikan dengan 1.000."
  },
  {
    id: "q11",
    category: "volume",
    question: "Satu wadah berisi air penuh sebanyak 3 liter. Jika air dituangkan ke dalam botol berukuran 500 ml hingga habis, berapa botol yang terisi penuh?",
    options: ["3 botol", "5 botol", "6 botol", "8 botol"],
    correctAnswer: "6 botol",
    difficulty: "sulit",
    explanation: "3 liter = 3.000 ml. Jumlah botol = 3.000 ml dibagi 500 ml = 6 botol."
  },
  {
    id: "q12",
    category: "volume",
    question: "Berikut ini yang merupakan alat ukur volume tidak baku adalah...",
    options: ["Gelas ukur", "Gayung air", "Pipet ukur", "Jerigen berlabel"],
    correctAnswer: "Gayung air",
    difficulty: "mudah",
    explanation: "Gayung air adalah alat ukur tidak baku karena ukuran setiap gayung berbeda-beda."
  },
  {
    id: "q13",
    category: "gabungan",
    question: "Tinggi badan Lisa adalah 1 meter 35 sentimeter. Berapa tinggi badan Lisa jika ditulis dalam sentimeter?",
    options: ["135 cm", "153 cm", "105 cm", "130 cm"],
    correctAnswer: "135 cm",
    difficulty: "sedang",
    explanation: "1 meter = 100 cm. Jadi 1 m + 35 cm = 100 cm + 35 cm = 135 cm."
  },
  {
    id: "q14",
    category: "gabungan",
    question: "Toni berlari selama 2 jam, sedangkan Roni berlari selama 90 menit. Siapa yang berlari lebih lama?",
    options: ["Toni", "Roni", "Sama lama", "Tidak bisa diukur"],
    correctAnswer: "Toni",
    difficulty: "sedang",
    explanation: "Toni berlari 2 jam = 2 x 60 menit = 120 menit. Roni berlari 90 menit. Jadi, Toni berlari lebih lama."
  },
  {
    id: "q15",
    category: "gabungan",
    question: "Sebuah buah semangka memiliki berat 3 kg, sedangkan melon memiliki berat 1.800 gram. Berapa selisih berat kedua buah tersebut?",
    options: ["1.200 gram", "1.500 gram", "2.000 gram", "800 gram"],
    correctAnswer: "1.200 gram",
    difficulty: "sulit",
    explanation: "Semangka = 3 kg = 3.000 gram. Melon = 1.800 gram. Selisih = 3.000 g - 1.800 g = 1.200 gram."
  }
];

// Student report history stored in memory
interface StudentReport {
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

let studentReports: StudentReport[] = [
  {
    id: "rep1",
    name: "Ahmad Dani",
    group: "Kelompok Garuda",
    grade: "3-A",
    absentNo: "03",
    score: 85,
    xpEarned: 350,
    coinsEarned: 120,
    badges: ["Ahli Panjang", "Ahli Berat"],
    totalPlayTime: 240,
    totalAnswerTime: 95,
    attempts: 1,
    completedLevels: ["panjang", "berat"],
    date: "2026-06-29T10:15:00.000Z"
  },
  {
    id: "rep2",
    name: "Siti Rahma",
    group: "Kelompok Melati",
    grade: "3-B",
    absentNo: "21",
    score: 95,
    xpEarned: 600,
    coinsEarned: 240,
    badges: ["Ahli Panjang", "Ahli Berat", "Ahli Waktu", "Ahli Volume", "Master Pengukuran"],
    totalPlayTime: 480,
    totalAnswerTime: 180,
    attempts: 1,
    completedLevels: ["panjang", "berat", "waktu", "volume", "gabungan"],
    date: "2026-06-30T00:45:00.000Z"
  },
  {
    id: "rep3",
    name: "Budi Santoso",
    group: "Kelompok Garuda",
    grade: "3-A",
    absentNo: "07",
    score: 60,
    xpEarned: 180,
    coinsEarned: 40,
    badges: ["Ahli Panjang"],
    totalPlayTime: 180,
    totalAnswerTime: 80,
    attempts: 2,
    completedLevels: ["panjang"],
    date: "2026-06-30T01:10:00.000Z"
  }
];

// API: Get all questions
app.get("/api/questions", (req, res) => {
  res.json({ status: "success", data: questions });
});

// API: Add a new question
app.post("/api/questions", (req, res) => {
  try {
    const { category, question, options, correctAnswer, difficulty, explanation } = req.body;
    if (!category || !question || !options || !correctAnswer || !difficulty || !explanation) {
      res.status(400).json({ status: "error", message: "Mohon isi semua field dengan lengkap." });
      return;
    }
    const newQuestion: Question = {
      id: "q_" + Date.now(),
      category,
      question,
      options,
      correctAnswer,
      difficulty,
      explanation
    };
    questions.push(newQuestion);
    res.json({ status: "success", data: newQuestion });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// API: Edit question
app.put("/api/questions/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { category, question, options, correctAnswer, difficulty, explanation } = req.body;
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) {
      res.status(404).json({ status: "error", message: "Soal tidak ditemukan." });
      return;
    }
    questions[index] = {
      ...questions[index],
      category: category || questions[index].category,
      question: question || questions[index].question,
      options: options || questions[index].options,
      correctAnswer: correctAnswer || questions[index].correctAnswer,
      difficulty: difficulty || questions[index].difficulty,
      explanation: explanation || questions[index].explanation
    };
    res.json({ status: "success", data: questions[index] });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// API: Delete question
app.delete("/api/questions/:id", (req, res) => {
  try {
    const { id } = req.params;
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) {
      res.status(404).json({ status: "error", message: "Soal tidak ditemukan." });
      return;
    }
    const deleted = questions.splice(index, 1);
    res.json({ status: "success", data: deleted[0] });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// API: Generate questions with Gemini AI
app.post("/api/generate-questions", async (req, res) => {
  try {
    const { category, topic, difficulty } = req.body;
    const ai = getAiClient();
    
    if (!ai) {
      // Return beautiful mock questions if API key is not available, to keep app fully functional
      const randomId = Date.now();
      const fallbackQuestions: Question[] = [
        {
          id: `q_ai_${randomId}_1`,
          category: category || "panjang",
          question: `[AI Generated] Berapa hasil dari pengukuran panjang pensil jika 10 cm ditambah 15 cm?`,
          options: ["25 cm", "20 cm", "30 cm", "35 cm"],
          correctAnswer: "25 cm",
          difficulty: difficulty || "mudah",
          explanation: "Karena kedua satuan sudah sama (cm), kita tinggal menjumlahkan angkanya: 10 + 15 = 25 cm."
        },
        {
          id: `q_ai_${randomId}_2`,
          category: category || "berat",
          question: `[AI Generated] Jika sebuah bungkusan garam beratnya 250 gram, berapa gram berat 4 bungkusan garam yang sama?`,
          options: ["500 gram", "1.000 gram", "1.500 gram", "2.000 gram"],
          correctAnswer: "1.000 gram",
          difficulty: difficulty || "sedang",
          explanation: "Berat total = 4 x 250 gram = 1.000 gram (atau setara dengan 1 kg)."
        }
      ];
      res.json({ status: "success", data: fallbackQuestions, note: "Menggunakan fallback karena API Key belum dikonfigurasi." });
      return;
    }

    const prompt = `Buatkan 2 soal matematika pilihan ganda (4 opsi pilihan A, B, C, D) untuk anak SD kelas 3 tentang materi: ${category} (topik/konteks khusus: ${topic || "bebas"}), tingkat kesulitan: ${difficulty || "sedang"}.
Sajikan respon dalam format JSON murni berupa array of objects tanpa pembungkus markdown (no backticks) atau format lain. 
Setiap objek dalam array wajib memiliki properti berikut:
- category: harus bernilai salah satu dari ["panjang", "berat", "waktu", "volume", "gabungan"]
- question: teks pertanyaan yang ramah anak SD kelas 3 dan bernuansa petualangan/cerita
- options: array berisi 4 pilihan jawaban berupa string (pilihan jawaban tidak boleh mengandung huruf indeks seperti "A. ", "B. ", melainkan isinya saja)
- correctAnswer: string jawaban yang benar (harus persis sama dengan salah satu nilai di dalam array options)
- difficulty: harus bernilai salah satu dari ["mudah", "sedang", "sulit"]
- explanation: penjelasan singkat yang ramah anak tentang cara menemukan jawaban yang benar.

Pastikan soal sangat akurat secara matematis, menggunakan bahasa Indonesia yang santun dan mudah dipahami anak SD kelas 3.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["category", "question", "options", "correctAnswer", "difficulty", "explanation"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI tidak mengembalikan respon teks.");
    }

    const aiQuestions = JSON.parse(text.trim());
    const formattedQuestions = aiQuestions.map((q: any, index: number) => ({
      id: `q_ai_${Date.now()}_${index}`,
      category: q.category || category || "gabungan",
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty || difficulty || "sedang",
      explanation: q.explanation
    }));

    res.json({ status: "success", data: formattedQuestions });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    res.status(500).json({ status: "error", message: "Gagal membuat soal otomatis: " + error.message });
  }
});

// API: Get all student reports
app.get("/api/reports", (req, res) => {
  res.json({ status: "success", data: studentReports });
});

// API: Save student report
app.post("/api/reports", (req, res) => {
  try {
    const { name, group, grade, absentNo, score, xpEarned, coinsEarned, badges, totalPlayTime, totalAnswerTime, attempts, completedLevels } = req.body;
    if (!name || !group || !grade) {
      res.status(400).json({ status: "error", message: "Nama, Kelompok, dan Kelas wajib diisi." });
      return;
    }
    const newReport: StudentReport = {
      id: "rep_" + Date.now(),
      name,
      group,
      grade,
      absentNo: absentNo || "-",
      score: score || 0,
      xpEarned: xpEarned || 0,
      coinsEarned: coinsEarned || 0,
      badges: badges || [],
      totalPlayTime: totalPlayTime || 0,
      totalAnswerTime: totalAnswerTime || 0,
      attempts: attempts || 1,
      completedLevels: completedLevels || [],
      date: new Date().toISOString()
    };
    studentReports.push(newReport);
    res.json({ status: "success", data: newReport });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Start server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
