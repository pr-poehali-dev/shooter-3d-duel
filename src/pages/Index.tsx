import { useState } from "react";
import MainMenu from "@/components/game/MainMenu";
import BattleScene from "@/components/game/BattleScene";
import Inventory from "@/components/game/Inventory";
import Settings from "@/components/game/Settings";
import Intro from "@/components/game/Intro";

type Screen = "intro" | "menu" | "battle" | "inventory" | "settings";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("intro");
  const [battleMap, setBattleMap] = useState("urban");
  const [battleMode, setBattleMode] = useState("tdm");
  const [prevScreen, setPrevScreen] = useState<Screen>("menu");

  const goTo = (s: Screen) => {
    setPrevScreen(screen);
    setScreen(s);
  };

  const handlePlay = (map: string, mode: string) => {
    setBattleMap(map);
    setBattleMode(mode);
    setScreen("battle");
  };

  if (screen === "intro") {
    return <Intro onDone={() => setScreen("menu")} />;
  }

  if (screen === "battle") {
    return (
      <BattleScene
        mapId={battleMap}
        mode={battleMode}
        onExit={() => setScreen("menu")}
        onInventory={() => goTo("inventory")}
      />
    );
  }

  if (screen === "inventory") {
    return <Inventory onBack={() => setScreen(prevScreen === "battle" ? "menu" : "menu")} />;
  }

  if (screen === "settings") {
    return <Settings onBack={() => setScreen("menu")} />;
  }

  return (
    <MainMenu
      onPlay={handlePlay}
      onSettings={() => goTo("settings")}
      onInventory={() => goTo("inventory")}
    />
  );
};

export default Index;