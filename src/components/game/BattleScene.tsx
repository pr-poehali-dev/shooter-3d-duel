import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { playShoot, playReload, playHit, playKill, startMusic, stopMusic } from "@/lib/audio";
import Scoreboard from "@/components/game/Scoreboard";

interface Props {
  mapId: string;
  mode: string;
  botCount: number;
  botDifficulty: string;
  onExit: () => void;
  onInventory: () => void;
}

const MAP_COLORS: Record<string, string> = {
  urban: "#ff6b35", jungle: "#39d353", arctic: "#58c4f5", desert: "#f5c842",
};
const MAP_NAMES: Record<string, string> = {
  urban: "ГОРОДСКИЕ РУИНЫ", jungle: "ДЖУНГЛИ СМЕРТИ", arctic: "АРКТИЧЕСКАЯ БАЗА", desert: "ПУСТЫННАЯ КРЕПОСТЬ",
};

const DIFF_PARAMS: Record<string, { accuracy: number; reactionMs: number; speed: number }> = {
  easy:   { accuracy: 0.18, reactionMs: 2200, speed: 0.3 },
  normal: { accuracy: 0.42, reactionMs: 1100, speed: 0.55 },
  hard:   { accuracy: 0.68, reactionMs: 550,  speed: 0.8 },
  insane: { accuracy: 0.90, reactionMs: 220,  speed: 1.1 },
};

const BOT_NAMES = [
  "VIPER","GHOST","SHADOW","WOLF","HAWK","RAVEN","STORM","BLADE",
  "COBRA","REAPER","LYNX","VENOM","TITAN","OMEGA","RAZOR","ALPHA",
  "DELTA","SIGMA","ECHO","FALCON","JAGUAR","PANTHER","RAPTOR","HORNET",
  "MANTIS","SPHINX","HYDRA","KRAKEN","WRAITH","SPECTR",
];

// Map obstacles for each map (x%, y%, w%, h%)
const MAP_WALLS: Record<string, Array<{x:number;y:number;w:number;h:number}>> = {
  urban:  [{x:15,y:20,w:10,h:15},{x:40,y:10,w:8,h:20},{x:60,y:30,w:12,h:10},{x:25,y:55,w:15,h:10},{x:70,y:60,w:10,h:15},{x:50,y:50,w:8,h:8}],
  jungle: [{x:10,y:15,w:6,h:30},{x:30,y:40,w:20,h:6},{x:65,y:20,w:6,h:25},{x:45,y:65,w:18,h:6},{x:80,y:50,w:8,h:20}],
  arctic: [{x:20,y:30,w:20,h:8},{x:60,y:20,w:8,h:25},{x:35,y:60,w:8,h:20},{x:70,y:55,w:15,h:8}],
  desert: [{x:30,y:20,w:8,h:8},{x:55,y:35,w:8,h:8},{x:20,y:60,w:8,h:8},{x:70,y:65,w:8,h:8},{x:45,y:50,w:8,h:8}],
};

type BotTeam = "ally" | "enemy";

interface Bot {
  id: number;
  name: string;
  team: BotTeam;
  x: number; // 0-100 percent
  y: number;
  hp: number;
  maxHp: number;
  angle: number; // movement direction degrees
  targetX: number;
  targetY: number;
  alive: boolean;
  kills: number;
  shootCooldown: number;
  reactionTimer: number;
  lastShotAt: number;
  emoji: string;
}

const TEAM_EMOJIS = ["🐍","👁️","🐺","🦅","🦂","🐦","⚡","🗡️","🐍","💀","🦁","☠️","🔱","Ω","⚔️"];

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax-bx)**2 + (ay-by)**2);
}

