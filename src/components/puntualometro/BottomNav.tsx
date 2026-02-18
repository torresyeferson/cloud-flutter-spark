import { Clock, QrCode, Trophy, User } from "lucide-react";
import { Tab } from "./AppShell";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs = [
  { id: "dashboard" as Tab, label: "Inicio", icon: Clock },
  { id: "checkin" as Tab, label: "Check-In", icon: QrCode },
  { id: "ranking" as Tab, label: "Ranking", icon: Trophy },
  { id: "profile" as Tab, label: "Perfil", icon: User },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card border-t border-border shadow-card z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? "bg-primary-light" : ""}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={`text-[10px] font-${isActive ? "800" : "600"}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
