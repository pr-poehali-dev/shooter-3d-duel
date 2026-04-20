import { useState } from "react";
import Icon from "@/components/ui/icon";

const WEAPONS = [
  { id: "ak97", name: "AK-97", type: "ШТУРМОВАЯ", rarity: "РЕДКОЕ", dmg: 42, range: 70, fire: 85, accuracy: 65, ammo: "7.62×39", icon: "🔫", equipped: true, kills: 847 },
  { id: "m4a1", name: "M4A1-S", type: "ШТУРМОВАЯ", rarity: "ЭПИЧЕСКОЕ", dmg: 38, range: 80, fire: 78, accuracy: 88, ammo: "5.56 NATO", icon: "🔫", equipped: false, kills: 312 },
  { id: "awp", name: "AWP ARCTIC", type: "СНАЙПЕРСКАЯ", rarity: "ЛЕГЕНДАРНОЕ", dmg: 115, range: 99, fire: 22, accuracy: 96, ammo: ".338 Lapua", icon: "🎯", equipped: false, kills: 203 },
  { id: "mp5", name: "MP5-SD", type: "ПИСТОЛЕТ-ПУЛЕМЁТ", rarity: "ОБЫЧНОЕ", dmg: 27, range: 45, fire: 95, accuracy: 72, ammo: "9mm", icon: "🔫", equipped: false, kills: 156 },
  { id: "deagle", name: "DESERT EAGLE", type: "ПИСТОЛЕТ", rarity: "РЕДКОЕ", dmg: 58, range: 55, fire: 55, accuracy: 74, ammo: ".50 AE", icon: "🔫", equipped: true, kills: 89 },
  { id: "rpg", name: "RPG-9", type: "ТЯЖЁЛОЕ", rarity: "ЛЕГЕНДАРНОЕ", dmg: 250, range: 60, fire: 15, accuracy: 55, ammo: "РПГ", icon: "💥", equipped: false, kills: 44 },
];

const EQUIPMENT = [
  { id: "vest", name: "БРОНЕЖИЛЕТ III", type: "БРОНЯ", rarity: "ЭПИЧЕСКОЕ", icon: "🛡️", desc: "Защита: 85%. Вес: 8.2 кг", equipped: true },
  { id: "helmet", name: "ШЛЕМ OPS-X", type: "ШЛЕМ", rarity: "РЕДКОЕ", icon: "⛑️", desc: "Защита головы: 70%. Вес: 1.4 кг", equipped: true },
  { id: "grenade", name: "ГРАНАТА Ф-1", type: "ГРАНАТА", rarity: "ОБЫЧНОЕ", icon: "💣", desc: "Урон: 120. Радиус: 5м", equipped: false },
  { id: "smoke", name: "ДЫМОВАЯ ШАШКА", type: "ТАКТИКА", rarity: "ОБЫЧНОЕ", icon: "💨", desc: "Дальность: 30м. Длит.: 15с", equipped: false },
  { id: "medkit", name: "АПТЕЧКА FIELD", type: "МЕД", rarity: "РЕДКОЕ", icon: "🩹", desc: "Восстанавливает 80 HP", equipped: true },
  { id: "drone", name: "РАЗВЕДЧИК UAV", type: "ДРОН", rarity: "ЭПИЧЕСКОЕ", icon: "🚁", desc: "Раскрывает карту на 30с", equipped: false },
];

const RARITY_COLORS: Record<string, string> = {
  "ОБЫЧНОЕ": "#9ca3af",
  "РЕДКОЕ": "#3b82f6",
  "ЭПИЧЕСКОЕ": "#a855f7",
  "ЛЕГЕНДАРНОЕ": "#f59e0b",
};

const TABS = ["ОРУЖИЕ", "СНАРЯЖЕНИЕ", "СТАТИСТИКА"];

interface Props {
  onBack: () => void;
}