function wallsBlock(walls: Array<{x:number;y:number;w:number;h:number}>, ax: number, ay: number, bx: number, by: number): boolean {
  for (const w of walls) {
    const wx1 = w.x, wy1 = w.y, wx2 = w.x + w.w, wy2 = w.y + w.h;
    // Simple segment-rect intersection
    const dx = bx - ax, dy = by - ay;
    const checks = [
      { t: (wx1 - ax) / dx, edge: "left" },
      { t: (wx2 - ax) / dx, edge: "right" },
      { t: (wy1 - ay) / dy, edge: "top" },
      { t: (wy2 - ay) / dy, edge: "bottom" },
    ];
    for (const c of checks) {
      if (isFinite(c.t) && c.t >= 0 && c.t <= 1) {
        const ix = ax + c.t * dx, iy = ay + c.t * dy;
        if (ix >= wx1 - 0.5 && ix <= wx2 + 0.5 && iy >= wy1 - 0.5 && iy <= wy2 + 0.5) return true;
      }
    }
  }
  return false;
}

function spawnPos(team: BotTeam, index: number): { x: number; y: number } {
  if (team === "ally")  return { x: 5  + (index % 5) * 3, y: 70 + Math.floor(index / 5) * 4 };
  return { x: 80 + (index % 5) * 3, y: 10 + Math.floor(index / 5) * 4 };
}

