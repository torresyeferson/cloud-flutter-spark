import { useState, useEffect } from "react";
import { QrCode, MapPin, Hash, Clock, ChevronDown, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import QrScanner from "./QrScanner";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Method = "qr" | "gps" | "code";
type CheckState = "idle" | "scanning" | "success";

interface EventOption {
  id: string;
  title: string;
  start_time: string;
  event_type: string;
  institution: string;
}

const CheckIn = () => {
  const { user } = useAuth();
  const [method, setMethod] = useState<Method>("qr");
  const [code, setCode] = useState("");
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [semaphore, setSemaphore] = useState<"green" | "yellow" | "red" | null>(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [resultInfo, setResultInfo] = useState<{ eventTitle: string; time: string } | null>(null);

  useEffect(() => {
    fetchTodayEvents();
  }, []);

  const fetchTodayEvents = async () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    const { data } = await supabase
      .from("events")
      .select("id, title, start_time, event_type, institution")
      .gte("start_time", startOfDay)
      .lt("start_time", endOfDay)
      .order("start_time", { ascending: true });

    if (data && data.length > 0) {
      setEvents(data);
      setSelectedEventId(data[0].id);
    }
  };

  const calculateSemaphore = (startTime: string): "green" | "yellow" | "red" => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMinutes = (now.getTime() - start.getTime()) / 60000;

    if (diffMinutes <= 0) return "green"; // llegó antes o justo a tiempo
    if (diffMinutes <= 3) return "yellow"; // dentro de tolerancia (3 min)
    return "red"; // tarde
  };

  const handleCheckIn = async () => {
    if (!user) return;

    const selectedEvent = events.find((e) => e.id === selectedEventId);

    setLoading(true);

    let result: "green" | "yellow" | "red";
    let institution: string;
    let eventTitle: string;

    if (selectedEvent) {
      result = calculateSemaphore(selectedEvent.start_time);
      institution = selectedEvent.institution;
      eventTitle = selectedEvent.title;
    } else {
      // Fallback si no hay evento seleccionado
      const { data: profile } = await supabase
        .from("profiles")
        .select("institution")
        .eq("user_id", user.id)
        .single();
      result = "green";
      institution = profile?.institution || "Sin institución";
      eventTitle = "Check-in manual";
    }

    const resultMap = { green: "verde", yellow: "amarillo", red: "rojo" } as const;
    const pointsMap = { green: 10, yellow: 5, red: 0 } as const;

    const { error } = await supabase.from("check_ins").insert({
      user_id: user.id,
      institution,
      result: resultMap[result],
      points: pointsMap[result],
      event_id: selectedEvent?.id || null,
    });

    setLoading(false);

    if (error) {
      toast.error("Error al registrar check-in");
      return;
    }

    setSemaphore(result);
    setResultInfo({
      eventTitle,
      time: new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }),
    });
    setCheckState("success");
  };

  if (checkState === "success" && semaphore && resultInfo) {
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
        <div className="w-28 h-28 rounded-full flex items-center justify-center text-6xl mb-6 shadow-lg">
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
          <p className="font-bold text-foreground">{resultInfo.eventTitle}</p>
          <p className="text-sm text-muted-foreground">Hoy, {resultInfo.time}</p>
        </div>

        <button
          onClick={() => { setCheckState("idle"); setSemaphore(null); setCode(""); setResultInfo(null); }}
          className="w-full max-w-sm py-4 rounded-2xl gradient-hero text-primary-foreground font-bold text-lg shadow-primary"
        >
          Nuevo Check-In
        </button>
      </div>
    );
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div>
      {/* Header */}
      <div className="gradient-hero px-5 pt-12 pb-6">
        <h1 className="text-primary-foreground text-2xl font-bold mb-1">Check-In</h1>
        <p className="text-primary-foreground/70 text-sm">Registra tu asistencia al evento</p>
      </div>

      <div className="px-5 pt-5">
        {/* Event selector */}
        {events.length > 0 ? (
          <div className="bg-card rounded-2xl p-4 shadow-card mb-4">
            <p className="text-xs text-muted-foreground font-semibold mb-2">Evento de hoy</p>
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full appearance-none bg-primary-light rounded-xl px-4 py-3 pr-10 text-sm font-bold text-primary border-0 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {new Date(ev.start_time).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })} — {ev.title}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
            </div>
            {selectedEvent && (
              <p className="text-xs text-muted-foreground mt-2">
                Hora de inicio: <span className="font-bold text-foreground">{new Date(selectedEvent.start_time).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-4 shadow-card mb-4 text-center">
            <p className="text-sm text-muted-foreground">No hay eventos programados para hoy</p>
          </div>
        )}

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
                method === id ? "bg-card shadow-card text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* QR Panel */}
        {method === "qr" && checkState === "idle" && (
          <div className="bg-card rounded-2xl p-6 shadow-card text-center mb-6">
            <div className="w-52 h-52 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4 border-4 border-dashed border-border">
              <div className="text-center text-muted-foreground">
                <QrCode size={48} className="mx-auto mb-2 text-primary" />
                <p className="text-sm font-semibold">Escanea un código QR</p>
                <p className="text-xs">del evento o clase</p>
              </div>
            </div>
            <button
              onClick={() => setCheckState("scanning")}
              className="w-full py-4 rounded-2xl gradient-hero text-primary-foreground font-bold text-lg shadow-primary flex items-center justify-center gap-2"
            >
              <Camera size={20} />
              Abrir Cámara
            </button>
          </div>
        )}

        {/* QR Scanner Active */}
        {method === "qr" && checkState === "scanning" && (
          <div className="bg-card rounded-2xl p-6 shadow-card text-center mb-6">
            <p className="text-sm font-bold text-foreground mb-3">Apunta la cámara al código QR</p>
            <QrScanner
              onScan={(data) => {
                // Try to find event by ID or title from scanned data
                const matchedEvent = events.find(
                  (e) => e.id === data || e.title.toLowerCase() === data.toLowerCase()
                );
                if (matchedEvent) {
                  setSelectedEventId(matchedEvent.id);
                }
                setCheckState("idle");
                handleCheckIn();
              }}
              onError={() => {}}
            />
            <button
              onClick={() => setCheckState("idle")}
              className="mt-4 w-full py-3 rounded-xl border border-border text-sm font-bold text-muted-foreground"
            >
              Cancelar
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