export default function Inventory({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedWeapon, setSelectedWeapon] = useState(WEAPONS[0]);
  const [weapons, setWeapons] = useState(WEAPONS);
  const [equipment, setEquipment] = useState(EQUIPMENT);

  const toggleEquipWeapon = (id: string) => {
    setWeapons(prev => prev.map(w => ({
      ...w,
      equipped: w.id === id ? !w.equipped : (w.type === prev.find(x => x.id === id)?.type ? false : w.equipped)
    })));
  };

  const toggleEquipEquip = (id: string) => {
    setEquipment(prev => prev.map(e => e.id === id ? { ...e, equipped: !e.equipped } : e));
  };

  const StatBar = ({ label, value, color = "var(--game-accent)" }: { label: string; value: number; color?: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-game-muted tracking-wider">{label}</span>
        <span className="font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 bg-game-border">
        <div className="h-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );

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
            <div className="text-game-accent text-xs tracking-[0.4em] font-bold">АРСЕНАЛ ОПЕРАТИВНИКА</div>
            <div className="text-game-muted text-[10px] tracking-widest">GHOST_X // ЭЛИТА III</div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[10px]">
          <div className="text-center">
            <div className="text-game-accent font-bold text-lg">1,247</div>
            <div className="text-game-muted tracking-wider">МОНЕТ</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-lg">3</div>
            <div className="text-game-muted tracking-wider">КРЕДИТЫ</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-xs tracking-wider transition-all ${
                activeTab === i
                  ? "bg-game-accent/10 border border-game-accent text-game-accent"
                  : "border border-game-border text-game-muted hover:border-game-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex h-[calc(100vh-73px)]">
        {/* === WEAPONS TAB === */}
        {activeTab === 0 && (
          <>
            {/* Weapon list */}
            <div className="w-80 border-r border-game-border flex flex-col">
              <div className="px-4 py-3 border-b border-game-border text-[10px] text-game-muted tracking-[0.3em]">
                ОРУЖЕЙНЫЙ ШКАФ — {weapons.filter(w => w.equipped).length}/4 СНАРЯЖЕНО
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {weapons.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWeapon(w)}
                    className={`w-full text-left p-3 border transition-all relative ${
                      selectedWeapon.id === w.id
                        ? "border-game-accent bg-game-accent/5"
                        : "border-game-border hover:border-game-muted"
                    }`}
                  >
                    {w.equipped && (
                      <div className="absolute top-1 right-1 text-[8px] px-1 py-0.5 bg-green-500/20 border border-green-500/50 text-green-400 tracking-wider">
                        В СЛОТЕ
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{w.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold tracking-wider truncate">{w.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-game-muted">{w.type}</span>
                          <span className="text-[9px] font-bold" style={{ color: RARITY_COLORS[w.rarity] }}>◆ {w.rarity}</span>
                        </div>
                        <div className="flex gap-3 mt-1 text-[9px] text-game-muted">
                          <span>⚡{w.dmg} УРН</span>
                          <span>🎯{w.accuracy}% ТОЧ</span>
                          <span>☠ {w.kills}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Weapon detail */}
            <div className="flex-1 p-8 flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] text-game-muted tracking-[0.4em] mb-1">ДЕТАЛИ ОРУЖИЯ</div>
                  <div className="text-3xl font-black tracking-widest text-game-accent">{selectedWeapon.name}</div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-game-muted tracking-wider">{selectedWeapon.type}</span>
                    <span className="text-xs font-bold tracking-wider" style={{ color: RARITY_COLORS[selectedWeapon.rarity] }}>
                      ◆ {selectedWeapon.rarity}
                    </span>
                    <span className="text-xs text-game-muted">{selectedWeapon.ammo}</span>
                  </div>
                </div>
                <div className="text-8xl opacity-60">{selectedWeapon.icon}</div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="text-[10px] text-game-muted tracking-[0.3em] mb-3">ХАРАКТЕРИСТИКИ</div>
                  <StatBar label="УРОН" value={selectedWeapon.dmg} color="#ef4444" />
                  <StatBar label="ДАЛЬНОСТЬ" value={selectedWeapon.range} color={RARITY_COLORS[selectedWeapon.rarity]} />
                  <StatBar label="СКОРОСТРЕЛЬНОСТЬ" value={selectedWeapon.fire} color="#f59e0b" />
                  <StatBar label="ТОЧНОСТЬ" value={selectedWeapon.accuracy} color="var(--game-accent)" />
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] text-game-muted tracking-[0.3em] mb-3">БОЕВАЯ СТАТИСТИКА</div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "УБИЙСТВ", value: selectedWeapon.kills, color: "#ef4444" },
                      { label: "УРОН/МИН", value: Math.round(selectedWeapon.dmg * selectedWeapon.fire / 10), color: "#f59e0b" },
                      { label: "ХЕДШОТЫ", value: Math.round(selectedWeapon.kills * 0.3), color: "var(--game-accent)" },
                      { label: "ВЫСТРЕЛов/РАУ", value: selectedWeapon.type === "СНАЙПЕРСКАЯ" ? 1 : 28, color: "#a855f7" },
                    ].map(stat => (
                      <div key={stat.label} className="border border-game-border p-3">
                        <div className="text-[10px] text-game-muted tracking-wider">{stat.label}</div>
                        <div className="text-xl font-black mt-1" style={{ color: stat.color }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => toggleEquipWeapon(selectedWeapon.id)}
                  className={`flex-1 py-3 text-xs font-bold tracking-[0.3em] transition-all border ${
                    weapons.find(w => w.id === selectedWeapon.id)?.equipped
                      ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
                      : "bg-game-accent text-black border-transparent hover:bg-game-accent/90"
                  }`}
                >
                  {weapons.find(w => w.id === selectedWeapon.id)?.equipped ? "СНЯТЬ" : "ЭКИПИРОВАТЬ"}
                </button>
                <button className="px-6 py-3 border border-game-border text-game-muted text-xs tracking-wider hover:border-game-muted transition-all">
                  <Icon name="Wrench" size={14} className="inline mr-2" />
                  УЛУЧШИТЬ
                </button>
              </div>
            </div>
          </>
        )}

        {/* === EQUIPMENT TAB === */}
        {activeTab === 1 && (
          <div className="flex-1 p-8">
            <div className="text-[10px] text-game-muted tracking-[0.3em] mb-6">ТАКТИЧЕСКОЕ СНАРЯЖЕНИЕ</div>
            <div className="grid grid-cols-3 gap-4">
              {equipment.map((item) => (
                <div
                  key={item.id}
                  className={`border p-5 transition-all cursor-pointer relative ${
                    item.equipped ? "border-game-accent bg-game-accent/5" : "border-game-border hover:border-game-muted"
                  }`}
                  onClick={() => toggleEquipEquip(item.id)}
                >
                  {item.equipped && (
                    <div className="absolute top-2 right-2 text-[8px] px-1.5 py-0.5 bg-green-500/20 border border-green-500/50 text-green-400 tracking-wider">
                      НАДЕТ
                    </div>
                  )}
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <div className="text-xs font-bold tracking-wider mb-1">{item.name}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] text-game-muted">{item.type}</span>
                    <span className="text-[9px] font-bold" style={{ color: RARITY_COLORS[item.rarity] }}>◆ {item.rarity}</span>
                  </div>
                  <div className="text-[10px] text-game-muted font-sans leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === STATS TAB === */}
        {activeTab === 2 && (
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="text-[10px] text-game-muted tracking-[0.3em] mb-6">БОЕВЫЕ ДОСТИЖЕНИЯ</div>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: "ВСЕГО УБИЙСТВ", value: "12,847", icon: "Crosshair", color: "#ef4444" },
                { label: "ЧАСОВ В БОЮ", value: "284", icon: "Clock", color: "var(--game-accent)" },
                { label: "ПОБЕД", value: "876", icon: "Trophy", color: "#f59e0b" },
                { label: "K/D RATIO", value: "3.47", icon: "TrendingUp", color: "#a855f7" },
                { label: "ТОЧНОСТЬ", value: "68%", icon: "Target", color: "#39d353" },
                { label: "ХЕДШОТОВ", value: "4,122", icon: "Skull", color: "#ff6b35" },
                { label: "МВП В РАУНДЕ", value: "234", icon: "Star", color: "#f59e0b" },
                { label: "РАНГ", value: "ЭЛИТА III", icon: "Shield", color: "var(--game-accent)" },
              ].map(stat => (
                <div key={stat.label} className="border border-game-border p-4 bg-game-panel">
                  <Icon name={stat.icon} fallback="Star" size={20} style={{ color: stat.color }} />
                  <div className="text-2xl font-black mt-2" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-[9px] text-game-muted tracking-wider mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-game-muted tracking-[0.3em] mb-4">ЛУЧШИЕ КАРТЫ</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { map: "ГОРОДСКИЕ РУИНЫ", kills: 4820, wins: 312, color: "#ff6b35" },
                { map: "ДЖУНГЛИ СМЕРТИ", kills: 3100, wins: 241, color: "#39d353" },
                { map: "АРКТИЧЕСКАЯ БАЗА", kills: 2900, wins: 198, color: "#58c4f5" },
                { map: "ПУСТЫННАЯ КРЕПОСТЬ", kills: 2027, wins: 125, color: "#f5c842" },
              ].map(m => (
                <div key={m.map} className="border border-game-border p-4 flex items-center gap-4">
                  <div className="w-2 h-12 rounded-sm" style={{ backgroundColor: m.color }} />
                  <div className="flex-1">
                    <div className="text-xs font-bold tracking-wider" style={{ color: m.color }}>{m.map}</div>
                    <div className="flex gap-4 mt-1 text-[10px] text-game-muted">
                      <span>☠ {m.kills} убийств</span>
                      <span>🏆 {m.wins} побед</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}