import { useEffect, useState } from "react";
import puntualometroLogo from "@/assets/puntualometro-logo.jpeg";
import { Award, Download, ChevronRight, Bell, Shield, LogOut, Fingerprint, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBiometric } from "@/hooks/useBiometric";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileData {
  fullName: string;
  initials: string;
  roleTitle: string;
  institution: string;
  pct: number;
  streak: number;
  points: number;
  level: string;
}

interface HistoryItem {
  id: string;
  check_in_time: string;
  result: string;
  points: number;
  event_id: string | null;
  eventTitle: string;
}

const Profile = () => {
  const { signOut, user } = useAuth();
  const { isAvailable, isEnabled, register, disable } = useBiometric();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role_title, institution")
      .eq("user_id", user.id)
      .single();

    const { data: checkIns } = await supabase
      .from("check_ins")
      .select("id, result, points, check_in_time, event_id")
      .eq("user_id", user.id)
      .order("check_in_time", { ascending: false });

    const fullName = profile?.full_name || user.user_metadata?.full_name || "Usuario";
    const initials = fullName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    const totalPoints = (checkIns || []).reduce((s, c) => s + (c.points || 0), 0);
    const total = (checkIns || []).length;
    const onTime = (checkIns || []).filter(c => c.result === "verde").length;
    const pct = total > 0 ? Math.round((onTime / total) * 100) : 0;

    let streak = 0;
    for (const c of (checkIns || [])) {
      if (c.result === "verde") streak++;
      else break;
    }

    let level = "Responsable";
    if (pct >= 95) level = "Excelencia FUNCAJE";
    else if (pct >= 80) level = "Ejemplar";

    setProfileData({
      fullName,
      initials,
      roleTitle: profile?.role_title || "Miembro",
      institution: profile?.institution || "",
      pct, streak, points: totalPoints, level,
    });

    // Fetch recent history with event titles
    const recent = (checkIns || []).slice(0, 5);
    const eventIds = recent.filter(c => c.event_id).map(c => c.event_id!);
    let eventMap: Record<string, string> = {};
    if (eventIds.length > 0) {
      const { data: events } = await supabase
        .from("events")
        .select("id, title")
        .in("id", eventIds);
      if (events) {
        eventMap = Object.fromEntries(events.map(e => [e.id, e.title]));
      }
    }

    setHistory(recent.map(c => ({
      ...c,
      eventTitle: c.event_id ? (eventMap[c.event_id] || "Evento") : "Check-in manual",
    })));

    setLoading(false);
  };

  const handleToggleBiometric = async () => {
    if (isEnabled) {
      disable();
      toast.success("Biométrico desactivado");
    } else if (user) {
      try {
        await register(user.id, user.email || "", user.user_metadata?.full_name || "Usuario");
        toast.success("¡Biométrico activado!");
      } catch {
        toast.error("No se pudo activar el biométrico");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!profileData) return null;

  const resultEmoji: Record<string, string> = { verde: "🟢", amarillo: "🟡", rojo: "🔴" };
  const resultPts = (r: string, p: number) => r === "rojo" ? "0" : `+${p}`;

  return (
    <div>
      {/* Header */}
      <div className="gradient-hero px-5 pt-12 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl gradient-gold flex items-center justify-center text-3xl font-black text-primary-foreground shadow-gold pulse-gold">
            {profileData.initials}
          </div>
          <div>
            <h1 className="text-primary-foreground text-xl font-black">{profileData.fullName}</h1>
            <p className="text-primary-foreground/70 text-sm">{profileData.roleTitle}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Award size={14} className="text-secondary" />
              <span className="text-secondary text-sm font-bold">Nivel {profileData.level}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Puntualidad", value: `${profileData.pct}%` },
            { label: "Racha", value: `${profileData.streak} 🔥` },
            { label: "Puntos", value: profileData.points.toLocaleString() },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-3 shadow-card text-center">
              <p className="text-xl font-black text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Certificate Download */}
        <button className="w-full bg-card rounded-2xl p-4 shadow-card mb-4 flex items-center gap-3 hover:bg-primary-light transition-colors">
          <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
            <Download size={20} className="text-primary" />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-foreground">Certificado de Puntualidad</p>
            <p className="text-xs text-muted-foreground">Descarga tu certificado mensual</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>

        {/* History */}
        <div className="bg-card rounded-2xl p-4 shadow-card mb-4">
          <h3 className="font-bold text-foreground mb-3">Historial Reciente</h3>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">Sin registros aún</p>
          ) : (
            history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <span className="text-base">{resultEmoji[h.result] || "⚪"}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{h.eventTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.check_in_time).toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short" })}
                  </p>
                </div>
                <span className={`text-sm font-black ${h.result === "rojo" ? "text-late" : "text-ontime"}`}>
                  {resultPts(h.result, h.points)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Settings */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-8">
          {isAvailable && (
            <button
              onClick={handleToggleBiometric}
              className="w-full flex items-center gap-3 px-4 py-4 border-b border-border hover:bg-muted transition-colors"
            >
              <Fingerprint size={20} className="text-primary" />
              <span className="flex-1 text-left font-semibold text-sm text-foreground">Ingreso Biométrico</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {isEnabled ? "Activado" : "Desactivado"}
              </span>
            </button>
          )}
          {[
            { icon: Bell, label: "Notificaciones", color: "text-primary", action: () => {} },
            { icon: Shield, label: "Privacidad", color: "text-primary", action: () => {} },
          ].map(({ icon: Icon, label, color, action }) => (
            <button key={label} onClick={action} className="w-full flex items-center gap-3 px-4 py-4 border-b border-border hover:bg-muted transition-colors">
              <Icon size={20} className={color} />
              <span className="flex-1 text-left font-semibold text-sm text-foreground">{label}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
          <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted transition-colors">
            <LogOut size={20} className="text-late" />
            <span className="flex-1 text-left font-semibold text-sm text-late">Cerrar Sesión</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Footer branding */}
        <div className="flex flex-col items-center gap-2 pb-4">
          <img src={puntualometroLogo} alt="Puntualómetro" className="w-16 h-16 rounded-full object-cover border-2 border-secondary" />
          <p className="text-xs text-muted-foreground text-center">
            "No es una Falta de Tiempo,<br />es una Falta de Respeto"
          </p>
          <p className="text-xs text-muted-foreground font-semibold">Fundación CAJE v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
