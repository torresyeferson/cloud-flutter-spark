import puntualometroLogo from "@/assets/puntualometro-logo.jpeg";
import { Award, Star, Download, ChevronRight, Bell, Shield, LogOut } from "lucide-react";

const badges = [
  { icon: "🔥", label: "Racha 10", earned: true },
  { icon: "⭐", label: "Puntual x5", earned: true },
  { icon: "🏆", label: "Top 5", earned: true },
  { icon: "🚀", label: "Mejora 20%", earned: false },
  { icon: "💎", label: "Excelencia", earned: false },
  { icon: "🌟", label: "Maestro", earned: false },
];

const historial = [
  { date: "Lun 17 Feb", event: "Reunión Semanal", status: "🟢", pts: "+10" },
  { date: "Mar 18 Feb", event: "Capacitación", status: "🟢", pts: "+10" },
  { date: "Mié 19 Feb", event: "Asamblea", status: "🟡", pts: "+5" },
  { date: "Jue 20 Feb", event: "Taller Digital", status: "🟢", pts: "+10" },
  { date: "Vie 21 Feb", event: "Reunión Eq.", status: "🔴", pts: "0" },
];

const Profile = () => {
  return (
    <div>
      {/* Header */}
      <div className="gradient-hero px-5 pt-12 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl gradient-gold flex items-center justify-center text-3xl font-black text-primary-foreground shadow-gold pulse-gold">
            MG
          </div>
          <div>
            <h1 className="text-primary-foreground text-xl font-black">María González</h1>
            <p className="text-primary-foreground/70 text-sm">Coordinadora Educativa</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Award size={14} className="text-secondary" />
              <span className="text-secondary text-sm font-bold">Nivel Ejemplar</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Puntualidad", value: "87%" },
            { label: "Racha", value: "12 🔥" },
            { label: "Puntos", value: "1.240" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-3 shadow-card text-center">
              <p className="text-xl font-black text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="bg-card rounded-2xl p-4 shadow-card mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">Insignias</h3>
            <span className="text-xs text-muted-foreground">3/6 obtenidas</span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {badges.map((b) => (
              <div key={b.label} className="text-center">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mx-auto ${b.earned ? "gradient-gold shadow-gold" : "bg-muted opacity-40"}`}>
                  {b.icon}
                </div>
                <p className="text-[9px] text-muted-foreground mt-1 leading-tight">{b.label}</p>
              </div>
            ))}
          </div>
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
          {historial.map((h) => (
            <div key={h.date} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <span className="text-base">{h.status}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{h.event}</p>
                <p className="text-xs text-muted-foreground">{h.date}</p>
              </div>
              <span className={`text-sm font-black ${h.pts === "0" ? "text-late" : "text-ontime"}`}>{h.pts}</span>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-8">
          {[
            { icon: Bell, label: "Notificaciones", color: "text-primary" },
            { icon: Shield, label: "Privacidad", color: "text-primary" },
            { icon: LogOut, label: "Cerrar Sesión", color: "text-late" },
          ].map(({ icon: Icon, label, color }) => (
            <button key={label} className="w-full flex items-center gap-3 px-4 py-4 border-b border-border last:border-0 hover:bg-muted transition-colors">
              <Icon size={20} className={color} />
              <span className={`flex-1 text-left font-semibold text-sm ${color === "text-late" ? "text-late" : "text-foreground"}`}>{label}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
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
