import { useEffect, useState } from "react";
import puntualometroLogo from "@/assets/puntualometro-logo.jpeg";
import { Flame, Star, TrendingUp, Calendar, Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardData {
  fullName: string;
  punctualityPercent: number;
  streak: number;
  points: number;
  monthlyImprovement: number;
  onTime: number;
  tolerance: number;
  late: number;
  level: string;
  nextLevel: string;
  nextLevelGap: number;
}

interface UpcomingEvent {
  id: string;
  title: string;
  start_time: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchUpcomingEvents();
    }
  }, [user]);

  const fetchUpcomingEvents = async () => {
    const now = new Date().toISOString();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { data } = await supabase
      .from("events")
      .select("id, title, start_time")
      .gte("start_time", now)
      .lte("start_time", endOfDay.toISOString())
      .order("start_time", { ascending: true })
      .limit(3);

    if (data) setUpcomingEvents(data);
  };

  const fetchDashboardData = async () => {
    if (!user) return;

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single();

    // Fetch all check-ins for this user
    const { data: checkIns } = await supabase
      .from("check_ins")
      .select("result, points, check_in_time")
      .eq("user_id", user.id)
      .order("check_in_time", { ascending: false });

    if (!checkIns) {
      setData({
        fullName: profile?.full_name || user.user_metadata?.full_name || "Usuario",
        punctualityPercent: 0, streak: 0, points: 0, monthlyImprovement: 0,
        onTime: 0, tolerance: 0, late: 0,
        level: "Responsable", nextLevel: "Ejemplar", nextLevelGap: 80,
      });
      setLoading(false);
      return;
    }

    const totalPoints = checkIns.reduce((s, c) => s + (c.points || 0), 0);
    const onTime = checkIns.filter(c => c.result === "verde").length;
    const tolerance = checkIns.filter(c => c.result === "amarillo").length;
    const late = checkIns.filter(c => c.result === "rojo").length;
    const total = checkIns.length;
    const pct = total > 0 ? Math.round((onTime / total) * 100) : 0;

    // Calculate streak (consecutive "verde" from most recent)
    let streak = 0;
    for (const c of checkIns) {
      if (c.result === "verde") streak++;
      else break;
    }

    // Monthly improvement: compare current month vs previous month
    const now = new Date();
    const thisMonth = checkIns.filter(c => {
      const d = new Date(c.check_in_time);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const lastMonth = checkIns.filter(c => {
      const d = new Date(c.check_in_time);
      const prev = new Date(now.getFullYear(), now.getMonth() - 1);
      return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
    });

    const thisMonthPct = thisMonth.length > 0
      ? Math.round(thisMonth.filter(c => c.result === "verde").length / thisMonth.length * 100) : 0;
    const lastMonthPct = lastMonth.length > 0
      ? Math.round(lastMonth.filter(c => c.result === "verde").length / lastMonth.length * 100) : 0;
    const improvement = thisMonthPct - lastMonthPct;

    // Level
    let level = "Responsable";
    let nextLevel = "Ejemplar";
    let nextLevelGap = 80 - pct;
    if (pct >= 95) { level = "Excelencia FUNCAJE"; nextLevel = "—"; nextLevelGap = 0; }
    else if (pct >= 80) { level = "Ejemplar"; nextLevel = "Excelencia FUNCAJE"; nextLevelGap = 95 - pct; }

    setData({
      fullName: profile?.full_name || user.user_metadata?.full_name || "Usuario",
      punctualityPercent: pct,
      streak,
      points: totalPoints,
      monthlyImprovement: improvement,
      onTime, tolerance, late,
      level, nextLevel, nextLevelGap,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!data) return null;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  })();

  return (
    <div>
      {/* Header */}
      <div className="gradient-hero px-5 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm font-600">{greeting} 👋</p>
            <h1 className="text-primary-foreground text-2xl font-bold">{data.fullName}</h1>
          </div>
          <img src={puntualometroLogo} alt="Puntualómetro" className="w-14 h-14 rounded-full object-cover border-2 border-secondary shadow-gold" />
        </div>

        {/* Main Meter */}
        <div className="bg-card rounded-2xl p-5 shadow-primary">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground text-sm font-semibold">Puntualidad General</span>
            <span className="text-xs bg-primary-light text-primary px-2.5 py-1 rounded-full font-bold">{data.level}</span>
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
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - data.punctualityPercent / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-primary">{data.punctualityPercent}%</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">Racha activa</p>
                  <p className="font-black text-foreground text-lg leading-tight">{data.streak} días 🔥</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star size={18} className="text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">Puntos totales</p>
                  <p className="font-black text-foreground text-lg leading-tight">{data.points.toLocaleString()} pts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Improvement */}
          {data.monthlyImprovement !== 0 && (
            <div className="mt-4 bg-primary/5 rounded-xl p-3 flex items-center gap-3">
              <TrendingUp size={20} className="text-primary flex-shrink-0" />
              <p className="text-sm text-foreground">
                <span className="font-black text-primary">{data.monthlyImprovement > 0 ? "+" : ""}{data.monthlyImprovement}%</span>{" "}
                {data.monthlyImprovement > 0 ? "de mejora" : "de variación"} en puntualidad este mes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-5 -mt-2">
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Puntuales", value: String(data.onTime), emoji: "🟢" },
            { label: "Tolerancia", value: String(data.tolerance), emoji: "🟡" },
            { label: "Tardanzas", value: String(data.late), emoji: "🔴" },
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
            <p className="text-xl font-black text-foreground">{data.level}</p>
            {data.nextLevel !== "—" && (
              <p className="text-xs text-muted-foreground mt-0.5">Siguiente: <span className="text-primary font-bold">{data.nextLevel}</span> ({data.nextLevelGap}% más)</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-card rounded-2xl p-4 shadow-card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} className="text-primary" />
            <h3 className="font-bold text-foreground">Próximos Eventos</h3>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">No hay eventos programados para hoy</p>
          ) : (
            upcomingEvents.map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <div className="bg-primary-light rounded-lg px-2.5 py-1 text-center min-w-[54px]">
                  <p className="text-xs font-black text-primary">
                    {new Date(ev.start_time).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <p className="flex-1 text-sm font-semibold text-foreground">{ev.title}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
