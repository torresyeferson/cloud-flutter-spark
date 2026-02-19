import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User, Eye, EyeOff, Building2, Fingerprint } from "lucide-react";
import puntualometroLogo from "@/assets/puntualometro-logo.jpeg";
import { useBiometric } from "@/hooks/useBiometric";
import { toast } from "sonner";

type Mode = "login" | "signup";

const AuthScreen = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const { isAvailable, isEnabled, authenticate } = useBiometric();
  const [biometricLoading, setBiometricLoading] = useState(false);

  // Auto-attempt biometric on mount if enabled
  useEffect(() => {
    if (isEnabled && isAvailable) {
      handleBiometricLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled, isAvailable]);

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      const result = await authenticate();
      if (result) {
        // Biometric passed — Supabase session should still be active from persistSession
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          toast.success("¡Bienvenido de vuelta!");
        } else {
          toast.error("Sesión expirada. Inicia sesión con tu correo.");
        }
      }
    } catch {
      toast.error("No se pudo verificar biométrico");
    }
    setBiometricLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage({ type: "error", text: error.message });
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, institution },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "¡Cuenta creada! Revisa tu correo para confirmar tu registro." });
      }
    }
    setLoading(false);
  };

  return (
    <div className="mobile-frame min-h-screen flex flex-col" style={{ minHeight: "100dvh" }}>
      {/* Top brand area */}
      <div className="gradient-hero px-6 pt-14 pb-12 flex flex-col items-center">
        <img
          src={puntualometroLogo}
          alt="Puntualómetro"
          className="w-24 h-24 rounded-full object-cover border-4 border-secondary shadow-gold mb-4 pulse-gold"
        />
        <h1 className="text-primary-foreground text-3xl font-black text-center">Puntualómetro</h1>
        <p className="text-primary-foreground/70 text-sm mt-1 text-center italic">
          "No es una Falta de Tiempo, es una Falta de Respeto"
        </p>
        <p className="text-secondary font-bold text-xs mt-2 tracking-wide">FUNDACIÓN CAJE</p>
      </div>

      {/* Form card */}
      <div className="flex-1 bg-background px-5 -mt-6 rounded-t-3xl pt-8">
        {/* Biometric login button */}
        {isAvailable && isEnabled && mode === "login" && (
          <button
            onClick={handleBiometricLogin}
            disabled={biometricLoading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-card border-2 border-primary shadow-card mb-5 disabled:opacity-60 transition-all active:scale-[0.98]"
          >
            <Fingerprint size={28} className="text-primary" />
            <span className="text-primary font-bold text-base">
              {biometricLoading ? "Verificando…" : "Ingresar con Biométrico"}
            </span>
          </button>
        )}

        {/* Tab switcher */}
        <div className="bg-muted rounded-2xl p-1.5 grid grid-cols-2 gap-1 mb-6">
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setMessage(null); }}
              className={`py-3 rounded-xl text-sm font-bold transition-all ${
                mode === m ? "bg-card shadow-card text-primary" : "text-muted-foreground"
              }`}
            >
              {m === "login" ? "Iniciar Sesión" : "Registrarse"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-card border border-border rounded-2xl text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="relative">
                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Institución"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-card border border-border rounded-2xl text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 bg-card border border-border rounded-2xl text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-11 pr-12 py-3.5 bg-card border border-border rounded-2xl text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {message && (
            <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${
              message.type === "error" ? "bg-destructive/10 text-destructive" : "bg-ontime/10 text-ontime"
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl gradient-hero text-primary-foreground font-bold text-base shadow-primary disabled:opacity-60 transition-opacity mt-2"
          >
            {loading ? "Procesando…" : mode === "login" ? "Entrar" : "Crear Cuenta"}
          </button>
        </form>

        {/* Semaphore decorative */}
        <div className="flex justify-center gap-3 mt-8">
          <div className="w-3 h-3 rounded-full bg-ontime blink" style={{ animationDelay: "0s" }} />
          <div className="w-3 h-3 rounded-full bg-tolerance blink" style={{ animationDelay: "0.5s" }} />
          <div className="w-3 h-3 rounded-full bg-late blink" style={{ animationDelay: "1s" }} />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2 mb-8">
          Compromiso de Todos · Fundación CAJE
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