export default function BattleScene({ mapId, mode, botCount, botDifficulty, onExit, onInventory }: Props) {
  const mapColor = MAP_COLORS[mapId] || "#ff6b35";
  const walls = MAP_WALLS[mapId] || [];
  const diff = DIFF_PARAMS[botDifficulty] || DIFF_PARAMS.normal;

  // Player state
  const [playerHp, setPlayerHp] = useState(100);
  const [playerArmor, setPlayerArmor] = useState(75);
  const [playerPos, setPlayerPos] = useState({ x: 15, y: 80 });
  const [playerAngle, setPlayerAngle] = useState(0); // look direction degrees
  const [kills, setKills] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(480);
  const [teamScore, setTeamScore] = useState({ us: 0, them: 0 });

  // Weapons
  const [activeWeapon, setActiveWeapon] = useState(0);
  const [weapons, setWeapons] = useState([
    { id: "rifle",   name: "AK-97",        ammo: 28, maxAmmo: 90,  dmg: 42, fireRate: 120 },
    { id: "pistol",  name: "DESERT EAGLE", ammo: 7,  maxAmmo: 21,  dmg: 58, fireRate: 400 },
    { id: "grenade", name: "ГРАНАТА F1",   ammo: 2,  maxAmmo: 4,   dmg: 150, fireRate: 1000 },
  ]);

  // Effects
  const [hitEffect, setHitEffect] = useState(false);
  const [shootEffect, setShootEffect] = useState(false);
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const [hitMarker, setHitMarker] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<Array<{id:number;val:number;x:number;y:number}>>([]);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadProgress, setReloadProgress] = useState(0);

  // Bots
  const [bots, setBots] = useState<Bot[]>(() => {
    const half = Math.ceil(botCount / 2);
    const arr: Bot[] = [];
    for (let i = 0; i < botCount; i++) {
      const team: BotTeam = i < half ? "ally" : "enemy";
      const idx = team === "ally" ? i : i - half;
      const pos = spawnPos(team, idx);
      arr.push({
        id: i,
        name: BOT_NAMES[i % BOT_NAMES.length] + "_" + (i + 1),
        team,
        x: pos.x, y: pos.y,
        hp: 100, maxHp: 100,
        angle: team === "ally" ? 45 : 225,
        targetX: 50, targetY: 50,
        alive: true,
        kills: 0,
        shootCooldown: 0,
        reactionTimer: diff.reactionMs,
        lastShotAt: 0,
        emoji: TEAM_EMOJIS[i % TEAM_EMOJIS.length],
      });
    }
    return arr;
  });

  const botsRef = useRef(bots);
  botsRef.current = bots;
  const playerPosRef = useRef(playerPos);
  playerPosRef.current = playerPos;
  const playerHpRef = useRef(playerHp);
  playerHpRef.current = playerHp;
  const killsRef = useRef(kills);
  killsRef.current = kills;
  const scoreRef = useRef(score);
  scoreRef.current = score;

  const keysRef = useRef<Set<string>>(new Set());
  const lastShootRef = useRef(0);
  const gameRef = useRef<HTMLDivElement>(null);

  // Start music
  useEffect(() => {
    startMusic();
    return () => stopMusic();
  }, []);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setTime(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (e.key === " ") { e.preventDefault(); handleShoot(); }
      if (e.key.toLowerCase() === "r") handleReload();
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [activeWeapon, weapons]);

  // Player movement loop
  useEffect(() => {
    const speed = 0.35;
    const interval = setInterval(() => {
      const keys = keysRef.current;
      let dx = 0, dy = 0;
      if (keys.has("w") || keys.has("arrowup"))    dy -= speed;
      if (keys.has("s") || keys.has("arrowdown"))  dy += speed;
      if (keys.has("a") || keys.has("arrowleft"))  dx -= speed;
      if (keys.has("d") || keys.has("arrowright")) dx += speed;
      if (dx !== 0 || dy !== 0) {
        setPlayerPos(p => ({
          x: clamp(p.x + dx, 2, 96),
          y: clamp(p.y + dy, 2, 96),
        }));
        if (dx !== 0 || dy !== 0) {
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          setPlayerAngle(angle);
        }
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // BOT AI LOOP
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const currentBots = botsRef.current;
      const pp = playerPosRef.current;

      setBots(prev => prev.map(bot => {
        if (!bot.alive) return bot;

        // Find nearest enemy target
        const isAlly = bot.team === "ally";
        // Allies fight enemies, enemies fight player + other allies
        const enemyBots = currentBots.filter(b => b.alive && b.team !== bot.team);
        const canSeePlayer = !isAlly;

        // Pick target
        let targetX = bot.targetX;
        let targetY = bot.targetY;
        let hasTarget = false;
        let targetDist = 999;
        let targetIsPlayer = false;

        if (canSeePlayer && playerHpRef.current > 0) {
          const d = dist(bot.x, bot.y, pp.x, pp.y);
          targetX = pp.x; targetY = pp.y;
          targetDist = d; hasTarget = true; targetIsPlayer = true;
        }
        // Also target nearest enemy bot
        for (const eb of enemyBots) {
          const d = dist(bot.x, bot.y, eb.x, eb.y);
          if (d < targetDist) {
            targetDist = d; targetX = eb.x; targetY = eb.y;
            hasTarget = true; targetIsPlayer = false;
          }
        }

        // Movement: wander or chase
        let newX = bot.x, newY = bot.y;
        const spd = diff.speed * 0.4;

        if (hasTarget && targetDist > 15) {
          // Move toward target
          const dx = targetX - bot.x, dy = targetY - bot.y;
          const len = Math.sqrt(dx*dx + dy*dy) || 1;
          const nx = bot.x + (dx/len) * spd;
          const ny = bot.y + (dy/len) * spd;
          // Basic wall avoidance
          let blocked = false;
          for (const w of walls) {
            if (nx > w.x && nx < w.x+w.w && ny > w.y && ny < w.y+w.h) { blocked = true; break; }
          }
          if (!blocked) { newX = clamp(nx,2,96); newY = clamp(ny,2,96); }
          else {
            // Try slide
            const nx2 = clamp(bot.x + (dx/len)*spd, 2, 96);
            const blk2 = walls.some(w => nx2>w.x&&nx2<w.x+w.w&&bot.y>w.y&&bot.y<w.y+w.h);
            if (!blk2) { newX = nx2; newY = bot.y; }
            else {
              const ny2 = clamp(bot.y + (dy/len)*spd, 2, 96);
              const blk3 = walls.some(w => bot.x>w.x&&bot.x<w.x+w.w&&ny2>w.y&&ny2<w.y+w.h);
              if (!blk3) { newX = bot.x; newY = ny2; }
            }
          }
        } else if (!hasTarget || targetDist < 8) {
          // Wander or hold position
          if (now % 3000 < 30) {
            targetX = 10 + Math.random() * 80;
            targetY = 10 + Math.random() * 80;
          }
          const dx = targetX - bot.x, dy = targetY - bot.y;
          const len = Math.sqrt(dx*dx+dy*dy)||1;
          if (len > 2) {
            newX = clamp(bot.x+(dx/len)*spd*0.5, 2, 96);
            newY = clamp(bot.y+(dy/len)*spd*0.5, 2, 96);
          }
        } else if (targetDist < 15 && targetDist > 6) {
          // Strafe
          const perpX = -(targetY-bot.y), perpY = (targetX-bot.x);
          const len = Math.sqrt(perpX*perpX+perpY*perpY)||1;
          const side = Math.sin(now/1000) > 0 ? 1 : -1;
          newX = clamp(bot.x+(perpX/len)*spd*side, 2, 96);
          newY = clamp(bot.y+(perpY/len)*spd*side, 2, 96);
        }

        const newAngle = Math.atan2(targetY-bot.y, targetX-bot.x) * 180/Math.PI;

        // Shooting
        let newBot = { ...bot, x: newX, y: newY, angle: newAngle, targetX, targetY };
        const cooldownPassed = now - bot.lastShotAt > diff.reactionMs;
        const inRange = targetDist < 40 && hasTarget;
        const lineOfSight = !wallsBlock(walls, bot.x, bot.y, targetX, targetY);

        if (inRange && cooldownPassed && lineOfSight) {
          const hits = Math.random() < diff.accuracy;
          newBot = { ...newBot, lastShotAt: now };

          if (hits) {
            if (targetIsPlayer) {
              // Damage player
              setPlayerHp(hp => {
                const newHp = Math.max(0, hp - (15 + Math.random() * 20));
                if (newHp < hp) {
                  playHit();
                  setHitEffect(true);
                  setTimeout(() => setHitEffect(false), 350);
                }
                return Math.round(newHp);
              });
            } else {
              // Damage enemy bot
              setBots(prev2 => prev2.map(eb => {
                if (eb.team === bot.team || !eb.alive) return eb;
                if (dist(eb.x, eb.y, targetX, targetY) < 3) {
                  const dmg = Math.round(15 + Math.random()*20);
                  const newHp = Math.max(0, eb.hp - dmg);
                  if (newHp === 0 && eb.alive) {
                    setTeamScore(ts => bot.team === "ally"
                      ? { ...ts, us: ts.us + 1 }
                      : { ...ts, them: ts.them + 1 }
                    );
                    return { ...eb, hp: 0, alive: false };
                  }
                  return { ...eb, hp: newHp };
                }
                return eb;
              }));
            }
          }
        }

        return newBot;
      }));
    }, 50);
    return () => clearInterval(interval);
  }, [diff, walls]);

  // Shoot handler
  const handleShoot = useCallback(() => {
    const now = Date.now();
    const w = weapons[activeWeapon];
    if (w.ammo <= 0 || isReloading) return;
    if (now - lastShootRef.current < w.fireRate) return;
    lastShootRef.current = now;

    playShoot();
    setMuzzleFlash(true); setTimeout(() => setMuzzleFlash(false), 80);
    setShootEffect(true); setTimeout(() => setShootEffect(false), 100);
    setWeapons(prev => prev.map((wp, i) => i === activeWeapon ? { ...wp, ammo: wp.ammo - 1 } : wp));

    // Raycast: hit nearest alive enemy bot in crosshair direction
    const pp = playerPosRef.current;
    const spread = 6;
    let hit: Bot | null = null;
    let hitDist = 999;

    const currentBots = botsRef.current;
    for (const b of currentBots) {
      if (!b.alive || b.team === "ally") continue;
      const d = dist(pp.x, pp.y, b.x, b.y);
      if (d < 35) {
        // Check angle alignment (player looks toward bot?)
        const angleToBot = Math.atan2(b.y - pp.y, b.x - pp.x) * 180 / Math.PI;
        const angleDiff = Math.abs(((angleToBot - playerAngle + 180) % 360) - 180);
        if (angleDiff < spread + (35 - d) && d < hitDist && !wallsBlock(walls, pp.x, pp.y, b.x, b.y)) {
          hit = b; hitDist = d;
        }
      }
    }

    if (hit) {
      const dmg = Math.round(w.dmg + Math.random() * 15 - 5);
      setHitMarker(true); setTimeout(() => setHitMarker(false), 200);
      setDamageNumbers(prev => [...prev, { id: now, val: dmg, x: hit!.x, y: hit!.y }]);
      setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== now)), 1000);

      setBots(prev => prev.map(b => {
        if (b.id !== hit!.id) return b;
        const newHp = Math.max(0, b.hp - dmg);
        if (newHp === 0 && b.alive) {
          playKill();
          setKills(k => k + 1);
          setScore(s => s + 100);
          setTeamScore(ts => ({ ...ts, us: ts.us + 1 }));
          return { ...b, hp: 0, alive: false };
        }
        return { ...b, hp: newHp };
      }));
    }
  }, [activeWeapon, weapons, playerAngle, isReloading, walls]);

  // Reload
  const handleReload = useCallback(() => {
    if (isReloading) return;
    const w = weapons[activeWeapon];
    if (w.ammo === w.maxAmmo) return;
    setIsReloading(true);
    setReloadProgress(0);
    playReload();
    const dur = 2000;
    const step = 50;
    let elapsed = 0;
    const t = setInterval(() => {
      elapsed += step;
      setReloadProgress(Math.min(100, (elapsed / dur) * 100));
      if (elapsed >= dur) {
        clearInterval(t);
        setWeapons(prev => prev.map((wp, i) => i === activeWeapon ? { ...wp, ammo: wp.maxAmmo } : wp));
        setIsReloading(false);
        setReloadProgress(0);
      }
    }, step);
  }, [isReloading, activeWeapon, weapons]);

  const curWeapon = weapons[activeWeapon];
  const aliveBots = bots.filter(b => b.alive);
  const aliveEnemies = aliveBots.filter(b => b.team === "enemy");
  const aliveAllies = aliveBots.filter(b => b.team === "ally");
  const totalEnemies = bots.filter(b => b.team === "enemy").length;
  const gameWon = aliveEnemies.length === 0 && bots.filter(b=>b.team==="enemy").length > 0;
  const gameLost = playerHp <= 0;
  const formatTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // Viewport: render bots relative to player (FPS-style top-down with player centered)
  const VIEW_W = 100, VIEW_H = 100;
  const vx = playerPosRef.current.x, vy = playerPosRef.current.y;

  return (
    <div
      ref={gameRef}
      className="min-h-screen bg-game-bg text-game-text font-orbitron overflow-hidden relative select-none"
      onClick={handleShoot}
      style={{ cursor: "crosshair" }}
    >
      <div className="scanlines pointer-events-none z-50" />

      {/* ── DAMAGE FLASH ── */}
      {hitEffect && <div className="absolute inset-0 z-40 pointer-events-none border-8 border-red-600/60" style={{ boxShadow: "inset 0 0 80px rgba(220,38,38,0.5)" }} />}
      {shootEffect && <div className="absolute inset-0 z-30 pointer-events-none bg-white/4" />}

      {/* ── GAME WORLD (top-down FPS view) ── */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: `radial-gradient(ellipse at ${vx}% ${vy}%, ${mapColor}12 0%, transparent 60%), linear-gradient(to bottom, #050810, #0a0f1a 40%, #050810)`
          }}
        />
        <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

        {/* ── WALLS ── */}
        {walls.map((w, i) => (
          <div
            key={i}
            className="absolute border border-game-border/40"
            style={{
              left: `${w.x}%`, top: `${w.y}%`,
              width: `${w.w}%`, height: `${w.h}%`,
              backgroundColor: "#0d1520",
              boxShadow: `0 0 12px ${mapColor}20`,
            }}
          />
        ))}

        {/* ── BOTS ── */}
        {bots.map(bot => {
          const isEnemy = bot.team === "enemy";
          const color = isEnemy ? "#ef4444" : "#22c55e";
          const opacity = bot.alive ? 1 : 0.25;
          const dx = bot.x - vx, dy = bot.y - vy;
          // Only render if within viewport range
          if (Math.abs(dx) > 55 || Math.abs(dy) > 55) return null;

          return (
            <div
              key={bot.id}
              className="absolute transition-all duration-50"
              style={{
                left: `${bot.x}%`, top: `${bot.y}%`,
                transform: "translate(-50%,-50%)",
                opacity,
                zIndex: 10,
              }}
            >
              {/* Bot body */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: 32, height: 32,
                  border: `2px solid ${color}`,
                  backgroundColor: color + "20",
                  boxShadow: bot.alive ? `0 0 10px ${color}60` : "none",
                  transform: `rotate(${bot.angle}deg)`,
                  transition: "transform 0.1s",
                }}
              >
                <span style={{ transform: `rotate(${-bot.angle}deg)`, fontSize: 14 }}>{bot.emoji}</span>
                {/* Direction indicator */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-1 h-3" style={{ backgroundColor: color }} />
              </div>

              {/* HP bar */}
              {bot.alive && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8">
                  <div className="h-1 bg-black/50">
                    <div className="h-full transition-all" style={{ width: `${(bot.hp/bot.maxHp)*100}%`, backgroundColor: color }} />
                  </div>
                  <div className="text-[7px] text-center mt-0.5 whitespace-nowrap tracking-wider" style={{ color }}>
                    {bot.name.split("_")[0]}
                  </div>
                </div>
              )}

              {/* Dead marker */}
              {!bot.alive && (
                <div className="absolute inset-0 flex items-center justify-center text-lg opacity-50">✕</div>
              )}
            </div>
          );
        })}

        {/* ── PLAYER (center) ── */}
        <div
          className="absolute z-20"
          style={{ left: `${vx}%`, top: `${vy}%`, transform: "translate(-50%,-50%)" }}
        >
          <div
            className="relative flex items-center justify-center"
            style={{
              width: 36, height: 36,
              border: `2px solid ${mapColor}`,
              backgroundColor: mapColor + "25",
              boxShadow: `0 0 16px ${mapColor}80`,
              transform: `rotate(${playerAngle}deg)`,
              transition: "transform 0.08s",
            }}
          >
            <span style={{ transform: `rotate(${-playerAngle}deg)`, fontSize: 16 }}>🎖️</span>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-1 h-4" style={{ backgroundColor: mapColor }} />
          </div>
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] tracking-wider whitespace-nowrap" style={{ color: mapColor }}>GHOST_X</div>
        </div>

        {/* ── MUZZLE FLASH ── */}
        {muzzleFlash && (
          <div
            className="absolute z-25 rounded-full pointer-events-none"
            style={{
              left: `${vx + Math.cos(playerAngle*Math.PI/180)*3}%`,
              top: `${vy + Math.sin(playerAngle*Math.PI/180)*3}%`,
              width: 20, height: 20,
              transform: "translate(-50%,-50%)",
              backgroundColor: "#ffff00",
              boxShadow: "0 0 20px #ffff00, 0 0 40px #ff8800",
              opacity: 0.9,
            }}
          />
        )}

        {/* ── DAMAGE NUMBERS ── */}
        {damageNumbers.map(dn => (
          <div
            key={dn.id}
            className="absolute pointer-events-none font-black text-sm z-30 animate-bounce"
            style={{
              left: `${dn.x}%`, top: `${dn.y - 3}%`,
              transform: "translate(-50%,-50%)",
              color: dn.val > 60 ? "#f59e0b" : "#ef4444",
              textShadow: "0 0 6px currentColor",
            }}
          >
            -{dn.val}
          </div>
        ))}

        {/* ── CROSSHAIR ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="relative" style={{ width: 40, height: 40 }}>
            <div className={`absolute inset-0 transition-all ${hitMarker ? "scale-150" : "scale-100"}`}>
              {[[-1,0],[1,0],[0,-1],[0,1]].map(([dx,dy], i) => (
                <div key={i} className="absolute bg-white/80" style={{
                  width: dx !== 0 ? 10 : 2,
                  height: dy !== 0 ? 10 : 2,
                  left: "50%", top: "50%",
                  transform: `translate(calc(-50% + ${dx*9}px), calc(-50% + ${dy*9}px))`,
                  backgroundColor: hitMarker ? "#ef4444" : "rgba(255,255,255,0.85)",
                  boxShadow: hitMarker ? "0 0 6px #ef4444" : "none",
                  transition: "all 0.1s",
                }} />
              ))}
              <div className="absolute w-2 h-2 rounded-full bg-white/50" style={{ left:"50%",top:"50%",transform:"translate(-50%,-50%)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── TOP HUD ── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-start justify-between p-3 pointer-events-none">
        {/* HP / Armor */}
        <div className="space-y-1 pointer-events-none">
          <div className="flex items-center gap-2">
            <Icon name="Heart" size={11} className="text-red-400" />
            <div className="w-32 h-2 bg-black/50 border border-game-border/40">
              <div className="h-full bg-red-500 transition-all" style={{ width: `${playerHp}%` }} />
            </div>
            <span className="text-[11px] text-red-400 w-7">{playerHp}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Shield" size={11} className="text-blue-400" />
            <div className="w-32 h-2 bg-black/50 border border-game-border/40">
              <div className="h-full bg-blue-400 transition-all" style={{ width: `${playerArmor}%` }} />
            </div>
            <span className="text-[11px] text-blue-400 w-7">{playerArmor}</span>
          </div>
        </div>

        {/* Center */}
        <div className="text-center pointer-events-none">
          <div className="flex items-center gap-5 justify-center">
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: mapColor }}>{teamScore.us}</div>
              <div className="text-[8px] text-game-muted">НАШ</div>
            </div>
            <div className="px-3 py-1 border border-game-border bg-black/60">
              <div className="text-base font-bold text-white">{formatTime(time)}</div>
              <div className="text-[8px] text-game-muted">{MAP_NAMES[mapId]}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-red-400">{teamScore.them}</div>
              <div className="text-[8px] text-game-muted">ВРАГ</div>
            </div>
          </div>
          <div className="text-[9px] text-game-muted mt-1">
            ☠ ВРАГОВ: <span className="text-red-400 font-bold">{aliveEnemies.length}/{totalEnemies}</span>
            &nbsp;·&nbsp; СОЮЗНИКОВ: <span className="text-green-400 font-bold">{aliveAllies.length}</span>
          </div>
        </div>

        {/* Right */}
        <div className="text-right space-y-1 pointer-events-auto">
          <div className="text-[10px] text-game-muted">K <span className="text-white font-bold">{kills}</span>&nbsp; SCORE <span style={{color:mapColor}} className="font-bold">{score}</span></div>
          <button onClick={(e) => { e.stopPropagation(); stopMusic(); onExit(); }}
            className="text-[9px] text-game-muted hover:text-white flex items-center gap-1 ml-auto">
            <Icon name="LogOut" size={10} /> ВЫХОД
          </button>
        </div>
      </div>

      {/* ── BOTTOM HUD ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-end justify-between p-3 pointer-events-none">
        {/* Minimap */}
        <div className="w-32 h-32 border border-game-border bg-black/80 relative overflow-hidden pointer-events-none">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="absolute text-[7px] top-0.5 left-1 text-game-muted tracking-widest">КАРТА</div>
          {/* Walls on minimap */}
          {walls.map((w,i) => (
            <div key={i} className="absolute bg-game-border/60"
              style={{ left:`${w.x*0.9}%`,top:`${w.y*0.9}%`,width:`${w.w*0.9}%`,height:`${w.h*0.9}%` }} />
          ))}
          {/* Bots on minimap */}
          {bots.map(b => b.alive && (
            <div key={b.id} className="absolute w-1.5 h-1.5 rounded-full"
              style={{ left:`${b.x*0.88}%`,top:`${b.y*0.88}%`,backgroundColor: b.team==="enemy"?"#ef4444":"#22c55e" }} />
          ))}
          {/* Player on minimap */}
          <div className="absolute w-2 h-2 rounded-full z-10 animate-pulse"
            style={{ left:`${vx*0.88}%`,top:`${vy*0.88}%`,backgroundColor: mapColor }} />
        </div>

        {/* Controls hint */}
        <div className="text-center text-[9px] text-game-muted/50 tracking-wider pointer-events-none space-y-0.5">
          <div>WASD — движение &nbsp;·&nbsp; КЛИК / ПРОБЕЛ — огонь</div>
          <div>R — перезарядка &nbsp;·&nbsp; 1/2/3 — оружие</div>
        </div>

        {/* Weapon HUD */}
        <div className="space-y-1.5 pointer-events-auto">
          {weapons.map((w, i) => (
            <button
              key={w.id}
              onClick={e => { e.stopPropagation(); setActiveWeapon(i); }}
              className={`flex items-center gap-2 px-3 py-1.5 border transition-all w-44 text-left ${
                activeWeapon === i ? "border-game-accent bg-game-accent/10" : "border-game-border hover:border-game-muted bg-black/60"
              }`}
            >
              <span className="text-sm">{i===0?"🔫":i===1?"🔫":"💣"}</span>
              <div className="flex-1">
                <div className={`text-[9px] font-bold ${activeWeapon===i?"text-game-accent":"text-game-text"}`}>{w.name}</div>
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from({length:Math.min(10,w.maxAmmo)}).map((_,bi)=>(
                    <div key={bi} className="w-1 h-1.5"
                      style={{backgroundColor: bi<Math.round((w.ammo/w.maxAmmo)*10)?(activeWeapon===i?"var(--game-accent)":"#666"):"#1a1a1a"}} />
                  ))}
                  <span className="text-[8px] text-game-muted ml-1">{w.ammo}/{w.maxAmmo}</span>
                </div>
              </div>
            </button>
          ))}

          {/* Reload bar */}
          {isReloading && (
            <div className="w-44">
              <div className="text-[8px] text-game-muted tracking-wider mb-0.5">ПЕРЕЗАРЯДКА...</div>
              <div className="h-1 bg-game-border">
                <div className="h-full bg-yellow-400 transition-all" style={{ width: `${reloadProgress}%` }} />
              </div>
            </div>
          )}

          {/* Fire button */}
          <button
            onClick={e => { e.stopPropagation(); handleShoot(); }}
            disabled={curWeapon.ammo===0||isReloading}
            className="w-44 py-2.5 font-black text-black text-xs tracking-[0.2em] disabled:opacity-40 transition-all"
            style={{ backgroundColor: curWeapon.ammo>0&&!isReloading ? mapColor : "#333" }}
          >
            <Icon name="Crosshair" size={12} className="inline mr-1" />
            {isReloading ? "ПЕРЕЗАРЯДКА" : curWeapon.ammo===0 ? "ПУСТО [R]" : "ОГОНЬ [ЛКМ]"}
          </button>
        </div>
      </div>

      {/* ── SCOREBOARD ── */}
      {(gameWon || gameLost) && (
        <Scoreboard
          mapId={mapId}
          mode={mode}
          playerKills={kills}
          playerScore={score}
          onMenu={() => { stopMusic(); onExit(); }}
          onRematch={() => { stopMusic(); onExit(); }}
        />
      )}
    </div>
  );
}
