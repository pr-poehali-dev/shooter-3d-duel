import { useState } from "react";
import Icon from "@/components/ui/icon";
import { playClick, playBeep } from "@/lib/audio";

const MAPS = [
  {
    id: "urban",
    name: "ГОРОДСКИЕ РУИНЫ",
    subtitle: "Ближний бой / Засады",
    tag: "CQB",
    desc: "Разрушенные кварталы мегаполиса. Узкие улицы, много укрытий. Тактика: фланговые обходы.",
    color: "#ff6b35",
    grid: "12×12",
    players: "4v4",
  },
  {
    id: "jungle",
    name: "ДЖУНГЛИ СМЕРТИ",
    subtitle: "Снайперы / Маскировка",
    tag: "SNIPER",
    desc: "Густые тропические леса. Длинные линии огня, видимость ограничена. Тактика: наблюдение.",
    color: "#39d353",
    grid: "20×20",
    players: "6v6",
  },
  {
    id: "arctic",
    name: "АРКТИЧЕСКАЯ БАЗА",
    subtitle: "Штурм / Оборона",
    tag: "ASSAULT",
    desc: "Военная база в тундре. Открытые площадки и подземные бункеры. Тактика: прорыв.",
    color: "#58c4f5",
    grid: "16×16",
    players: "5v5",
  },
  {
    id: "desert",
    name: "ПУСТЫННАЯ КРЕПОСТЬ",
    subtitle: "Дальний бой / Техника",
    tag: "VEHICLE",
    desc: "Форт в песках. Широкие открытые зоны для техники. Тактика: огневое подавление.",
    color: "#f5c842",
    grid: "24×24",
    players: "8v8",
  },
];

const MODES = [
  { id: "tdm", name: "КОМАНДНЫЙ БОЙ", icon: "Swords", desc: "Уничтожь все силы противника" },
  { id: "dom", name: "ГОСПОДСТВО", icon: "Flag", desc: "Захвати и удержи точки" },
  { id: "search", name: "ПОИСК И УНИЧТОЖЕНИЕ", icon: "Target", desc: "Установи / обезвреди бомбу" },
  { id: "escort", name: "ЭСКОРТ", icon: "Shield", desc: "Сопроводи цель через карту" },
];

interface Props {
  onPlay: (map: string, mode: string) => void;
  onSettings: () => void;
  onInventory: () => void;
}

