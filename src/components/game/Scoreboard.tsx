import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { playKill, playBeep } from "@/lib/audio";

interface Props {
  mapId: string;
  mode: string;
  playerKills: number;
  playerScore: number;
  onMenu: () => void;
  onRematch: () => void;
}

const MAP_COLORS: Record<string, string> = {
  urban: "#ff6b35",
  jungle: "#39d353",
  arctic: "#58c4f5",
  desert: "#f5c842",
};

const MAP_NAMES: Record<string, string> = {
  urban: "ГОРОДСКИЕ РУИНЫ",
  jungle: "ДЖУНГЛИ СМЕРТИ",
  arctic: "АРКТИЧЕСКАЯ БАЗА",
  desert: "ПУСТЫННАЯ КРЕПОСТЬ",
};

const generateTeam = (playerKills: number) => {
  const names = ["VIPER_7", "SHADOW", "WOLF_3", "GHOST_X"];
  const enemies = ["ENEMY_01", "BRAVO_K", "REAPER_X", "SNIPR"];

  const allies = names.map((name, i) => ({
    name,
    isPlayer: name === "GHOST_X",
    kills: name === "GHOST_X" ? playerKills : Math.floor(Math.random() * 8) + 2,
    deaths: Math.floor(Math.random() * 4),
    assists: Math.floor(Math.random() * 5),
    score: name === "GHOST_X" ? playerScore => playerScore : Math.floor(Math.random() * 800) + 200,
    ping: Math.floor(Math.random() * 40) + 15,
    team: "ally" as const,
    rank: ["🎖️", "⭐", "💎", "🔥"][i],
  }));

  const foes = enemies.map((name, i) => ({
    name,
    isPlayer: false,
    kills: Math.floor(Math.random() * 6) + 1,
    deaths: Math.floor(Math.random() * 6) + 2,
    assists: Math.floor(Math.random() * 4),
    score: Math.floor(Math.random() * 500) + 100,
    ping: Math.floor(Math.random() * 80) + 20,
    team: "enemy" as const,
    rank: ["💀", "🩸", "⚔️", "🎯"][i],
  }));

  return { allies, foes };
};

