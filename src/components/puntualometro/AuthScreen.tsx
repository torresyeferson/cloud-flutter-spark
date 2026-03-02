import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
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

        {/* Social login divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-semibold">o continúa con</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={async () => {
              const { error } = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (error) toast.error("Error con Google: " + error.message);
            }}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-card border border-border font-bold text-sm transition-all active:scale-[0.97]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>
          <button
            onClick={async () => {
              const { error } = await lovable.auth.signInWithOAuth("apple", {
                redirect_uri: window.location.origin,
              });
              if (error) toast.error("Error con Apple: " + error.message);
            }}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-card border border-border font-bold text-sm transition-all active:scale-[0.97]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.22-3.74 4.25z"/></svg>
            Apple
          </button>
        </div>

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
