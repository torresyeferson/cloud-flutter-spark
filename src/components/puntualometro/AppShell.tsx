import { useState } from "react";
import Dashboard from "./Dashboard";
import CheckIn from "./CheckIn";
import Ranking from "./Ranking";
import Profile from "./Profile";
import BottomNav from "./BottomNav";

export type Tab = "dashboard" | "checkin" | "ranking" | "profile";

const AppShell = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const renderScreen = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard />;
      case "checkin": return <CheckIn />;
      case "ranking": return <Ranking />;
      case "profile": return <Profile />;
    }
  };

  return (
    <div className="mobile-frame relative bg-background flex flex-col overflow-hidden" style={{ minHeight: "100dvh" }}>
      <div className="flex-1 overflow-y-auto pb-24">
        {renderScreen()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default AppShell;
