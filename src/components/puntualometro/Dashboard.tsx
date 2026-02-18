import puntualometroLogo from "@/assets/puntualometro-logo.jpeg";
import { Flame, Star, TrendingUp, Calendar, Award } from "lucide-react";

const Dashboard = () => {
  const punctualityPercent = 87;
  const streak = 12;
  const points = 1240;
  const monthlyImprovement = 18;

  return (
    <div>
      {/* Header */}
      <div className="gradient-hero px-5 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm font-600">Buenos días 👋</p>
            <h1 className="text-primary-foreground text-2xl font-bold">María González</h1>
          </div>
          <img src={puntualometroLogo} alt="Puntualómetro" className="w-14 h-14 rounded-full object-cover border-2 border-secondary shadow-gold" />
        </div>

        {/* Main Meter */}
        <div className="bg-card rounded-2xl p-5 shadow-primary">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground text-sm font-semibold">Puntualidad Mensual</span>
            <span className="text-xs bg-primary-light text-primary px-2.5 py-1 rounded-full font-bold">Ejemplar</span>
          </div>

          {/* Circular Progress */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary-light))" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - punctualityPercent / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-primary">{punctualityPercent}%</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">Racha activa</p>
                  <p className="font-black text-foreground text-lg leading-tight">{streak} días 🔥</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star size={18} className="text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">Puntos totales</p>
                  <p className="font-black text-foreground text-lg leading-tight">{points.toLocaleString()} pts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Improvement */}
          <div className="mt-4 bg-primary/5 rounded-xl p-3 flex items-center gap-3">
            <TrendingUp size={20} className="text-primary flex-shrink-0" />
            <p className="text-sm text-foreground">
              <span className="font-black text-primary">+{monthlyImprovement}%</span>{" "}
              de mejora en puntualidad este mes 🚀
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-5 -mt-2">
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Puntuales", value: "18", color: "bg-ontime", emoji: "🟢" },
            { label: "Tolerancia", value: "3", color: "bg-tolerance", emoji: "🟡" },
            { label: "Tardanzas", value: "1", color: "bg-late", emoji: "🔴" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl p-3 shadow-card text-center">
              <span className="text-2xl">{stat.emoji}</span>
              <p className="text-2xl font-black text-foreground mt-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Level Badge */}
        <div className="bg-card rounded-2xl p-4 shadow-card mb-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center shadow-gold pulse-gold flex-shrink-0">
            <Award size={28} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Tu Nivel Actual</p>
            <p className="text-xl font-black text-foreground">Ejemplar</p>
            <p className="text-xs text-muted-foreground mt-0.5">Siguiente: <span className="text-primary font-bold">Excelencia FUNCAJE</span> (9% más)</p>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-card rounded-2xl p-4 shadow-card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} className="text-primary" />
            <h3 className="font-bold text-foreground">Próximos Eventos</h3>
          </div>
          {[
            { time: "08:00", name: "Reunión Semanal", status: "🟢" },
            { time: "10:30", name: "Capacitación Digital", status: "🟡" },
            { time: "15:00", name: "Asamblea General", status: "🟢" },
          ].map((ev) => (
            <div key={ev.name} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <div className="bg-primary-light rounded-lg px-2.5 py-1 text-center min-w-[54px]">
                <p className="text-xs font-black text-primary">{ev.time}</p>
              </div>
              <p className="flex-1 text-sm font-semibold text-foreground">{ev.name}</p>
              <span className="text-base">{ev.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
