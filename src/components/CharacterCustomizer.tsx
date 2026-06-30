import React, { useState } from 'react';
import { AvatarConfig } from '../types';
import BlockAvatar from './BlockAvatar';

interface CharacterCustomizerProps {
  config: AvatarConfig;
  onChangeConfig: (newConfig: AvatarConfig) => void;
  coins: number;
  onChangeCoins: (newCoins: number) => void;
  onClose: () => void;
}

interface ShopItem {
  id: string;
  category: keyof AvatarConfig;
  value: string;
  label: string;
  price: number;
  unlocked: boolean;
  color?: string; // for hair color/etc
  icon?: string;
}

export default function CharacterCustomizer({
  config,
  onChangeConfig,
  coins,
  onChangeCoins,
  onClose
}: CharacterCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'hair' | 'hats' | 'glasses' | 'costume' | 'backpack' | 'effects'>('hair');
  const [emote, setEmote] = useState<'idle' | 'jump' | 'dance' | 'clap' | 'victory' | 'thumbsup'>('idle');
  
  // Custom non-native shop alerts
  const [purchasingItem, setPurchasingItem] = useState<ShopItem | null>(null);
  const [shopAlertMsg, setShopAlertMsg] = useState<string | null>(null);
  
  // Track purchased items in local storage / session state to keep game interactive
  const [purchasedItems, setPurchasedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('math_adventure_unlocked_items');
    return saved ? JSON.parse(saved) : ['hair_spiky', 'hair_straight', 'hat_none', 'glasses_none', 'costume_adventure', 'shoes_boots', 'bag_none', 'step_none', 'victory_none'];
  });

  const shopItems: ShopItem[] = [
    // HAIR MODELS
    { id: 'hair_spiky', category: 'hairStyle', value: 'spiky', label: 'Spiky Voxel', price: 0, unlocked: true, icon: "💇‍♂️" },
    { id: 'hair_straight', category: 'hairStyle', value: 'straight', label: 'Classic Straight', price: 0, unlocked: true, icon: "💇" },
    { id: 'hair_curly', category: 'hairStyle', value: 'curly', label: 'Curly Block', price: 30, unlocked: false, icon: "👨‍🦱" },
    { id: 'hair_twin', category: 'hairStyle', value: 'twin', label: 'Cute Twin-tail', price: 40, unlocked: false, icon: "👧" },

    // HAIR COLORS
    { id: 'color_brown', category: 'hairColor', value: 'brown', label: 'Coklat Tanah', price: 0, unlocked: true, color: '#78350f' },
    { id: 'color_black', category: 'hairColor', value: 'black', label: 'Hitam Obsidian', price: 0, unlocked: true, color: '#1e293b' },
    { id: 'color_blonde', category: 'hairColor', value: 'blonde', label: 'Kuning Emas', price: 20, unlocked: false, color: '#eab308' },
    { id: 'color_red', category: 'hairColor', value: 'red', label: 'Merah Api', price: 20, unlocked: false, color: '#dc2626' },
    { id: 'color_blue', category: 'hairColor', value: 'blue', label: 'Biru Neon', price: 30, unlocked: false, color: '#2563eb' },
    { id: 'color_pink', category: 'hairColor', value: 'pink', label: 'Pink Permen', price: 30, unlocked: false, color: '#db2777' },

    // HATS
    { id: 'hat_none', category: 'hat', value: 'none', label: 'Tanpa Topi', price: 0, unlocked: true, icon: "❌" },
    { id: 'hat_cap', category: 'hat', value: 'cap', label: 'Topi Olahraga', price: 15, unlocked: false, icon: "🧢" },
    { id: 'hat_cowboy', category: 'hat', value: 'cowboy', label: 'Topi Koboi', price: 40, unlocked: false, icon: "🤠" },
    { id: 'hat_explorer', category: 'hat', value: 'explorer', label: 'Helm Peneliti', price: 50, unlocked: false, icon: "🧭" },
    { id: 'hat_crown', category: 'hat', value: 'crown', label: 'Mahkota Raja', price: 100, unlocked: false, icon: "👑" },

    // GLASSES
    { id: 'glasses_none', category: 'glasses', value: 'none', label: 'Tanpa Kacamata', price: 0, unlocked: true, icon: "❌" },
    { id: 'glasses_round', category: 'glasses', value: 'round', label: 'Kacamata Bulat', price: 20, unlocked: false, icon: "👓" },
    { id: 'glasses_shades', category: 'glasses', value: 'shades', label: 'Kacamata Hitam', price: 35, unlocked: false, icon: "🕶️" },
    { id: 'glasses_cool', category: 'glasses', value: 'cool', label: 'Kacamata Cyber', price: 50, unlocked: false, icon: "⚡" },

    // COSTUME
    { id: 'costume_adventure', category: 'costume', value: 'adventure', label: 'Baju Petualang', price: 0, unlocked: true, icon: "👕" },
    { id: 'costume_casual', category: 'costume', value: 'casual', label: 'Kaos Santai', price: 20, unlocked: false, icon: "🟢" },
    { id: 'costume_robot', category: 'costume', value: 'robot', label: 'Zirah Robot', price: 50, unlocked: false, icon: "🤖" },
    { id: 'costume_superhero', category: 'costume', value: 'superhero', label: 'Baju Pahlawan', price: 70, unlocked: false, icon: "🦸" },
    { id: 'costume_royal', category: 'costume', value: 'royal', label: 'Baju Kerajaan', price: 90, unlocked: false, icon: "🟣" },

    // BACKPACK / BAG
    { id: 'bag_none', category: 'bag', value: 'none', label: 'Tanpa Tas', price: 0, unlocked: true, icon: "❌" },
    { id: 'bag_backpack', category: 'bag', value: 'backpack', label: 'Tas Sekolah', price: 25, unlocked: false, icon: "🎒" },
    { id: 'bag_jetpack', category: 'bag', value: 'jetpack', label: 'Jetpack Roket', price: 75, unlocked: false, icon: "🚀" },
    { id: 'bag_scabbard', category: 'bag', value: 'scabbard', label: 'Sarung Pedang', price: 60, unlocked: false, icon: "⚔️" },

    // STEP EFFECTS
    { id: 'step_none', category: 'stepEffect', value: 'none', label: 'Tanpa Efek Jalan', price: 0, unlocked: true, icon: "👟" },
    { id: 'step_stars', category: 'stepEffect', value: 'stars', label: 'Jejak Bintang', price: 40, unlocked: false, icon: "⭐" },
    { id: 'step_dust', category: 'stepEffect', value: 'dust', label: 'Efek Asap', price: 30, unlocked: false, icon: "💨" },
    { id: 'step_sparkles', category: 'stepEffect', value: 'sparkles', label: 'Efek Berkilau', price: 50, unlocked: false, icon: "✨" },

    // VICTORY EFFECTS
    { id: 'victory_none', category: 'victoryEffect', value: 'none', label: 'Tanpa Efek Menang', price: 0, unlocked: true, icon: "🏆" },
    { id: 'victory_confetti', category: 'victoryEffect', value: 'confetti', label: 'Hujan Konfeti', price: 50, unlocked: false, icon: "🎉" },
    { id: 'victory_fireworks', category: 'victoryEffect', value: 'fireworks', label: 'Kembang Api', price: 80, unlocked: false, icon: "💥" },
    { id: 'victory_rainbow', category: 'victoryEffect', value: 'rainbow', label: 'Pelangi Bahagia', price: 90, unlocked: false, icon: "🌈" },
  ];

  const handleSelectItem = (item: ShopItem) => {
    const isUnlocked = item.price === 0 || purchasedItems.includes(item.id);
    
    if (isUnlocked) {
      // Just select and apply
      const updated = { ...config, [item.category]: item.value };
      onChangeConfig(updated);
    } else {
      // Prompt for buying
      if (coins >= item.price) {
        setPurchasingItem(item);
      } else {
        setShopAlertMsg(`Koin kamu tidak cukup! Kamu butuh ${item.price} koin. Belajarlah lagi dengan menjawab soal-soal di pulau petualangan untuk mendapatkan koin tambahan! 💪`);
      }
    }
  };

  const handleConfirmPurchase = () => {
    if (!purchasingItem) return;
    const newCoins = coins - purchasingItem.price;
    onChangeCoins(newCoins);
    const newPurchased = [...purchasedItems, purchasingItem.id];
    setPurchasedItems(newPurchased);
    localStorage.setItem('math_adventure_unlocked_items', JSON.stringify(newPurchased));
    
    // Apply purchased item
    const updated = { ...config, [purchasingItem.category]: purchasingItem.value };
    onChangeConfig(updated);
    
    // Play sound emote / feedback
    setEmote('victory');
    setPurchasingItem(null);
  };

  const handleEmoteClick = (newEmote: typeof emote) => {
    setEmote(newEmote);
    setTimeout(() => {
      setEmote('idle');
    }, 1500);
  };

  const filteredItems = shopItems.filter(item => {
    if (activeTab === 'hair') return item.category === 'hairStyle' || item.category === 'hairColor';
    if (activeTab === 'hats') return item.category === 'hat';
    if (activeTab === 'glasses') return item.category === 'glasses';
    if (activeTab === 'costume') return item.category === 'costume';
    if (activeTab === 'backpack') return item.category === 'bag';
    if (activeTab === 'effects') return item.category === 'stepEffect' || item.category === 'victoryEffect';
    return false;
  });

  return (
    <div id="character-customizer-modal" className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-display">
      <div className="w-full max-w-4xl bg-amber-50 border-4 border-slate-800 shadow-[8px_8px_0px_#1e293b] flex flex-col md:flex-row rounded-none overflow-hidden max-h-[90vh]">
        
        {/* LEFT PANEL: AVATAR VIEWER & EMOTES */}
        <div className="w-full md:w-2/5 bg-sky-200 p-6 border-b-4 md:border-b-0 md:border-r-4 border-slate-800 flex flex-col items-center justify-between relative">
          
          {/* Backdrops */}
          <div className="absolute top-4 left-4 bg-yellow-400 border-2 border-slate-800 px-2 py-0.5 text-xs font-bold shadow-[2px_2px_0px_#1e293b] transform -rotate-1">
            RUANG SALIN AVATAR 3D
          </div>

          <div className="absolute top-4 right-4 bg-emerald-500 border-2 border-slate-800 px-3 py-1 rounded-none text-white font-extrabold flex items-center shadow-[2px_2px_0px_#1e293b]">
            🪙 <span className="ml-1 text-sm font-mono">{coins} KOIN</span>
          </div>

          {/* Voxel Stage platform display */}
          <div className="my-auto py-12 flex flex-col items-center justify-center relative w-full">
            <div className="relative z-10">
              <BlockAvatar config={config} emote={emote} size="xl" />
            </div>
            {/* Round Voxel shadow base */}
            <div className="w-40 h-8 bg-sky-300 border-4 border-slate-800 rounded-none transform -skew-x-12 mt-[-10px] z-0 flex items-center justify-center font-mono text-[8px] text-sky-800 font-bold">
              PLATFORM PREVIEW
            </div>
          </div>

          {/* EMOTE TRIGGERS */}
          <div className="w-full bg-amber-100 border-4 border-slate-800 p-3 shadow-[3px_3px_0px_#1e293b]">
            <div className="text-xs font-black text-slate-800 mb-2 uppercase text-center tracking-wide">
              Uji Gaya Emote Karakter:
            </div>
            <div className="grid grid-cols-5 gap-1">
              <button 
                id="emote-jump-btn"
                onClick={() => handleEmoteClick('jump')}
                className="bg-sky-400 hover:bg-sky-300 border-2 border-slate-800 text-[10px] font-bold py-1.5 rounded-none block-btn"
              >
                🦘 Lompat
              </button>
              <button 
                id="emote-dance-btn"
                onClick={() => handleEmoteClick('dance')}
                className="bg-pink-400 hover:bg-pink-300 border-2 border-slate-800 text-[10px] font-bold py-1.5 rounded-none block-btn"
              >
                💃 Joget
              </button>
              <button 
                id="emote-clap-btn"
                onClick={() => handleEmoteClick('clap')}
                className="bg-teal-400 hover:bg-teal-300 border-2 border-slate-800 text-[10px] font-bold py-1.5 rounded-none block-btn"
              >
                👏 Tepuk
              </button>
              <button 
                id="emote-victory-btn"
                onClick={() => handleEmoteClick('victory')}
                className="bg-yellow-400 hover:bg-yellow-300 border-2 border-slate-800 text-[10px] font-bold py-1.5 rounded-none block-btn"
              >
                👑 Menang
              </button>
              <button 
                id="emote-thumb-btn"
                onClick={() => handleEmoteClick('thumbsup')}
                className="bg-emerald-400 hover:bg-emerald-300 border-2 border-slate-800 text-[10px] font-bold py-1.5 rounded-none block-btn"
              >
                👍 Sip
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: SHOP TABS & LIST */}
        <div className="w-full md:w-3/5 flex flex-col p-6 h-full overflow-hidden justify-between">
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              🎨 TOKO KUSTOMISASI
            </h2>
            <button 
              id="close-customizer-btn"
              onClick={onClose}
              className="bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-sm px-3 py-1.5 border-3 border-slate-800 shadow-[2px_2px_0px_#1e293b] block-btn"
            >
              SIMPAN & KELUAR 🚪
            </button>
          </div>

          {/* SHOP TABS */}
          <div className="flex space-x-1 border-b-4 border-slate-800 overflow-x-auto pb-1 mb-4 scrollbar-thin">
            <button
              id="tab-hair-btn"
              onClick={() => setActiveTab('hair')}
              className={`px-3 py-2 text-xs font-black uppercase rounded-none border-t-4 border-l-4 border-r-4 border-slate-800 translate-y-1 ${
                activeTab === 'hair' ? 'bg-amber-100 border-b-4 border-b-amber-100 z-10' : 'bg-slate-300 hover:bg-slate-200'
              }`}
            >
              💇 Rambut
            </button>
            <button
              id="tab-hats-btn"
              onClick={() => setActiveTab('hats')}
              className={`px-3 py-2 text-xs font-black uppercase rounded-none border-t-4 border-l-4 border-r-4 border-slate-800 translate-y-1 ${
                activeTab === 'hats' ? 'bg-amber-100 border-b-4 border-b-amber-100 z-10' : 'bg-slate-300 hover:bg-slate-200'
              }`}
            >
              🤠 Topi
            </button>
            <button
              id="tab-glasses-btn"
              onClick={() => setActiveTab('glasses')}
              className={`px-3 py-2 text-xs font-black uppercase rounded-none border-t-4 border-l-4 border-r-4 border-slate-800 translate-y-1 ${
                activeTab === 'glasses' ? 'bg-amber-100 border-b-4 border-b-amber-100 z-10' : 'bg-slate-300 hover:bg-slate-200'
              }`}
            >
              👓 Kacamata
            </button>
            <button
              id="tab-costume-btn"
              onClick={() => setActiveTab('costume')}
              className={`px-3 py-2 text-xs font-black uppercase rounded-none border-t-4 border-l-4 border-r-4 border-slate-800 translate-y-1 ${
                activeTab === 'costume' ? 'bg-amber-100 border-b-4 border-b-amber-100 z-10' : 'bg-slate-300 hover:bg-slate-200'
              }`}
            >
              👕 Kostum
            </button>
            <button
              id="tab-backpack-btn"
              onClick={() => setActiveTab('backpack')}
              className={`px-3 py-2 text-xs font-black uppercase rounded-none border-t-4 border-l-4 border-r-4 border-slate-800 translate-y-1 ${
                activeTab === 'backpack' ? 'bg-amber-100 border-b-4 border-b-amber-100 z-10' : 'bg-slate-300 hover:bg-slate-200'
              }`}
            >
              🎒 Tas
            </button>
            <button
              id="tab-effects-btn"
              onClick={() => setActiveTab('effects')}
              className={`px-3 py-2 text-xs font-black uppercase rounded-none border-t-4 border-l-4 border-r-4 border-slate-800 translate-y-1 ${
                activeTab === 'effects' ? 'bg-amber-100 border-b-4 border-b-amber-100 z-10' : 'bg-slate-300 hover:bg-slate-200'
              }`}
            >
              ✨ Efek
            </button>
          </div>

          {/* SHOP ITEMS GRID */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[300px] max-h-[420px]">
            {filteredItems.map(item => {
              const isSelected = config[item.category] === item.value;
              const isUnlocked = item.price === 0 || purchasedItems.includes(item.id);

              return (
                <button
                  key={item.id}
                  id={`shop-item-${item.id}`}
                  onClick={() => handleSelectItem(item)}
                  className={`border-4 p-3 flex flex-col items-center justify-between text-center relative transition-all ${
                    isSelected 
                      ? 'bg-yellow-100 border-yellow-500 shadow-[3px_3px_0px_#eab308]' 
                      : 'bg-white border-slate-800 hover:border-slate-600 shadow-[3px_3px_0px_#1e293b]'
                  }`}
                >
                  {/* Lock Indicator */}
                  {!isUnlocked && (
                    <div className="absolute top-1 right-1 bg-rose-500 text-white font-bold text-[8px] px-1 border-2 border-slate-900 rounded-none z-10">
                      🔒 {item.price} koin
                    </div>
                  )}

                  {isUnlocked && (
                    <div className="absolute top-1 right-1 bg-emerald-500 text-white font-bold text-[8px] px-1 border-2 border-slate-900 rounded-none z-10">
                      ✅ Dimiliki
                    </div>
                  )}

                  {/* Icon or Color Box */}
                  <div className="my-2">
                    {item.color ? (
                      <div 
                        className="w-10 h-10 border-4 border-slate-900 shadow-sm" 
                        style={{ backgroundColor: item.color }} 
                      />
                    ) : (
                      <span className="text-3xl filter drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                        {item.icon}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">
                    {item.label}
                  </div>

                  {/* Action/Buy Indicator */}
                  <div className="mt-2 w-full">
                    {isSelected ? (
                      <div className="bg-yellow-500 text-slate-950 font-black text-[9px] py-0.5 border-2 border-slate-900 uppercase">
                        Dipasang 🌟
                      </div>
                    ) : isUnlocked ? (
                      <div className="bg-slate-100 text-slate-700 font-bold text-[9px] py-0.5 border-2 border-slate-500 uppercase">
                        Gunakan
                      </div>
                    ) : (
                      <div className="bg-emerald-500 text-white font-extrabold text-[9px] py-0.5 border-2 border-slate-900 uppercase">
                        Beli 🪙 {item.price}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-emerald-100 border-4 border-slate-800 p-3 mt-4 text-xs text-emerald-800 font-bold">
            💡 <strong>Saran Petualang:</strong> Jawab soal matematika dengan benar di pulau petualangan untuk memenangkan koin dan XP. Makin banyak soal benar, makin keren avatar block-world mu!
          </div>

        </div>
      </div>

      {/* SHOP CUSTOM CONFIRM PURCHASE MODAL */}
      {purchasingItem && (
        <div id="shop-purchase-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-amber-50 border-4 border-slate-900 shadow-[6px_6px_0px_#1e293b] p-5 text-center transform -rotate-1 font-display">
            <div className="bg-yellow-400 text-slate-900 border-4 border-slate-900 p-2.5 mb-4 text-center font-black uppercase text-sm">
              🛒 KONFIRMASI PEMBELIAN
            </div>
            <p className="text-xs font-bold text-slate-800 leading-relaxed mb-4">
              Apakah kamu ingin membeli <span className="text-rose-600 font-extrabold">"{purchasingItem.label}"</span> seharga <span className="text-emerald-600 font-extrabold">{purchasingItem.price} koin</span>?
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleConfirmPurchase}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs py-2 border-3 border-slate-900 shadow-[2px_2px_0px_#1e293b] uppercase block-btn"
              >
                Ya, Beli! 🪙
              </button>
              <button
                onClick={() => setPurchasingItem(null)}
                className="flex-1 bg-slate-400 hover:bg-slate-300 text-white font-extrabold text-xs py-2 border-3 border-slate-900 shadow-[2px_2px_0px_#1e293b] uppercase block-btn"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOP CUSTOM ALERT MODAL (INSUFFICIENT FUNDS) */}
      {shopAlertMsg && (
        <div id="shop-alert-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 font-display">
          <div className="w-full max-w-sm bg-amber-50 border-4 border-slate-900 shadow-[6px_6px_0px_#1e293b] p-5 text-center transform rotate-1">
            <div className="bg-rose-500 text-white border-4 border-slate-900 p-2.5 mb-4 text-center font-black uppercase text-sm">
              ⚠️ KOIN TIDAK CUKUP
            </div>
            <p className="text-xs font-bold text-slate-800 leading-relaxed mb-5">
              {shopAlertMsg}
            </p>
            <button
              onClick={() => setShopAlertMsg(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs py-2 border-3 border-slate-900 shadow-[2px_2px_0px_#1e293b] uppercase block-btn"
            >
              Oke, Mengerti! 👍
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
