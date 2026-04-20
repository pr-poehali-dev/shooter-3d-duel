import { useState } from "react";
import Icon from "@/components/ui/icon";

const TABS = [
  { id: "controls", label: "УПРАВЛЕНИЕ", icon: "Gamepad2" },
  { id: "graphics", label: "ГРАФИКА", icon: "Monitor" },
  { id: "audio", label: "ЗВУК", icon: "Volume2" },
  { id: "video", label: "ВИДЕОВЫЗОВ", icon: "Video" },
];

const KEY_BINDINGS = [
  { action: "Движение вперёд", key: "W", category: "ДВИЖЕНИЕ" },
  { action: "Движение назад", key: "S", category: "ДВИЖЕНИЕ" },
  { action: "Движение влево", key: "A", category: "ДВИЖЕНИЕ" },
  { action: "Движение вправо", key: "D", category: "ДВИЖЕНИЕ" },
  { action: "Прыжок", key: "ПРОБЕЛ", category: "ДВИЖЕНИЕ" },
  { action: "Присесть", key: "C", category: "ДВИЖЕНИЕ" },
  { action: "Бег", key: "SHIFT", category: "ДВИЖЕНИЕ" },
  { action: "Огонь", key: "ЛКМ", category: "БОБОЙ" },
  { action: "Прицеливание", key: "ПКМ", category: "БОЕВОЙ" },
  { action: "Перезарядка", key: "R", category: "БОЕВОЙ" },
  { action: "Нож", key: "3", category: "БОЕВОЙ" },
  { action: "Граната", key: "G", category: "БОЕВОЙ" },
  { action: "Инвентарь", key: "I", category: "ИНТЕРФЕЙС" },
  { action: "Карта", key: "M", category: "ИНТЕРФЕЙС" },
  { action: "Чат команды", key: "T", category: "ИНТЕРФЕЙС" },
];

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  color?: string;
  onChange: (v: number) => void;
}

function Slider({ label, value, min = 0, max = 100, unit = "%", color = "var(--game-accent)", onChange }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px]">
        <span className="text-game-muted tracking-wider">{label}</span>
        <span className="font-bold" style={{ color }}>{value}{unit}</span>
      </div>
      <div className="relative h-2 bg-game-border cursor-pointer" onClick={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.round(((e.clientX - rect.left) / rect.width) * (max - min) + min);
        onChange(Math.max(min, Math.min(max, pct)));
      }}>
        <div className="absolute h-full transition-all" style={{ width: `${((value - min) / (max - min)) * 100}%`, backgroundColor: color }} />
        <div
          className="absolute w-3 h-3 border-2 top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all"
          style={{ left: `${((value - min) / (max - min)) * 100}%`, borderColor: color, backgroundColor: "var(--game-bg)" }}
        />
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-game-muted tracking-wider">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 transition-all border ${value ? "border-game-accent" : "border-game-border"}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 transition-all`}
          style={{ left: value ? "calc(100% - 1.125rem)" : "0.125rem", backgroundColor: value ? "var(--game-accent)" : "var(--game-muted)" }}
        />
      </button>
    </div>
  );
}

interface Props {
  onBack: () => void;
}

