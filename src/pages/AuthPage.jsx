import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useStore } from "../context/Store";
import { loginErrors, passwordStrength, signupErrors } from "../lib/validate";
import { cn, gradientBtn, wait } from "../lib/utils";
import { Field } from "../components/ui/Field";
import { Logo } from "../components/ui/Logo";

const empty = { name: "", username: "", email: "", password: "", confirm: "", remember: true };

export function AuthPage() {
  const { pathname } = useLocation();
  const mode = pathname === "/signup" ? "signup" : "login";
  const navigate = useNavigate();
  const { login, signup, people, demo } = useStore();
  const [values, setValues] = useState(empty);
  const [showPassword, setShowPassword] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAttempted(false);
    setFormError("");
    setTouched({});
  }, [mode]);

  const errors = mode === "login" ? loginErrors(values) : signupErrors(values, people);
  const strength = passwordStrength(values.password);

  function setField(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setFormError("");
  }

  function reveal(key) {
    return attempted || touched[key] ? errors[key] : "";
  }

  async function onSubmit(event) {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(errors).length) return;
    setLoading(true);
    setFormError("");
    await wait(640);
    const result = mode === "login" ? login(values) : signup(values);
    setLoading(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    navigate("/", { replace: true });
  }

  async function continueDemo() {
    const next = { ...values, email: demo.email, password: demo.password, remember: true };
    setValues(next);
    setLoading(true);
    setFormError("");
    await wait(500);
    const result = login(next);
    setLoading(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    navigate("/", { replace: true });
  }

  return (
    <div className="grid min-h-dvh w-full lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative h-[240px] overflow-hidden sm:h-[300px] lg:h-auto lg:min-h-dvh">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#ff7a59_0%,transparent_32%),radial-gradient(circle_at_80%_10%,#7a5cff_0%,transparent_28%),radial-gradient(circle_at_60%_80%,#ff4d8d_0%,transparent_34%),#140f18]" />
        <div className="brand-grid absolute inset-0" />
        <div className="animate-drift absolute -left-10 top-10 size-56 rounded-full bg-[#ff7a59]/40 blur-3xl" />
        <div className="animate-drift-slow absolute bottom-0 right-0 size-72 rounded-full bg-[#7a5cff]/40 blur-3xl" />
        <div className="relative z-10 flex h-full flex-col justify-between p-5 pb-12 sm:p-8 lg:p-12 xl:p-16">
          <Logo />
          <div>
            <p className="mb-3 max-w-md text-sm text-white/80 sm:text-base">A social space for people who notice things.</p>
            <h1 className="font-display text-[2.4rem] leading-[0.92] sm:text-6xl xl:text-7xl">
              See it.
              <br />
              Share it.
              <br />
              <span className="text-gradient">Stay close.</span>
            </h1>
          </div>
          <p className="hidden text-sm text-white/75 lg:block">Stories, a quieter feed, and conversations that feel like a room.</p>
        </div>
        <article className="animate-float absolute bottom-[18%] left-[10%] hidden w-[260px] rounded-3xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl lg:block">
          <div className="mb-2 flex items-center gap-2 text-sm">
            <span className="size-8 rounded-full bg-[linear-gradient(135deg,#ff7a59,#7a5cff)]" />
            <span>
              <span className="block font-semibold">Aria saved you a seat</span>
              <span className="text-xs text-white/70">Just now</span>
            </span>
          </div>
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=70"
            alt=""
            className="h-28 w-full rounded-2xl object-cover"
          />
        </article>
        <article className="animate-float-delayed absolute right-[8%] top-[28%] hidden w-[220px] rounded-3xl border border-white/15 bg-black/30 p-4 shadow-2xl backdrop-blur-xl lg:block">
          <p className="text-xs uppercase tracking-[0.16em] text-white/60">Trending</p>
          <p className="mt-1 font-display text-2xl">#GoldenHour</p>
          <p className="text-sm text-white/70">128K posts today</p>
        </article>
      </section>

      <section className="relative z-10 -mt-8 flex items-center rounded-t-[28px] bg-ink px-4 py-8 sm:px-8 lg:mt-0 lg:rounded-none lg:px-12 xl:px-16">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto w-full max-w-[480px] lg:mx-0 lg:max-w-none"
        >
          <p className="text-sm text-mist">{mode === "login" ? "Welcome back" : "Join Lumina"}</p>
          <h2 className="mt-1 font-display text-4xl">{mode === "login" ? "Sign in" : "Create your space"}</h2>
          <p className="mt-2 text-sm text-mist">
            {mode === "login" ? "Pick up the conversation where you left it." : "A name, a username, and you're in."}
          </p>

          {mode === "login" && (
            <button
              type="button"
              onClick={continueDemo}
              disabled={loading}
              className="mt-6 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:border-[#ff8fb2]/50 hover:bg-white/[0.07] disabled:opacity-60"
            >
              <span className="text-[11px] uppercase tracking-[0.16em] text-mist">Demo account</span>
              <span className="mt-1 block text-sm font-medium">{demo.email}</span>
              <span className="text-sm text-mist">{demo.password} · sample profiles share this password</span>
            </button>
          )}

          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
            {formError && (
              <p key={formError} className="animate-shake rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200" role="alert">
                {formError}
              </p>
            )}
            {mode === "signup" && (
              <>
                <Field label="Name" name="name" autoComplete="name" value={values.name} onBlur={() => setTouched((t) => ({ ...t, name: true }))} onChange={(event) => setField("name", event.target.value)} error={reveal("name")} placeholder="Maya Chen" />
                <Field label="Username" name="username" autoComplete="username" value={values.username} onBlur={() => setTouched((t) => ({ ...t, username: true }))} onChange={(event) => setField("username", event.target.value)} error={reveal("username")} placeholder="maya" />
              </>
            )}
            <Field label="Email" name="email" type="email" autoComplete="email" value={values.email} onBlur={() => setTouched((t) => ({ ...t, email: true }))} onChange={(event) => setField("email", event.target.value)} error={reveal("email")} placeholder="you@lumina.app" />
            <Field
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={values.password}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              onChange={(event) => setField("password", event.target.value)}
              error={reveal("password")}
              placeholder="At least 6 characters"
              end={
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="grid size-8 place-items-center rounded-full text-mist hover:text-cream">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            {mode === "signup" && (
              <>
                <div className="flex gap-1" aria-hidden="true">
                  {[0, 1, 2, 3].map((index) => (
                    <span key={index} className={cn("h-1 flex-1 rounded-full", values.password && index < strength ? "bg-[linear-gradient(90deg,#ff7a59,#7a5cff)]" : "bg-white/10")} />
                  ))}
                </div>
                <Field label="Confirm password" name="confirm" type={showPassword ? "text" : "password"} autoComplete="new-password" value={values.confirm} onBlur={() => setTouched((t) => ({ ...t, confirm: true }))} onChange={(event) => setField("confirm", event.target.value)} error={reveal("confirm")} placeholder="Repeat your password" />
              </>
            )}
            <label className="flex items-center gap-2 text-sm text-mist">
              <input
                type="checkbox"
                checked={values.remember}
                onChange={(event) => setField("remember", event.target.checked)}
                className="size-4 accent-[#ff4d8d]"
              />
              Remember me on this device
            </label>
            <button type="submit" disabled={loading} className={cn(gradientBtn, "h-12 w-full text-base")}>
              {loading ? (mode === "login" ? "Signing in…" : "Creating your space…") : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-mist">
            {mode === "login" ? "New here?" : "Already have a space?"}{" "}
            <Link to={mode === "login" ? "/signup" : "/login"} className="font-semibold text-cream hover:text-[#ffb4c8]">
              {mode === "login" ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </motion.div>
      </section>
    </div>
  );
}
