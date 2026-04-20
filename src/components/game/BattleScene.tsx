import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  mapId: string;
  mode: string;
  onExit: () => void;
  onInventory: () => void;
}

const WEAPONS = [
  { id: "rifle", name: "AK-97", icon: "🔫", ammo: 28, maxAmmo: 90, dmg: 42 },
  { id: "pistol", name: "DESERT EAGLE", icon: "🔫", ammo: 7, maxAmmo: 21, dmg: 58 },
  { id: "grenade", name: "ГРАНАТА F1", icon: "💣", ammo: 2, maxAmmo: 4, dmg: 120 },
];

const ENEMIES = [
  { id: 1, name: "ВРАГ-01", hp: 100, x: 72, y: 20, active: true },
  { id: 2, name: "ВРАГ-02", hp: 65, x: 55, y: 35, active: true },
  { id: 3, name: "ВРАГ-03", hp: 0, x: 80, y: 60, active: false },
];

const MAP_NAMES: Record<string, string> = {
  urban: "ГОРОДСКИЕ РУИНЫ",
  jungle: "ДЖУНГЛИ СМЕРТИ",
  arctic: "АРКТИЧЕСКАЯ БАЗА",
  desert: "ПУСТЫННАЯ КРЕПОСТЬ",
};

const MAP_COLORS: Record<string, string> = {
  urban: "#ff6b35",
  jungle: "#39d353",
  arctic: "#58c4f5",
  desert: "#f5c842",
};