export default function Scoreboard({ mapId, mode, playerKills, playerScore, onMenu, onRematch }: Props) {
  const mapColor = MAP_COLORS[mapId] || "#ff6b35";
  const [revealed, setRevealed] = useState(0);
  const [showXp, setShowXp] = useState(false);
  const [xpAnimated, setXpAnimated] = useState(false);

  const { allies, foes } = generateTeam(playerKills);

  // Sort allies by kills desc
  const sortedAllies = [...allies].sort((a, b) => b.kills - a.kills);
  const sortedFoes = [...foes].sort((a, b) => b.kills - a.kills);
  const allPlayers = [...sortedAllies, ...sortedFoes].sort((a, b) => b.kills - a.kills);

  const totalKills = allies.reduce((s, p) => s + p.kills, 0);
  const totalDeaths = foes.reduce((s, p) => s + p.kills, 0);

  useEffect(() => {
    playKill();
    const interval = setInterval(() => {
      setRevealed(p => {
        const next = p + 1;
        playBeep(300 + next * 60);
        if (next >= allPlayers.length) {
          clearInterval(interval);
          setTimeout(() => setShowXp(true), 400);
          setTimeout(() => setXpAnimated(true), 600);
        }
        return next;
      });
    }, 180);
    return () => clearInterval(interval);
  }, []);

  const xpGained = playerScore + playerKills * 50 + 300;
  const mvp = allPlayers[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center font-orbitron overflow-hidden">
      <div className="scanlines pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-20 h-20 border-t-2 border-l-2" style={{ borderColor: mapColor + "60" }} />
      <div className="absolute top-6 right-6 w-20 h-20 border-t-2 border-r-2" style={{ borderColor: mapColor + "60" }} />
      <div className="absolute bottom-6 left-6 w-20 h-20 border-b-2 border-l-2" style={{ borderColor: mapColor + "60" }} />
      <div className="absolute bottom-6 right-6 w-20 h-20 border-b-2 border-r-2" style={{ borderColor: mapColor + "60" }} />

      <div className="w-full max-w-4xl px-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-[10px] text-game-muted tracking-[0.5em] mb-1">// РАУНД ЗАВЕРШЁН</div>
          <div
            className="text-5xl font-black tracking-[0.3em] mb-1"
            style={{ color: mapColor, textShadow: `0 0 40px ${mapColor}60` }}
          >
            ПОБЕДА
          </div>
          <div className="text-game-muted text-xs tracking-[0.4em]">
            {MAP_NAMES[mapId]} &nbsp;·&nbsp; {mode.toUpperCase()}
          </div>

          {/* Score bar */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-3xl font-black" style={{ color: mapColor }}>4</div>
              <div className="text-[9px] text-game-muted tracking-widest">НАШ СЧЁТ</div>
            </div>
            <div className="flex gap-1 items-center">
              <div className="h-1.5 rounded-sm w-24" style={{ backgroundColor: mapColor }} />
              <div className="text-game-muted text-xs">VS</div>
              <div className="h-1.5 rounded-sm w-14 bg-red-500" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-red-400">2</div>
              <div className="text-[9px] text-game-muted tracking-widest">СЧЁТ ВРАГА</div>
            </div>
          </div>
        </div>

        {/* MVP badge */}
        {revealed >= allPlayers.length && (
          <div className="flex justify-center mb-4">
            <div
              className="flex items-center gap-3 px-5 py-2 border"
              style={{ borderColor: mapColor, backgroundColor: mapColor + "15" }}
            >
              <span className="text-xl">👑</span>
              <div>
                <div className="text-[9px] text-game-muted tracking-[0.4em]">MVP РАУНДА</div>
                <div className="text-sm font-black tracking-wider" style={{ color: mapColor }}>{mvp.name}</div>
              </div>
              <div className="ml-4 text-[10px] text-game-muted">
                {mvp.kills}K / {mvp.deaths}D / {mvp.assists}A
              </div>
            </div>
          </div>
        )}

        {/* Scoreboard table */}
        <div className="border border-game-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 border-b border-game-border bg-game-panel px-4 py-2">
            {["ИГРОК", "УБИЙСТВА", "СМЕРТИ", "ПОМОЩЬ", "СЧЁТ", "ПИНГ"].map(h => (
              <div key={h} className="text-[9px] text-game-muted tracking-[0.3em] text-right first:text-left">{h}</div>
            ))}
          </div>

          {/* Team header — Allies */}
          <div className="px-4 py-1.5 border-b border-game-border" style={{ backgroundColor: mapColor + "10" }}>
            <div className="text-[9px] tracking-[0.4em] font-bold" style={{ color: mapColor }}>
              ▶ НАША КОМАНДА — {totalKills} УБИЙСТВ
            </div>
          </div>

          {sortedAllies.map((p, i) => (
            <div
              key={p.name}
              className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 px-4 py-2.5 border-b border-game-border/40 transition-all duration-300 ${
                i < revealed ? "opacity-100" : "opacity-0 translate-x-4"
              } ${p.isPlayer ? "bg-game-accent/5" : "hover:bg-white/2"}`}
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{p.rank}</span>
                <div>
                  <div className={`text-xs font-bold tracking-wider ${p.isPlayer ? "text-game-accent" : "text-game-text"}`}>
                    {p.name}
                    {p.isPlayer && <span className="ml-2 text-[8px] text-game-accent/60">[ВЫ]</span>}
                  </div>
                  {i === 0 && <div className="text-[8px] text-yellow-400">👑 MVP</div>}
                </div>
              </div>
              <div className="text-right text-sm font-black" style={{ color: p.kills > 5 ? mapColor : "inherit" }}>{p.kills}</div>
              <div className="text-right text-sm text-red-400/70">{p.deaths}</div>
              <div className="text-right text-sm text-game-muted">{p.assists}</div>
              <div className="text-right text-sm font-bold text-game-text">
                {typeof p.score === "function" ? p.score(playerScore) : playerScore > 0 && p.isPlayer ? playerScore : Math.floor(Math.random() * 800) + 200}
              </div>
              <div className={`text-right text-[11px] ${p.ping < 40 ? "text-green-400" : p.ping < 80 ? "text-yellow-400" : "text-red-400"}`}>{p.ping}ms</div>
            </div>
          ))}

          {/* Team header — Enemies */}
          <div className="px-4 py-1.5 border-b border-t border-game-border bg-red-500/10">
            <div className="text-[9px] text-red-400 tracking-[0.4em] font-bold">
              ▶ КОМАНДА ВРАГА — {totalDeaths} УБИЙСТВ
            </div>
          </div>

          {sortedFoes.map((p, i) => (
            <div
              key={p.name}
              className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 px-4 py-2.5 border-b border-game-border/40 transition-all duration-300 hover:bg-white/2 ${
                sortedAllies.length + i < revealed ? "opacity-100" : "opacity-0 translate-x-4"
              }`}
              style={{ transitionDelay: `${(sortedAllies.length + i) * 30}ms` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{p.rank}</span>
                <div className="text-xs text-red-300/80 tracking-wider">{p.name}</div>
              </div>
              <div className="text-right text-sm text-red-400">{p.kills}</div>
              <div className="text-right text-sm text-game-muted">{p.deaths}</div>
              <div className="text-right text-sm text-game-muted">{p.assists}</div>
              <div className="text-right text-sm text-game-muted">{p.score}</div>
              <div className={`text-right text-[11px] ${p.ping < 40 ? "text-green-400" : p.ping < 80 ? "text-yellow-400" : "text-red-400"}`}>{p.ping}ms</div>
            </div>
          ))}
        </div>

        {/* XP / Reward row */}
        {showXp && (
          <div className="mt-4 border border-game-border bg-game-panel px-6 py-4 flex items-center justify-between">
            <div className="flex gap-8">
              {[
                { label: "УБИЙСТВА", value: `+${playerKills * 50} XP`, color: mapColor },
                { label: "ПОБЕДА", value: "+300 XP", color: "#f59e0b" },
                { label: "СЧЁТ", value: `+${playerScore} XP`, color: "var(--game-accent)" },
              ].map(r => (
                <div key={r.label}>
                  <div className="text-[9px] text-game-muted tracking-[0.3em]">{r.label}</div>
                  <div className="text-sm font-black mt-0.5" style={{ color: r.color }}>{r.value}</div>
                </div>
              ))}
              <div className="border-l border-game-border pl-8">
                <div className="text-[9px] text-game-muted tracking-[0.3em]">ИТОГО</div>
                <div className="text-lg font-black text-white mt-0.5">+{xpGained} XP</div>
              </div>
            </div>

            {/* XP bar progress */}
            <div className="w-48">
              <div className="flex justify-between text-[9px] text-game-muted mb-1">
                <span>ДО СЛЕДУЮЩЕГО УРОВНЯ</span>
                <span>47 → 48</span>
              </div>
              <div className="h-2 bg-game-border">
                <div
                  className="h-full transition-all duration-1000 ease-out"
                  style={{
                    width: xpAnimated ? "93%" : "84%",
                    backgroundColor: mapColor,
                    boxShadow: `0 0 8px ${mapColor}80`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        {showXp && (
          <div className="flex gap-3 mt-4 justify-center">
            <button
              onClick={onRematch}
              className="px-10 py-3 font-black text-xs tracking-[0.3em] transition-all"
              style={{ backgroundColor: mapColor, color: "#000" }}
            >
              <Icon name="RotateCcw" size={14} className="inline mr-2" />
              РЕВАНШ
            </button>
            <button
              onClick={onMenu}
              className="px-10 py-3 border border-game-border text-game-muted text-xs tracking-[0.3em] hover:border-game-muted hover:text-game-text transition-all"
            >
              <Icon name="Home" size={14} className="inline mr-2" />
              В МЕНЮ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
