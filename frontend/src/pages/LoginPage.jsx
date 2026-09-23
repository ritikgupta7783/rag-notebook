import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { MdArrowBack, MdLockOutline, MdMailOutline } from "react-icons/md"
import { Shared } from "@/components/shared"
import { UI } from "@/components/ui"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/utils/cn"

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" },
  }),
}

function Field({ icon: Icon, label, ...inputProps }) {
  return (
    <div className="grid gap-1.5">
      <UI.Label className="text-[13px] text-[#c4c7cc]">{label}</UI.Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7c8189]" />
        <UI.Input
          className="h-11 rounded-xl border-white/10 bg-[#22262b] pl-9 text-[15px] text-[#e3e3e3] placeholder:text-[#7c8189] focus-visible:ring-[#3b82f6]/40"
          {...inputProps}
        />
      </div>
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.")
      return
    }
    setBusy(true)
    try {
      await login(email.trim(), password)
      toast.success("Signed in — welcome back!")
      navigate("/dashboard")
    } catch (error) {
      toast.error(error.message || "Unable to sign in. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#121417] px-4 text-[#e3e3e3]">
      {}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-purple-600/15 blur-3xl"
      />

      <Link
        to="/"
        className="absolute top-5 left-5 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-[#9aa0a6] transition-colors hover:bg-white/5 hover:text-[#e3e3e3]"
      >
        <MdArrowBack className="size-4" />
        Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#1a1d20] p-8 shadow-2xl shadow-black/40"
      >
        <motion.div variants={fadeUp} custom={0} className="flex flex-col items-center text-center">
          <Shared.BrandMark className="size-11 [&>svg]:size-6" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-1.5 text-sm text-[#9aa0a6]">Welcome back to OpenNotebook.</p>
        </motion.div>

        <form onSubmit={submit} className="mt-8 grid gap-4">
          <motion.div variants={fadeUp} custom={1}>
            <Field
              icon={MdMailOutline}
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
          </motion.div>

          <motion.div variants={fadeUp} custom={2} className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <UI.Label className="text-[13px] text-[#c4c7cc]">Password</UI.Label>
              <button
                type="button"
                onClick={() => toast.info("Password reset is coming soon.")}
                className="text-xs text-[#8ab4f8] transition-colors hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <MdLockOutline className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7c8189]" />
              <UI.Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-11 rounded-xl border-white/10 bg-[#22262b] pl-9 text-[15px] text-[#e3e3e3] placeholder:text-[#7c8189] focus-visible:ring-[#3b82f6]/40"
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={3}>
            <UI.Button
              type="submit"
              disabled={busy}
              className="h-11 w-full gap-2 rounded-full bg-white text-[15px] font-medium text-[#1b1b1b] shadow-lg shadow-black/30 transition-all hover:scale-[1.01] hover:bg-white/90 disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Sign in"}
            </UI.Button>
          </motion.div>
        </form>

        <motion.div variants={fadeUp} custom={4} className="mt-6">
          <div className="flex items-center gap-3 text-xs text-[#7c8189]">
            <span className="h-px flex-1 bg-white/10" />
            or
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <UI.Button
            variant="outline"
            onClick={() => toast.info("Google sign-in is coming soon.")}
            className={cn(
              "mt-4 h-11 w-full gap-2.5 rounded-full border-white/15 bg-[#22262b] text-[15px] text-[#e3e3e3]",
              "hover:bg-[#262a30] hover:text-white",
            )}
          >
            <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </UI.Button>
        </motion.div>

        <motion.p
          variants={fadeUp}
          custom={5}
          className="mt-6 text-center text-sm text-[#9aa0a6]"
        >
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-[#8ab4f8] transition-colors hover:underline">
            Sign up
          </Link>
        </motion.p>
      </motion.div>

    </div>
  )
}

