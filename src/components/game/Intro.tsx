import { useEffect, useState } from "react";

interface Props {
  onDone: () => void;
}

const BOOT_LINES = [
  "ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ...",
  "ЗАГРУЗКА ТАКТИЧЕСКОГО МОДУЛЯ v2.4.1",
  "ПРОВЕРКА БЕЗОПАСНОСТИ... OK",
  "ЗАГРУЗКА ПРОФИЛЯ GHOST_X... OK",
  "ПОДКЛЮЧЕНИЕ К СЕРВЕРАМ... OK",
  "СИНХРОНИЗАЦИЯ ДАННЫХ КАРТ... OK",
  "СИСТЕМА ГОТОВА.",
];

export default function Intro({ onDone }: Props) {
  const [phase, setPhase] = useState<"boot" | "logo" | "fade">("boot");
  const [visibleLines, setVisibleLines] = useState(0);
  const [logoVisible, setLogoVisible] = useState(false);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const [pressVisible, setPressVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= BOOT_LINES.length) {
        clearInterval(interval);
        setTimeout(() => setPhase("logo"), 400);
      }
    }, 280);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase !== "logo") return;
    setTimeout(() => setLogoVisible(true), 100);
    setTimeout(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 300);
    }, 600);
    setTimeout(() => setTaglineVisible(true), 900);
    setTimeout(() => setPressVisible(true), 1600);
  }, [phase]);

  const handleStart = () => {
    setFading(true);
    setTimeout(onDone, 700);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${fading ? "opacity-0" : "opacity-100"}`}
      onClick={pressVisible ? handleStart : undefined}
      style={{ cursor: pressVisible ? "pointer" : "default" }}
    >
      {/* Scanlines */}
      <div className="scanlines pointer-events-none" />

      {/* Grid bg */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      {/* Corner brackets */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-game-accent/30" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-game-accent/30" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-game-accent/30" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-game-accent/30" />

      {/* Boot phase */}
      {phase === "boot" && (
        <div className="font-mono-game text-[11px] text-green-400 space-y-1 w-80">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <div
              key={i}
              className="flex items-center gap-2"
              style={{ animation: "fadeInLine 0.2s ease-out" }}
            >
              <span className="text-green-600">▶</span>
              <span>{line}</span>
              {i === visibleLines - 1 && (
                <span className="inline-block w-2 h-3 bg-green-400 animate-pulse ml-1" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Logo phase */}
      {phase === "logo" && (
        <div className="flex flex-col items-center gap-8">
          {/* Main logo */}
          <div
            className={`text-center transition-all duration-700 ${logoVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {/* Diamond emblem */}
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24">
                <div
                  className={`absolute inset-0 border-4 border-game-accent rotate-45 transition-all duration-500 ${logoVisible ? "scale-100" : "scale-0"}`}
                  style={{ boxShadow: "0 0 40px rgba(0,212,255,0.4), inset 0 0 20px rgba(0,212,255,0.1)" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`text-5xl transition-all duration-500 delay-200 ${logoVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
                    style={{ filter: "drop-shadow(0 0 10px rgba(0,212,255,0.8))" }}
                  >
                    ◈
                  </div>
                </div>
                {/* Orbit rings */}
                <div className="absolute inset-[-8px] border border-game-accent/20 rotate-45" style={{ animation: "spin 8s linear infinite" }} />
                <div className="absolute inset-[-16px] border border-game-accent/10 rotate-45" style={{ animation: "spin 12s linear infinite reverse" }} />
              </div>
            </div>

            {/* Title */}
            <div
              className={`font-orbitron text-7xl font-black tracking-[0.2em] transition-all duration-500 delay-100 ${glitch ? "glitch-text" : ""}`}
              style={{
                color: "var(--game-accent)",
                textShadow: "0 0 60px rgba(0,212,255,0.5), 0 0 120px rgba(0,212,255,0.2)",
              }}
            >
              TACTICAL
            </div>
            <div
              className="font-orbitron text-7xl font-black tracking-[0.2em]"
              style={{
                color: "#ffffff",
                textShadow: "0 0 40px rgba(255,255,255,0.15)",
              }}
            >
              OPS
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mt-4 justify-center">
              <div
                className="h-px transition-all duration-700 delay-300"
                style={{ width: logoVisible ? "120px" : "0px", backgroundColor: "var(--game-accent)", opacity: 0.5 }}
              />
              <div className="font-mono-game text-[10px] text-game-muted tracking-[0.5em]">
                CLASSIFIED
              </div>
              <div
                className="h-px transition-all duration-700 delay-300"
                style={{ width: logoVisible ? "120px" : "0px", backgroundColor: "var(--game-accent)", opacity: 0.5 }}
              />
            </div>
          </div>

          {/* Tagline */}
          <div
            className={`text-center transition-all duration-500 ${taglineVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="font-mono-game text-xs text-game-muted tracking-[0.4em]">
              ТАКТИКА. СТРАТЕГИЯ. ПОБЕДА.
            </div>
          </div>

          {/* Version badges */}
          <div
            className={`flex gap-4 transition-all duration-500 delay-100 ${taglineVisible ? "opacity-100" : "opacity-0"}`}
          >
            {["v2.4.1", "ALPHA", "BUILD #447"].map(badge => (
              <div key={badge} className="font-mono-game text-[9px] px-3 py-1 border border-game-border text-game-muted tracking-widest">
                {badge}
              </div>
            ))}
          </div>

          {/* Press any key */}
          <div
            className={`transition-all duration-500 ${pressVisible ? "opacity-100" : "opacity-0"}`}
          >
            <div
              className="font-orbitron text-xs text-game-accent tracking-[0.5em] text-center"
              style={{ animation: pressVisible ? "blink 1.4s ease-in-out infinite" : "none" }}
            >
              НАЖМИТЕ ДЛЯ НАЧАЛА
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInLine {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(45deg); }
          to { transform: rotate(405deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        .glitch-text {
          animation: glitch 0.3s steps(2) forwards;
        }
        @keyframes glitch {
          0% { text-shadow: 0 0 60px rgba(0,212,255,0.5), 3px 0 #ff003c, -3px 0 #00ffff; transform: skewX(-2deg); }
          33% { text-shadow: 0 0 60px rgba(0,212,255,0.5), -3px 0 #ff003c, 3px 0 #00ffff; transform: skewX(2deg); }
          66% { text-shadow: 0 0 60px rgba(0,212,255,0.5), 2px 0 #ff003c, -2px 0 #00ffff; transform: skewX(-1deg); }
          100% { text-shadow: 0 0 60px rgba(0,212,255,0.5); transform: skewX(0); }
        }
      `}</style>
    </div>
  );
}
