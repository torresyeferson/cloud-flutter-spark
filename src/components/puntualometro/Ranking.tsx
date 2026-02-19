import { useEffect, useState } from "react";
import { Building2, Trophy, Medal, TrendingUp, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InstitutionRank {
  institution: string;
  total_checkins: number;
  on_time_checkins: number;
  pct: number;
  members: number;
  total_points: number;
}

const levelFromPct = (pct: number) => {
  if (pct >= 95) return "Excelencia FUNCAJE";
  if (pct >= 80) return "Ejemplar";
  return "Responsable";
};

const medalColors = ["text-yellow-500", "text-slate-400", "text-amber-600"];
const levelColors: Record<string, string> = {
  "Excelencia FUNCAJE": "bg-secondary-light text-secondary",
  "Ejemplar": "bg-primary-light text-primary",
  "Responsable": "bg-muted text-muted-foreground",
};

const Ranking = () => {
  const [ranking, setRanking] = useState<InstitutionRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase.rpc("get_institution_ranking");
      if (!error && data) {
        setRanking(data.map((d: any) => ({
          institution: d.institution,
          total_checkins: Number(d.total_checkins),
          on_time_checkins: Number(d.on_time_checkins),
          pct: Number(d.pct),
          members: Number(d.members),
          total_points: Number(d.total_points),
        })));
      }
      setLoading(false);
    };
    fetchRanking();
  }, []);

  const avgPct = ranking.length > 0 ? Math.round(ranking.reduce((s, r) => s + r.pct, 0) / ranking.length) : 0;
  const excellenceCount = ranking.filter(r => r.pct >= 95).length;

  return (
    <div>
      {/* Header */}
      <div className="gradient-hero px-5 pt-12 pb-6">
        <h1 className="text-primary-foreground text-2xl font-bold mb-1">Ranking Institucional</h1>
        <p className="text-primary-foreground/70 text-sm">Instituciones más puntuales · datos en tiempo real</p>
      </div>

      <div className="px-5 pt-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : ranking.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 shadow-card text-center">
            <Building2 size={40} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-bold text-foreground mb-1">Sin datos aún</p>
            <p className="text-sm text-muted-foreground">Realiza check-ins para ver el ranking institucional.</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {ranking.length >= 3 && (
              <div className="flex items-end justify-center gap-2 mb-6">
                {[ranking[1], ranking[0], ranking[2]].map((inst, i) => {
                  const heights = ["h-24", "h-32", "h-20"];
                  return (
                    <div key={inst.institution} className="flex flex-col items-center gap-2 flex-1">
                      <div className={`w-14 h-14 rounded-2xl ${i === 1 ? "gradient-gold" : "gradient-hero"} flex items-center justify-center shadow-primary border-2 border-secondary`}>
                        <Building2 size={i === 1 ? 28 : 22} className="text-primary-foreground" />
                      </div>
                      <p className="text-[10px] font-bold text-foreground text-center leading-tight px-1 line-clamp-2">{inst.institution}</p>
                      <div className={`${heights[i]} w-full rounded-t-xl flex flex-col items-center justify-center ${i === 1 ? "gradient-gold" : "bg-primary/20"}`}>
                        {i === 1 && <Trophy size={20} className="text-primary-foreground mb-1" />}
                        <span className={`text-xl font-black ${i === 1 ? "text-primary-foreground" : "text-primary"}`}>{i === 1 ? 1 : i === 0 ? 2 : 3}°</span>
                        <span className={`text-sm font-black ${i === 1 ? "text-primary-foreground/80" : "text-primary/70"}`}>{inst.pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full Ranking List */}
            <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-5">
              {ranking.map((inst, idx) => {
                const pos = idx + 1;
                const level = levelFromPct(inst.pct);
                return (
                  <div key={inst.institution} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0">
                    <div className={`w-7 text-center font-black text-sm flex-shrink-0 ${pos <= 3 ? medalColors[pos - 1] : "text-muted-foreground"}`}>
                      {pos <= 3 ? <Medal size={18} className="mx-auto" /> : `${pos}°`}
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${pos <= 3 ? "gradient-gold" : "bg-primary-light"}`}>
                      <Building2 size={18} className={pos <= 3 ? "text-primary-foreground" : "text-primary"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{inst.institution}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-0.5 text-muted-foreground">
                          <Users size={10} />
                          <span className="text-xs">{inst.members} miembros</span>
                        </div>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{inst.total_checkins} registros</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${inst.pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-primary whitespace-nowrap">{inst.pct}%</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-foreground">{inst.total_points.toLocaleString()}</p>
                      <p className="text-[9px] text-muted-foreground">pts</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${levelColors[level]}`}>
                        {level === "Excelencia FUNCAJE" ? "Excelencia" : level}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-card rounded-2xl p-3 shadow-card text-center">
                <TrendingUp size={16} className="text-primary mx-auto mb-1" />
                <p className="text-lg font-black text-foreground">{avgPct}%</p>
                <p className="text-[10px] text-muted-foreground font-semibold">Puntualidad promedio</p>
              </div>
              <div className="bg-card rounded-2xl p-3 shadow-card text-center">
                <Building2 size={16} className="text-secondary mx-auto mb-1" />
                <p className="text-lg font-black text-foreground">{ranking.length}</p>
                <p className="text-[10px] text-muted-foreground font-semibold">Instituciones</p>
              </div>
              <div className="bg-card rounded-2xl p-3 shadow-card text-center">
                <Trophy size={16} className="text-secondary mx-auto mb-1" />
                <p className="text-lg font-black text-foreground">{excellenceCount}</p>
                <p className="text-[10px] text-muted-foreground font-semibold">En Excelencia</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Ranking;
