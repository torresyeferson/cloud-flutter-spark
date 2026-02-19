import { useState } from "react";
import { QrCode, MapPin, Hash, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Method = "qr" | "gps" | "code";
type CheckState = "idle" | "success";

const CheckIn = () => {
  const { user } = useAuth();
  const [method, setMethod] = useState<Method>("qr");
  const [code, setCode] = useState("");
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [semaphore, setSemaphore] = useState<"green" | "yellow" | "red" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!user) return;
    setLoading(true);

    // Simulate semaphore result
    const options = ["green", "yellow", "red"] as const;
    const result = options[Math.floor(Math.random() * 3)];
    const resultMap = { green: "verde", yellow: "amarillo", red: "rojo" } as const;
    const pointsMap = { green: 10, yellow: 5, red: 0 } as const;

    // Get user's institution from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("institution")
      .eq("user_id", user.id)
      .single();

    const institution = profile?.institution || "Sin institución";

    const { error } = await supabase.from("check_ins").insert({
      user_id: user.id,
      institution,
      result: resultMap[result],
      points: pointsMap[result],
    });

    setLoading(false);

    if (error) {
      toast.error("Error al registrar check-in");
      return;
    }

    setSemaphore(result);
    setCheckState("success");
  };

  if (checkState === "success" && semaphore) {
    const config = {
      green: {
        emoji: "🟢",
        label: "¡PUNTUAL!",
        message: "Llegaste a tiempo. ¡Excelente! +10 puntos",
        bg: "bg-ontime",
        text: "text-ontime",
        pts: "+10 pts",
      },
      yellow: {
        emoji: "🟡",
        label: "TOLERANCIA",
        message: "Llegaste dentro del margen de 3 minutos.",
        bg: "bg-tolerance",
        text: "text-tolerance",
        pts: "+5 pts",
      },
      red: {
        emoji: "🔴",
        label: "IMPUNTUAL",
        message: "Llegaste tarde. Sin puntos esta vez. ¡Mañana mejor!",
        bg: "bg-late",
        text: "text-late",
        pts: "0 pts",
      },
    }[semaphore];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className={`w-28 h-28 rounded-full flex items-center justify-center text-6xl mb-6 shadow-lg`}>
          {config.emoji}
        </div>
        <h2 className={`text-3xl font-black mb-2 ${config.text}`}>{config.label}</h2>
        <p className="text-muted-foreground text-base mb-4 max-w-xs">{config.message}</p>
        <div className={`px-6 py-3 rounded-2xl ${config.bg} bg-opacity-15 mb-8`}>
          <span className={`text-2xl font-black ${config.text}`}>{config.pts}</span>
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-card w-full max-w-sm text-left mb-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Clock size={14} />
            <span>Registro exitoso</span>
          </div>
          <p className="font-bold text-foreground">Reunión Semanal</p>
          <p className="text-sm text-muted-foreground">Hoy, {new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>

        <button
          onClick={() => { setCheckState("idle"); setSemaphore(null); setCode(""); }}
          className="w-full max-w-sm py-4 rounded-2xl gradient-hero text-primary-foreground font-bold text-lg shadow-primary"
        >
          Nuevo Check-In
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-hero px-5 pt-12 pb-6">
        <h1 className="text-primary-foreground text-2xl font-bold mb-1">Check-In</h1>
        <p className="text-primary-foreground/70 text-sm">Registra tu asistencia al evento</p>
      </div>

      <div className="px-5 pt-5">
        {/* Method selector */}
        <div className="bg-muted rounded-2xl p-1.5 grid grid-cols-3 gap-1 mb-6">
          {([
            { id: "qr" as Method, label: "QR", icon: QrCode },
            { id: "gps" as Method, label: "GPS", icon: MapPin },
            { id: "code" as Method, label: "Código", icon: Hash },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMethod(id)}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                method === id
                  ? "bg-card shadow-card text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* QR Panel */}
        {method === "qr" && (
          <div className="bg-card rounded-2xl p-6 shadow-card text-center mb-6">
            <div className="w-52 h-52 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4 border-4 border-dashed border-border">
              <div className="text-center text-muted-foreground">
                <QrCode size={48} className="mx-auto mb-2 text-primary" />
                <p className="text-sm font-semibold">Apunta al código QR</p>
                <p className="text-xs">del evento o clase</p>
              </div>
            </div>
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full py-4 rounded-2xl gradient-hero text-primary-foreground font-bold text-lg shadow-primary disabled:opacity-40"
            >
              {loading ? "Registrando…" : "Simular Escaneo QR"}
            </button>
          </div>
        )}

        {/* GPS Panel */}
        {method === "gps" && (
          <div className="bg-card rounded-2xl p-6 shadow-card text-center mb-6">
            <div className="w-52 h-52 mx-auto rounded-full bg-primary-light flex items-center justify-center mb-4 relative">
              <MapPin size={52} className="text-primary" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-dashed animate-spin" style={{ animationDuration: "8s" }} />
            </div>
            <p className="text-muted-foreground text-sm mb-4">Detectando tu ubicación…</p>
            <div className="bg-primary-light rounded-xl p-3 mb-4">
              <p className="text-xs text-primary font-semibold">📍 Fundación CAJE — Catamayo</p>
              <p className="text-xs text-muted-foreground">Distancia: 12 metros</p>
            </div>
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full py-4 rounded-2xl gradient-hero text-primary-foreground font-bold text-lg shadow-primary disabled:opacity-40"
            >
              {loading ? "Registrando…" : "Registrar por GPS"}
            </button>
          </div>
        )}

        {/* Code Panel */}
        {method === "code" && (
          <div className="bg-card rounded-2xl p-6 shadow-card mb-6">
            <p className="text-sm text-muted-foreground mb-3 font-semibold">Ingresa el código del evento:</p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej: CAJE-2026"
              className="w-full border border-border rounded-xl px-4 py-3 text-lg font-bold text-center text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary mb-4 tracking-widest"
            />
            <button
              onClick={handleCheckIn}
              disabled={!code || loading}
              className="w-full py-4 rounded-2xl gradient-hero text-primary-foreground font-bold text-lg shadow-primary disabled:opacity-40"
            >
              {loading ? "Registrando…" : "Registrar Asistencia"}
            </button>
          </div>
        )}

        {/* Semaphore info */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="font-bold text-foreground mb-3">Sistema Semáforo</h3>
          {[
            { color: "bg-ontime", label: "🟢 Puntual", desc: "Antes o justo a la hora", pts: "+10 pts" },
            { color: "bg-tolerance", label: "🟡 Tolerancia", desc: "Hasta 3 minutos tarde", pts: "+5 pts" },
            { color: "bg-late", label: "🔴 Impuntual", desc: "Más de 3 minutos tarde", pts: "0 pts" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <div className={`w-2 h-8 rounded-full ${s.color}`} />
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <span className="text-sm font-black text-primary">{s.pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