export default function BattleScene({ mapId, mode, onExit, onInventory }: Props) {
  const [playerHp, setPlayerHp] = useState(100);
  const [playerArmor, setPlayerArmor] = useState(75);
  const [enemies, setEnemies] = useState(ENEMIES);
  const [activeWeapon, setActiveWeapon] = useState(0);
  const [weapons, setWeapons] = useState(WEAPONS);
  const [kills, setKills] = useState(0);
  const [time, setTime] = useState(480); // 8 min
  const [score, setScore] = useState(0);
  const [teamScore, setTeamScore] = useState({ us: 3, them: 2 });
  const [hitEffect, setHitEffect] = useState(false);
  const [shootEffect, setShootEffect] = useState(false);
  const [minimap, setMinimap] = useState({ x: 20, y: 60 });

  const mapColor = MAP_COLORS[mapId] || "#ff6b35";

  useEffect(() => {
    const t = setInterval(() => setTime(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const shoot = () => {
    const w = weapons[activeWeapon];
    if (w.ammo <= 0) return;
    setWeapons(prev => prev.map((wp, i) => i === activeWeapon ? { ...wp, ammo: wp.ammo - 1 } : wp));
    setShootEffect(true);
    setTimeout(() => setShootEffect(false), 150);

    // hit random active enemy
    const active = enemies.filter(e => e.active && e.hp > 0);
    if (active.length > 0) {
      const target = active[Math.floor(Math.random() * active.length)];
      const dmg = w.dmg + Math.floor(Math.random() * 20) - 10;
      setEnemies(prev => prev.map(e => {
        if (e.id !== target.id) return e;
        const newHp = Math.max(0, e.hp - dmg);
        if (newHp === 0) {
          setKills(k => k + 1);
          setScore(s => s + 100);
        }
        return { ...e, hp: newHp, active: newHp > 0 };
      }));
    }
  };

  const takeDamage = () => {
    setHitEffect(true);
    setTimeout(() => setHitEffect(false), 400);
    if (playerArmor > 0) {
      setPlayerArmor(p => Math.max(0, p - 15));
    } else {
      setPlayerHp(p => Math.max(0, p - 20));
    }
  };

  const reload = () => {
    const w = weapons[activeWeapon];
    const need = w.maxAmmo - w.ammo;
    setWeapons(prev => prev.map((wp, i) => i === activeWeapon ? { ...wp, ammo: Math.min(wp.maxAmmo, wp.ammo + need) } : wp));
  };

  const curWeapon = weapons[activeWeapon];
  const aliveEnemies = enemies.filter(e => e.active && e.hp > 0).length;

  return (
    <div className="min-h-screen bg-game-bg text-game-text font-orbitron overflow-hidden relative select-none">
      <div className="scanlines pointer-events-none" />

      {/* Hit effect overlay */}
      {hitEffect && (
        <div className="absolute inset-0 bg-red-600/20 z-50 pointer-events-none border-4 border-red-600/60 animate-pulse" />
      )}

      {/* Shoot flash */}
      {shootEffect && (
        <div className="absolute inset-0 bg-white/5 z-40 pointer-events-none" />
      )}

      {/* TOP HUD */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-start justify-between p-4">
        {/* Left — Player Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="Heart" size={12} className="text-red-400" />
            <div className="w-36 h-2 bg-game-border">
              <div className="h-full bg-red-500 transition-all" style={{ width: `${playerHp}%` }} />
            </div>
            <span className="text-[11px] text-red-400 w-8">{playerHp}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Shield" size={12} className="text-blue-400" />
            <div className="w-36 h-2 bg-game-border">
              <div className="h-full bg-blue-400 transition-all" style={{ width: `${playerArmor}%` }} />
            </div>
            <span className="text-[11px] text-blue-400 w-8">{playerArmor}</span>
          </div>
        </div>

        {/* Center — Match info */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: mapColor }}>{teamScore.us}</div>
              <div className="text-[9px] text-game-muted tracking-widest">НАШ</div>
            </div>
            <div className="px-4 py-1 border border-game-border">
              <div className="text-lg font-bold text-white">{formatTime(time)}</div>
              <div className="text-[9px] text-game-muted">{MAP_NAMES[mapId]}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-red-400">{teamScore.them}</div>
              <div className="text-[9px] text-game-muted tracking-widest">ВРАГ</div>
            </div>
          </div>
        </div>

        {/* Right — Score/Kills */}
        <div className="text-right space-y-1">
          <div className="text-[10px] text-game-muted">СЧЁТ <span className="text-white font-bold">{score}</span></div>
          <div className="text-[10px] text-game-muted">УБИЙСТВА <span style={{ color: mapColor }} className="font-bold">{kills}</span></div>
          <button onClick={onExit} className="text-[9px] text-game-muted hover:text-white flex items-center gap-1 ml-auto">
            <Icon name="LogOut" size={10} /> ВЫХОД
          </button>
        </div>
      </div>

      {/* MAIN BATTLEFIELD */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full battlefield-view" style={{ "--map-col": mapColor } as React.CSSProperties}>
          {/* Background atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

          {/* Enemy markers on field */}
          {enemies.map(enemy => (
            <div
              key={enemy.id}
              className={`absolute transition-all duration-300 ${!enemy.active || enemy.hp === 0 ? "opacity-20" : "opacity-100"}`}
              style={{ left: `${enemy.x}%`, top: `${enemy.y}%`, transform: "translate(-50%, -50%)" }}
            >
              <div className={`relative ${enemy.hp > 0 && enemy.active ? "enemy-alive" : ""}`}>
                <div className="w-8 h-8 border-2 border-red-500 flex items-center justify-center text-sm">
                  {enemy.hp > 0 ? "☠" : "✕"}
                </div>
                {enemy.hp > 0 && enemy.active && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12">
                    <div className="h-1 bg-game-border">
                      <div className="h-full bg-red-500 transition-all" style={{ width: `${enemy.hp}%` }} />
                    </div>
                    <div className="text-[8px] text-center text-red-400 mt-0.5">{enemy.name}</div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Player crosshair indicator */}
          <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2">
            <div className="crosshair">
              <div className="ch-line ch-top" />
              <div className="ch-line ch-bottom" />
              <div className="ch-line ch-left" />
              <div className="ch-line ch-right" />
              <div className="ch-dot" />
            </div>
          </div>

          {/* Objectives */}
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 border-2 border-yellow-400 flex items-center justify-center animate-pulse">
              <Icon name="Flag" size={12} className="text-yellow-400" />
            </div>
            <div className="text-[8px] text-yellow-400 mt-1 text-center">ТОЧКА A</div>
          </div>
          <div className="absolute top-1/3 right-1/3 translate-x-1/2">
            <div className="w-6 h-6 border-2 border-blue-400 flex items-center justify-center animate-pulse">
              <Icon name="Flag" size={12} className="text-blue-400" />
            </div>
            <div className="text-[8px] text-blue-400 mt-1 text-center">ТОЧКА B</div>
          </div>
        </div>
      </div>

      {/* BOTTOM HUD */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-end justify-between p-4">
        {/* Left — Minimap */}
        <div className="relative">
          <div className="w-36 h-36 border border-game-border bg-black/80 relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="absolute text-[8px] top-1 left-1 text-game-muted tracking-widest">КАРТА</div>

            {/* Enemy dots */}
            {enemies.filter(e => e.active && e.hp > 0).map(e => (
              <div
                key={e.id}
                className="absolute w-1.5 h-1.5 bg-red-500 rounded-full"
                style={{ left: `${e.x * 0.9}%`, top: `${e.y * 0.9}%` }}
              />
            ))}

            {/* Player dot */}
            <div className="absolute w-2 h-2 rounded-full animate-pulse z-10" style={{ left: "20%", top: "60%", backgroundColor: mapColor }} />

            {/* Objectives on minimap */}
            <div className="absolute w-1.5 h-1.5 bg-yellow-400 rotate-45" style={{ left: "30%", top: "50%" }} />
            <div className="absolute w-1.5 h-1.5 bg-blue-400 rotate-45" style={{ left: "60%", top: "35%" }} />
          </div>
          <div className="flex gap-1 mt-1">
            <div className="flex items-center gap-1 text-[9px]">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mapColor }} />
              <span className="text-game-muted">ТЫ</span>
            </div>
            <div className="flex items-center gap-1 text-[9px]">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-game-muted">ВРАГ ×{aliveEnemies}</span>
            </div>
          </div>
        </div>

        {/* Center — Action buttons */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            <button
              onClick={takeDamage}
              className="px-4 py-2 border border-red-500/50 text-red-400 text-[10px] tracking-wider hover:bg-red-500/10 transition-all"
            >
              <Icon name="Zap" size={12} className="inline mr-1" />
              ПОЛУЧИТЬ УДАР
            </button>
            <button
              onClick={reload}
              className="px-4 py-2 border border-game-border text-game-muted text-[10px] tracking-wider hover:border-game-muted transition-all"
            >
              <Icon name="RotateCcw" size={12} className="inline mr-1" />
              ПЕРЕЗАРЯДКА [R]
            </button>
            <button
              onClick={onInventory}
              className="px-4 py-2 border border-game-border text-game-muted text-[10px] tracking-wider hover:border-game-muted transition-all"
            >
              <Icon name="Package" size={12} className="inline mr-1" />
              ИНВЕНТАРЬ [I]
            </button>
          </div>

          <button
            onClick={shoot}
            disabled={curWeapon.ammo === 0}
            className="px-16 py-3 text-black font-black text-sm tracking-[0.3em] transition-all relative overflow-hidden group disabled:opacity-40"
            style={{ backgroundColor: curWeapon.ammo > 0 ? mapColor : "#444" }}
          >
            <span className="flex items-center gap-2">
              <Icon name="Crosshair" size={16} />
              ОГОНЬ [SPACE]
            </span>
            {curWeapon.ammo === 0 && <span className="ml-2 text-xs">— ПЕРЕЗАРЯДИТЕ</span>}
          </button>
        </div>

        {/* Right — Weapons */}
        <div className="space-y-2">
          {weapons.map((w, i) => (
            <button
              key={w.id}
              onClick={() => setActiveWeapon(i)}
              className={`flex items-center gap-3 px-3 py-2 border transition-all w-48 ${
                activeWeapon === i
                  ? "border-game-accent bg-game-accent/10"
                  : "border-game-border hover:border-game-muted"
              }`}
            >
              <span className="text-lg">{w.icon}</span>
              <div className="flex-1 text-left">
                <div className={`text-[10px] font-bold ${activeWeapon === i ? "text-game-accent" : "text-game-text"}`}>
                  {w.name}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.min(10, w.maxAmmo) }).map((_, bi) => (
                      <div
                        key={bi}
                        className="w-1 h-2"
                        style={{ backgroundColor: bi < Math.round((w.ammo / w.maxAmmo) * 10) ? (activeWeapon === i ? "var(--game-accent)" : "#666") : "#222" }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-game-muted">{w.ammo}/{w.maxAmmo}</span>
                </div>
              </div>
              <div className="text-[9px] text-game-muted">
                ⚡{w.dmg}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {aliveEnemies === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/60">
          <div className="text-center border-2 p-12" style={{ borderColor: mapColor }}>
            <div className="text-4xl font-black tracking-[0.3em]" style={{ color: mapColor }}>ПОБЕДА!</div>
            <div className="text-game-muted text-sm mt-2">Все противники уничтожены</div>
            <div className="text-white font-bold mt-4">СЧЁТ: {score + 500}</div>
            <button onClick={onExit} className="mt-6 px-8 py-2 border-2 text-sm font-bold tracking-wider hover:bg-white/10 transition-all" style={{ borderColor: mapColor, color: mapColor }}>
              В МЕНЮ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