export default function MainMenu({ onPlay, onSettings, onInventory }: Props) {
  const [selectedMap, setSelectedMap] = useState("urban");
  const [selectedMode, setSelectedMode] = useState("tdm");
  const [hoveredMap, setHoveredMap] = useState<string | null>(null);

  const currentMap = MAPS.find(m => m.id === selectedMap)!;

  return (
    <div className="min-h-screen bg-game-bg text-game-text font-orbitron overflow-hidden relative">
      {/* Scanline overlay */}
      <div className="scanlines pointer-events-none" />

      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-game-border">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border-2 border-game-accent rotate-45 flex items-center justify-center">
            <div className="w-3 h-3 bg-game-accent rotate-[-45deg]" />
          </div>
          <div>
            <div className="text-game-accent text-xs tracking-[0.4em] font-bold">TACTICAL OPS</div>
            <div className="text-game-muted text-[10px] tracking-widest">v2.4.1 // CLASSIFIED</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-game-muted tracking-widest">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          ОНЛАЙН: 14,827
        </div>

        <div className="flex gap-3">
          <button
            onClick={onInventory}
            className="game-btn-secondary flex items-center gap-2 text-xs px-4 py-2"
          >
            <Icon name="Package" size={14} />
            АРСЕНАЛ
          </button>
          <button
            onClick={onSettings}
            className="game-btn-secondary flex items-center gap-2 text-xs px-4 py-2"
          >
            <Icon name="Settings" size={14} />
            НАСТРОЙКИ
          </button>
        </div>
      </div>

      <div className="relative z-10 flex h-[calc(100vh-73px)]">
        {/* Left — Map Selection */}
        <div className="w-72 border-r border-game-border flex flex-col">
          <div className="px-6 py-4 border-b border-game-border">
            <div className="text-[10px] text-game-muted tracking-[0.3em]">ВЫБОР КАРТЫ</div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {MAPS.map((map) => (
              <button
                key={map.id}
                onClick={() => { playBeep(440); setSelectedMap(map.id); }}
                onMouseEnter={() => setHoveredMap(map.id)}
                onMouseLeave={() => setHoveredMap(null)}
                className={`w-full text-left p-3 border transition-all duration-200 relative overflow-hidden ${
                  selectedMap === map.id
                    ? "border-game-accent bg-game-accent/10"
                    : "border-game-border hover:border-game-muted bg-transparent"
                }`}
              >
                {selectedMap === map.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: map.color }} />
                )}
                <div className="flex items-start justify-between mb-1">
                  <div className="text-[11px] font-bold tracking-wider" style={{ color: selectedMap === map.id ? map.color : "inherit" }}>
                    {map.name}
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 border tracking-widest" style={{ borderColor: map.color, color: map.color }}>
                    {map.tag}
                  </span>
                </div>
                <div className="text-[10px] text-game-muted">{map.subtitle}</div>
                <div className="flex gap-3 mt-2 text-[9px] text-game-muted">
                  <span>◻ {map.grid}</span>
                  <span>⚡ {map.players}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center — Map Preview + Info */}
        <div className="flex-1 flex flex-col">
          {/* Map visual */}
          <div className="flex-1 relative overflow-hidden">
            <div
              className="absolute inset-0 map-preview transition-all duration-500"
              style={{ "--map-color": currentMap.color } as React.CSSProperties}
            />

            {/* Map overlay info */}
            <div className="absolute inset-0 flex flex-col justify-between p-8">
              <div>
                <div className="text-[10px] text-game-muted tracking-[0.4em] mb-2">// ОПЕРАТИВНАЯ ЗОНА</div>
                <div className="text-5xl font-black tracking-widest" style={{ color: currentMap.color, textShadow: `0 0 40px ${currentMap.color}60` }}>
                  {currentMap.name}
                </div>
                <div className="text-game-muted text-sm mt-2 tracking-wider">{currentMap.subtitle}</div>
              </div>

              <div className="max-w-md">
                <div className="text-[10px] text-game-muted tracking-[0.3em] mb-2">ТАКТИЧЕСКИЙ БРИФИНГ</div>
                <p className="text-sm text-game-text/80 leading-relaxed font-sans">{currentMap.desc}</p>

                <div className="flex gap-6 mt-4">
                  <div className="text-center">
                    <div className="text-xs text-game-muted tracking-wider">СЕТКА</div>
                    <div className="text-lg font-bold" style={{ color: currentMap.color }}>{currentMap.grid}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-game-muted tracking-wider">ИГРОКИ</div>
                    <div className="text-lg font-bold" style={{ color: currentMap.color }}>{currentMap.players}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-game-muted tracking-wider">РЕЖИМ</div>
                    <div className="text-lg font-bold" style={{ color: currentMap.color }}>СТАНДАРТ</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 opacity-40" style={{ borderColor: currentMap.color }} />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 opacity-40" style={{ borderColor: currentMap.color }} />
          </div>

          {/* Mode selection */}
          <div className="border-t border-game-border p-4">
            <div className="text-[10px] text-game-muted tracking-[0.3em] mb-3">РЕЖИМ ИГРЫ</div>
            <div className="grid grid-cols-4 gap-2">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`p-3 border text-left transition-all duration-200 ${
                    selectedMode === mode.id
                      ? "border-game-accent bg-game-accent/10"
                      : "border-game-border hover:border-game-muted"
                  }`}
                >
                  <Icon
                    name={mode.icon}
                    size={16}
                    className={selectedMode === mode.id ? "text-game-accent" : "text-game-muted"}
                  />
                  <div className={`text-[10px] font-bold mt-1 tracking-wider ${selectedMode === mode.id ? "text-game-accent" : "text-game-text"}`}>
                    {mode.name}
                  </div>
                  <div className="text-[9px] text-game-muted mt-0.5 font-sans">{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Player / Squad */}
        <div className="w-64 border-l border-game-border flex flex-col">
          <div className="px-6 py-4 border-b border-game-border">
            <div className="text-[10px] text-game-muted tracking-[0.3em]">ОПЕРАТИВНИК</div>
          </div>

          <div className="p-4 border-b border-game-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-game-accent relative">
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🎖️</div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-game-accent flex items-center justify-center">
                  <span className="text-[8px] text-black font-black">47</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-bold tracking-wider">GHOST_X</div>
                <div className="text-[10px] text-game-accent">◆ ЭЛИТА III</div>
                <div className="text-[9px] text-game-muted">K/D: 3.47</div>
              </div>
            </div>

            {/* XP bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[9px] text-game-muted mb-1">
                <span>ОПЫТ</span>
                <span>8,420 / 10,000</span>
              </div>
              <div className="h-1 bg-game-border">
                <div className="h-full bg-game-accent" style={{ width: "84.2%" }} />
              </div>
            </div>
          </div>

          {/* Squad */}
          <div className="px-4 py-3 border-b border-game-border">
            <div className="text-[10px] text-game-muted tracking-[0.3em] mb-2">ОТРЯД</div>
            {["VIPER_7", "SHADOW", "WOLF_3"].map((name, i) => (
              <div key={name} className="flex items-center gap-2 py-1.5">
                <div className="w-6 h-6 border border-green-500/50 flex items-center justify-center text-[10px]">
                  {["🐍","👁️","🐺"][i]}
                </div>
                <div className="flex-1">
                  <div className="text-[11px] tracking-wider">{name}</div>
                  <div className="h-0.5 bg-game-border mt-0.5">
                    <div className="h-full bg-green-500/60" style={{ width: `${[90, 75, 88][i]}%` }} />
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            ))}
          </div>

          <div className="flex-1" />

          {/* PLAY button */}
          <div className="p-4">
            <button
              onClick={() => { playClick(); onPlay(selectedMap, selectedMode); }}
              className="w-full py-4 bg-game-accent text-black font-black text-sm tracking-[0.3em] hover:bg-game-accent/90 transition-all duration-200 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Icon name="Play" size={16} />
                В БОЙ
              </span>
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
            </button>

            <button className="w-full mt-2 py-2 border border-game-border text-game-muted text-[10px] tracking-[0.3em] hover:border-game-muted transition-all">
              ТРЕНИРОВКА
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}