export default function Settings({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState("controls");
  const [rebinding, setRebinding] = useState<string | null>(null);

  const [controls, setControls] = useState({
    sensitivity: 45,
    aimSensitivity: 30,
    invertY: false,
    vibration: true,
    autoReload: false,
    adsToggle: true,
  });

  const [graphics, setGraphics] = useState({
    resolution: "1920×1080",
    quality: "ВЫСОКОЕ",
    fov: 90,
    brightness: 55,
    shadows: true,
    motionBlur: false,
    vsync: true,
    antialiasing: true,
    renderDistance: 80,
  });

  const [audio, setAudio] = useState({
    master: 80,
    music: 40,
    sfx: 90,
    voice: 75,
    ambient: 60,
    mute: false,
    spatialAudio: true,
    voiceActivation: false,
  });

  const [video, setVideo] = useState({
    enabled: true,
    camera: true,
    microphone: true,
    noise: true,
    videoQuality: "HD",
    overlay: true,
  });

  const RESOLUTIONS = ["1280×720", "1920×1080", "2560×1440", "3840×2160"];
  const QUALITIES = ["НИЗКОЕ", "СРЕДНЕЕ", "ВЫСОКОЕ", "УЛЬТРА"];
  const VIDEO_QUALITIES = ["SD", "HD", "FULL HD"];

  return (
    <div className="min-h-screen bg-game-bg text-game-text font-orbitron overflow-hidden relative">
      <div className="scanlines pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-game-border">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="game-btn-secondary flex items-center gap-2 text-xs px-3 py-2">
            <Icon name="ArrowLeft" size={14} />
          </button>
          <div>
            <div className="text-game-accent text-xs tracking-[0.4em] font-bold">НАСТРОЙКИ СИСТЕМЫ</div>
            <div className="text-game-muted text-[10px] tracking-widest">TACTICAL OPS // CONFIG</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="game-btn-secondary text-xs px-4 py-2 tracking-wider">
            <Icon name="RotateCcw" size={12} className="inline mr-2" />
            СБРОС
          </button>
          <button className="game-btn text-xs px-6 py-2 tracking-wider">
            <Icon name="Save" size={12} className="inline mr-2" />
            СОХРАНИТЬ
          </button>
        </div>
      </div>

      <div className="relative z-10 flex h-[calc(100vh-73px)]">
        {/* Sidebar tabs */}
        <div className="w-52 border-r border-game-border flex flex-col">
          <div className="flex-1 p-3 space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 border flex items-center gap-3 transition-all text-xs tracking-wider ${
                  activeTab === tab.id
                    ? "border-game-accent bg-game-accent/10 text-game-accent"
                    : "border-transparent text-game-muted hover:text-game-text hover:border-game-border"
                }`}
              >
                <Icon name={tab.icon} fallback="Settings" size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* CONTROLS */}
          {activeTab === "controls" && (
            <div className="space-y-8 max-w-2xl">
              <div>
                <div className="text-[10px] text-game-muted tracking-[0.4em] mb-4">ЧУВСТВИТЕЛЬНОСТЬ МЫШИ</div>
                <div className="space-y-5">
                  <Slider label="ОБЩАЯ ЧУВСТВИТЕЛЬНОСТЬ" value={controls.sensitivity} onChange={v => setControls(p => ({...p, sensitivity: v}))} />
                  <Slider label="ПРИЦЕЛИВАНИЕ (ADS)" value={controls.aimSensitivity} onChange={v => setControls(p => ({...p, aimSensitivity: v}))} color="#f59e0b" />
                </div>
              </div>

              <div>
                <div className="text-[10px] text-game-muted tracking-[0.4em] mb-4">ПАРАМЕТРЫ</div>
                <div className="space-y-3">
                  <Toggle label="ИНВЕРСИЯ ОСИ Y" value={controls.invertY} onChange={v => setControls(p => ({...p, invertY: v}))} />
                  <Toggle label="ВИБРАЦИЯ ГЕЙМПАДА" value={controls.vibration} onChange={v => setControls(p => ({...p, vibration: v}))} />
                  <Toggle label="АВТО-ПЕРЕЗАРЯДКА" value={controls.autoReload} onChange={v => setControls(p => ({...p, autoReload: v}))} />
                  <Toggle label="ПРИЦЕЛ — ПЕРЕКЛЮЧЕНИЕ" value={controls.adsToggle} onChange={v => setControls(p => ({...p, adsToggle: v}))} />
                </div>
              </div>

              <div>
                <div className="text-[10px] text-game-muted tracking-[0.4em] mb-4">ПРИВЯЗКА КЛАВИШ</div>
                <div className="space-y-1">
                  {["ДВИЖЕНИЕ", "БОЕВОЙ", "ИНТЕРФЕЙС"].map(cat => (
                    <div key={cat}>
                      <div className="text-[9px] text-game-muted/50 tracking-[0.3em] py-2 mt-3">{cat}</div>
                      {KEY_BINDINGS.filter(k => k.category === cat).map(bind => (
                        <div key={bind.action} className={`flex items-center justify-between px-3 py-2 border-b border-game-border/50 hover:bg-game-panel transition-all`}>
                          <span className="text-[11px] text-game-muted">{bind.action}</span>
                          <button
                            onClick={() => setRebinding(rebinding === bind.action ? null : bind.action)}
                            className={`px-3 py-1 text-[10px] font-bold tracking-widest border transition-all min-w-[60px] text-center ${
                              rebinding === bind.action
                                ? "border-game-accent text-game-accent animate-pulse"
                                : "border-game-border text-game-text hover:border-game-muted"
                            }`}
                          >
                            {rebinding === bind.action ? "..." : bind.key}
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GRAPHICS */}
          {activeTab === "graphics" && (
            <div className="space-y-8 max-w-2xl">
              <div>
                <div className="text-[10px] text-game-muted tracking-[0.4em] mb-4">РАЗРЕШЕНИЕ И КАЧЕСТВО</div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-[10px] text-game-muted tracking-wider mb-2">РАЗРЕШЕНИЕ</div>
                    <div className="grid grid-cols-2 gap-1">
                      {RESOLUTIONS.map(r => (
                        <button key={r} onClick={() => setGraphics(p => ({...p, resolution: r}))}
                          className={`py-2 text-[10px] border tracking-wider transition-all ${graphics.resolution === r ? "border-game-accent text-game-accent bg-game-accent/10" : "border-game-border text-game-muted hover:border-game-muted"}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-game-muted tracking-wider mb-2">КАЧЕСТВО</div>
                    <div className="grid grid-cols-2 gap-1">
                      {QUALITIES.map(q => (
                        <button key={q} onClick={() => setGraphics(p => ({...p, quality: q}))}
                          className={`py-2 text-[10px] border tracking-wider transition-all ${graphics.quality === q ? "border-game-accent text-game-accent bg-game-accent/10" : "border-game-border text-game-muted hover:border-game-muted"}`}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  <Slider label="ПОЛЕ ЗРЕНИЯ (FOV)" value={graphics.fov} min={60} max={120} unit="°" color="#a855f7" onChange={v => setGraphics(p => ({...p, fov: v}))} />
                  <Slider label="ЯРКОСТЬ" value={graphics.brightness} onChange={v => setGraphics(p => ({...p, brightness: v}))} color="#f59e0b" />
                  <Slider label="ДАЛЬНОСТЬ ПРОРИСОВКИ" value={graphics.renderDistance} onChange={v => setGraphics(p => ({...p, renderDistance: v}))} color="#39d353" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-game-muted tracking-[0.4em] mb-4">ЭФФЕКТЫ</div>
                <div className="space-y-3">
                  <Toggle label="ТЕНИ" value={graphics.shadows} onChange={v => setGraphics(p => ({...p, shadows: v}))} />
                  <Toggle label="РАЗМЫТИЕ ДВИЖЕНИЯ" value={graphics.motionBlur} onChange={v => setGraphics(p => ({...p, motionBlur: v}))} />
                  <Toggle label="ВЕРТИКАЛЬНАЯ СИНХРОНИЗАЦИЯ" value={graphics.vsync} onChange={v => setGraphics(p => ({...p, vsync: v}))} />
                  <Toggle label="СГЛАЖИВАНИЕ (MSAA)" value={graphics.antialiasing} onChange={v => setGraphics(p => ({...p, antialiasing: v}))} />
                </div>
              </div>
            </div>
          )}

          {/* AUDIO */}
          {activeTab === "audio" && (
            <div className="space-y-8 max-w-2xl">
              <div>
                <div className="text-[10px] text-game-muted tracking-[0.4em] mb-4">УРОВНИ ГРОМКОСТИ</div>
                <div className="space-y-5">
                  <Slider label="ОБЩАЯ ГРОМКОСТЬ" value={audio.master} onChange={v => setAudio(p => ({...p, master: v}))} />
                  <Slider label="МУЗЫКА" value={audio.music} onChange={v => setAudio(p => ({...p, music: v}))} color="#a855f7" />
                  <Slider label="ЗВУКОВЫЕ ЭФФЕКТЫ" value={audio.sfx} onChange={v => setAudio(p => ({...p, sfx: v}))} color="#f59e0b" />
                  <Slider label="ГОЛОС В ИГРЕ" value={audio.voice} onChange={v => setAudio(p => ({...p, voice: v}))} color="#39d353" />
                  <Slider label="ОКРУЖЕНИЕ" value={audio.ambient} onChange={v => setAudio(p => ({...p, ambient: v}))} color="#ff6b35" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-game-muted tracking-[0.4em] mb-4">ПАРАМЕТРЫ ЗВУКА</div>
                <div className="space-y-3">
                  <Toggle label="ОТКЛЮЧИТЬ ЗВУК" value={audio.mute} onChange={v => setAudio(p => ({...p, mute: v}))} />
                  <Toggle label="ОБЪЁМНЫЙ ЗВУК (3D)" value={audio.spatialAudio} onChange={v => setAudio(p => ({...p, spatialAudio: v}))} />
                  <Toggle label="АКТИВАЦИЯ ГОЛОСОМ" value={audio.voiceActivation} onChange={v => setAudio(p => ({...p, voiceActivation: v}))} />
                </div>
              </div>
            </div>
          )}

          {/* VIDEO CALL */}
          {activeTab === "video" && (
            <div className="space-y-8 max-w-2xl">
              <div className={`border p-6 transition-all ${video.enabled ? "border-game-accent/40 bg-game-accent/5" : "border-game-border"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 border-2 flex items-center justify-center ${video.enabled ? "border-game-accent" : "border-game-border"}`}>
                    <Icon name="Video" size={20} className={video.enabled ? "text-game-accent" : "text-game-muted"} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold tracking-wider mb-1">ВИДЕОВЫЗОВ В БОЮ</div>
                    <div className="text-[11px] text-game-muted font-sans leading-relaxed">
                      Видеовызов позволяет общаться с командой в реальном времени прямо во время боя. Оверлей отображается поверх игры.
                    </div>
                  </div>
                  <Toggle label="" value={video.enabled} onChange={v => setVideo(p => ({...p, enabled: v}))} />
                </div>
              </div>

              {video.enabled && (
                <>
                  <div>
                    <div className="text-[10px] text-game-muted tracking-[0.4em] mb-4">УСТРОЙСТВА</div>
                    <div className="space-y-3">
                      <Toggle label="КАМЕРА" value={video.camera} onChange={v => setVideo(p => ({...p, camera: v}))} />
                      <Toggle label="МИКРОФОН" value={video.microphone} onChange={v => setVideo(p => ({...p, microphone: v}))} />
                      <Toggle label="ШУМОПОДАВЛЕНИЕ" value={video.noise} onChange={v => setVideo(p => ({...p, noise: v}))} />
                      <Toggle label="ОВЕРЛЕЙ НА ЭКРАНЕ" value={video.overlay} onChange={v => setVideo(p => ({...p, overlay: v}))} />
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-game-muted tracking-[0.4em] mb-4">КАЧЕСТВО ВИДЕО</div>
                    <div className="flex gap-2">
                      {VIDEO_QUALITIES.map(q => (
                        <button key={q} onClick={() => setVideo(p => ({...p, videoQuality: q}))}
                          className={`px-6 py-2 text-xs border tracking-wider transition-all ${video.videoQuality === q ? "border-game-accent text-game-accent bg-game-accent/10" : "border-game-border text-game-muted hover:border-game-muted"}`}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border border-game-border p-4">
                    <div className="text-[10px] text-game-muted tracking-[0.3em] mb-3">ПРЕДПРОСМОТР КАМЕРЫ</div>
                    <div className="w-48 h-36 bg-black/60 border border-game-border/50 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 grid-bg opacity-20" />
                      <div className="text-center">
                        <div className="text-3xl mb-2">👤</div>
                        <div className="text-[9px] text-game-muted tracking-wider">КАМЕРА АКТИВНА</div>
                      </div>
                      <div className="absolute top-1 right-1 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[8px] text-red-400">REC</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
