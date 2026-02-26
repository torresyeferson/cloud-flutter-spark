import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Plus, Users, Clock, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const EVENT_TYPES = [
  { value: "cultural", label: "Cultural", emoji: "🎭" },
  { value: "deportivo", label: "Deportivo", emoji: "⚽" },
  { value: "cívico", label: "Cívico", emoji: "🏛️" },
  { value: "político", label: "Político", emoji: "📢" },
  { value: "social", label: "Social", emoji: "🤝" },
  { value: "empresarial", label: "Empresarial", emoji: "💼" },
];

interface EventRow {
  id: string;
  title: string;
  event_type: string;
  institution: string;
  start_time: string;
  end_time: string;
  description: string | null;
  created_by: string;
  created_at: string;
}

interface EventStats {
  total: number;
  on_time: number;
  late: number;
  pct: number;
}

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [eventStats, setEventStats] = useState<EventStats | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  // Form state
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_time", { ascending: false });
    if (!error && data) setEvents(data);
    setLoading(false);
  };

  const fetchEventStats = async (eventId: string) => {
    const { data, error } = await supabase
      .from("check_ins")
      .select("result")
      .eq("event_id", eventId);
    if (!error && data) {
      const total = data.length;
      const on_time = data.filter((c) => c.result === "verde").length;
      const late = data.filter((c) => c.result === "rojo").length;
      setEventStats({
        total,
        on_time,
        late,
        pct: total > 0 ? Math.round((on_time / total) * 100) : 0,
      });
    }
  };

  const handleSelectEvent = (ev: EventRow) => {
    setSelectedEvent(ev);
    fetchEventStats(ev.id);
  };

  const handleCreate = async () => {
    if (!user || !title || !eventType || !startTime || !endTime) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }
    // Get user institution
    const { data: profile } = await supabase
      .from("profiles")
      .select("institution")
      .eq("user_id", user.id)
      .single();

    const { error } = await supabase.from("events").insert({
      title,
      event_type: eventType,
      start_time: startTime,
      end_time: endTime,
      description: description || null,
      created_by: user.id,
      institution: profile?.institution || "Sin institución",
    });
    if (error) {
      toast.error("Error al crear evento");
    } else {
      toast.success("Evento creado exitosamente");
      setShowForm(false);
      setTitle("");
      setEventType("");
      setStartTime("");
      setEndTime("");
      setDescription("");
      fetchEvents();
    }
  };

  const typeInfo = (type: string) => EVENT_TYPES.find((t) => t.value === type);

  const filtered = filterType === "all" ? events : events.filter((e) => e.event_type === filterType);

  if (selectedEvent) {
    const ti = typeInfo(selectedEvent.event_type);
    return (
      <div>
        <div className="gradient-hero px-5 pt-12 pb-6">
          <button onClick={() => { setSelectedEvent(null); setEventStats(null); }} className="text-primary-foreground/80 text-sm mb-3 flex items-center gap-1">
            ← Volver
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{ti?.emoji}</span>
            <span className="text-xs bg-primary-foreground/20 text-primary-foreground px-2 py-0.5 rounded-full font-bold">{ti?.label}</span>
          </div>
          <h1 className="text-primary-foreground text-xl font-bold">{selectedEvent.title}</h1>
          {selectedEvent.description && (
            <p className="text-primary-foreground/70 text-sm mt-1">{selectedEvent.description}</p>
          )}
        </div>

        <div className="px-5 -mt-2 space-y-3">
          {/* Horarios */}
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Clock size={18} className="text-primary" /> Horarios
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary-light rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground font-semibold">Inicio</p>
                <p className="text-lg font-black text-primary">
                  {new Date(selectedEvent.start_time).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedEvent.start_time).toLocaleDateString("es", { day: "numeric", month: "short" })}
                </p>
              </div>
              <div className="bg-secondary-light rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground font-semibold">Fin</p>
                <p className="text-lg font-black text-secondary">
                  {new Date(selectedEvent.end_time).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedEvent.end_time).toLocaleDateString("es", { day: "numeric", month: "short" })}
                </p>
              </div>
            </div>
          </div>

          {/* Asistencia */}
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Users size={18} className="text-primary" /> Asistencia
            </h3>
            {eventStats ? (
              eventStats.total === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Sin registros de asistencia aún</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-primary-light rounded-xl p-3 text-center">
                      <span className="text-2xl">🟢</span>
                      <p className="text-2xl font-black text-foreground mt-1">{eventStats.on_time}</p>
                      <p className="text-xs text-muted-foreground font-semibold">Puntuales</p>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: "hsl(var(--tolerance) / 0.15)" }}>
                      <span className="text-2xl">🟡</span>
                      <p className="text-2xl font-black text-foreground mt-1">{eventStats.total - eventStats.on_time - eventStats.late}</p>
                      <p className="text-xs text-muted-foreground font-semibold">Tolerancia</p>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: "hsl(var(--late) / 0.15)" }}>
                      <span className="text-2xl">🔴</span>
                      <p className="text-2xl font-black text-foreground mt-1">{eventStats.late}</p>
                      <p className="text-xs text-muted-foreground font-semibold">Impuntuales</p>
                    </div>
                  </div>

                  {/* Porcentaje de puntualidad */}
                  <div className="bg-primary/5 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-foreground">Puntualidad</span>
                      <span className="text-lg font-black text-primary">{eventStats.pct}%</span>
                    </div>
                    <div className="w-full bg-primary-light rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${eventStats.pct}%`,
                          background: eventStats.pct >= 80 ? "hsl(var(--on-time))" : eventStats.pct >= 50 ? "hsl(var(--tolerance))" : "hsl(var(--late))",
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {eventStats.on_time} de {eventStats.total} personas llegaron puntuales
                    </p>
                  </div>
                </>
              )
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Cargando...</p>
            )}
          </div>

          <div className="bg-card rounded-2xl p-4 shadow-card mb-6">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Institución:</span> {selectedEvent.institution}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="gradient-hero px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/70 text-sm">Agenda</p>
            <h1 className="text-primary-foreground text-2xl font-bold">Eventos</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground"
          >
            <Plus size={22} />
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filterType === "all" ? "bg-primary-foreground text-primary" : "bg-primary-foreground/20 text-primary-foreground"
            }`}
          >
            Todos
          </button>
          {EVENT_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filterType === t.value ? "bg-primary-foreground text-primary" : "bg-primary-foreground/20 text-primary-foreground"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 -mt-2">
        {/* Create form */}
        {showForm && (
          <div className="bg-card rounded-2xl p-4 shadow-card mb-4">
            <h3 className="font-bold text-foreground mb-3">Nuevo Evento</h3>
            <div className="space-y-3">
              <Input placeholder="Título del evento" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.emoji} {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-semibold mb-1 block">Hora inicio</label>
                  <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-semibold mb-1 block">Hora fin</label>
                  <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-xl text-sm" />
                </div>
              </div>
              <Input placeholder="Descripción (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl" />
              <Button onClick={handleCreate} className="w-full rounded-xl font-bold">
                Crear Evento
              </Button>
            </div>
          </div>
        )}

        {/* Events list */}
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Cargando eventos...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-semibold">No hay eventos</p>
            <p className="text-xs text-muted-foreground">Crea el primero con el botón +</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {filtered.map((ev) => {
              const ti = typeInfo(ev.event_type);
              const start = new Date(ev.start_time);
              const end = new Date(ev.end_time);
              return (
                <button
                  key={ev.id}
                  onClick={() => handleSelectEvent(ev)}
                  className="w-full bg-card rounded-2xl p-4 shadow-card text-left flex items-center gap-3 hover:shadow-primary transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-2xl flex-shrink-0">
                    {ti?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{ev.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Tag size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-semibold">{ti?.label}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={12} className="text-primary" />
                      <span className="text-xs text-primary font-bold">
                        {start.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })} - {end.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
