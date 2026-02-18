import { Trophy, Medal, TrendingUp } from "lucide-react";

const mockRanking = [
  { pos: 1, name: "Carlos Mendoza", pct: 100, streak: 30, pts: 2480, level: "Excelencia FUNCAJE" },
  { pos: 2, name: "Ana Luisa Torres", pct: 98, streak: 25, pts: 2210, level: "Excelencia FUNCAJE" },
  { pos: 3, name: "Roberto Paredes", pct: 96, streak: 20, pts: 2050, level: "Excelencia FUNCAJE" },
  { pos: 4, name: "María González", pct: 87, streak: 12, pts: 1240, level: "Ejemplar", isMe: true },
  { pos: 5, name: "Juan Espinoza", pct: 85, streak: 8, pts: 1100, level: "Ejemplar" },
  { pos: 6, name: "Sofía Castro", pct: 82, streak: 6, pts: 980, level: "Responsable" },
  { pos: 7, name: "Diego Vega", pct: 80, streak: 4, pts: 890, level: "Responsable" },
  { pos: 8, name: "Laura Salas", pct: 78, streak: 3, pts: 810, level: "Responsable" },
];

const medalColors = ["text-yellow-500", "text-slate-400", "text-amber-600"];
const levelColors: Record<string, string> = {
  "Excelencia FUNCAJE": "bg-secondary-light text-secondary",
  "Ejemplar": "bg-primary-light text-primary",
  "Responsable": "bg-muted text-muted-foreground",
};

const Ranking = () => {
  return (
    <div>
      {/* Header */}
      <div className="gradient-hero px-5 pt-12 pb-6">
        <h1 className="text-primary-foreground text-2xl font-bold mb-1">Ranking</h1>
        <p className="text-primary-foreground/70 text-sm">Top puntualidad — Febrero 2026</p>
      </div>

      <div className="px-5 pt-5">
        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-2 mb-6">
          {[mockRanking[1], mockRanking[0], mockRanking[2]].map((u, i) => {
            const heights = ["h-24", "h-32", "h-20"];
            const sizes = ["w-14", "w-16", "w-14"];
            const order = [1, 0, 2];
            return (
              <div key={u.pos} className="flex flex-col items-center gap-2 flex-1">
                <div className={`${sizes[i]} ${sizes[i]} rounded-full gradient-hero flex items-center justify-center shadow-primary text-primary-foreground font-black text-sm border-2 border-secondary`}>
                  {u.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                </div>
                <p className="text-xs font-bold text-foreground text-center truncate w-full px-1">{u.name.split(" ")[0]}</p>
                <div className={`${heights[i]} w-full rounded-t-xl flex items-center justify-center ${i === 1 ? "gradient-gold" : "bg-primary/20"}`}>
                  <div className="text-center">
                    {i === 1 && <Trophy size={24} className="text-primary-foreground mx-auto" />}
                    <span className={`text-lg font-black ${i === 1 ? "text-primary-foreground" : "text-primary"}`}>{u.pos}°</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full Ranking List */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-6">
          {mockRanking.map((user) => (
            <div
              key={user.pos}
              className={`flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 transition-colors ${user.isMe ? "bg-primary-light" : ""}`}
            >
              <div className={`w-8 text-center font-black text-sm ${user.pos <= 3 ? medalColors[user.pos - 1] : "text-muted-foreground"}`}>
                {user.pos <= 3 ? <Medal size={20} className="mx-auto" /> : `${user.pos}°`}
              </div>

              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${user.isMe ? "gradient-gold text-primary-foreground" : "bg-muted text-foreground"}`}>
                {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${user.isMe ? "text-primary" : "text-foreground"}`}>
                  {user.name} {user.isMe && "👈 Tú"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${user.pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-primary whitespace-nowrap">{user.pct}%</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-black text-foreground">{user.pts.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">pts</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <TrendingUp size={20} className="text-primary mb-2" />
            <p className="text-2xl font-black text-foreground">89%</p>
            <p className="text-xs text-muted-foreground font-semibold">Puntualidad institucional</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <Trophy size={20} className="text-secondary mb-2" />
            <p className="text-2xl font-black text-foreground">3</p>
            <p className="text-xs text-muted-foreground font-semibold">Miembros en Excelencia</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ranking;
