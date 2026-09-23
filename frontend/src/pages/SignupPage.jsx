import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { MdArrowBack, MdLockOutline, MdMailOutline, MdPersonOutline } from "react-icons/md"
import { Shared } from "@/components/shared"
import { UI } from "@/components/ui"
import { useAuth } from "@/context/AuthContext"

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

export function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill in all fields.")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.")
      return
    }
    setBusy(true)
    try {
      await signup(name.trim(), email.trim(), password)
      toast.success("Account created — welcome to OpenNotebook!")
      navigate("/dashboard")
    } catch (error) {
      toast.error(error.message || "Unable to create your account. Please try again.")
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
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1.5 text-sm text-[#9aa0a6]">Start building notebooks in minutes.</p>
        </motion.div>

        <form onSubmit={submit} className="mt-8 grid gap-4">
          <motion.div variants={fadeUp} custom={1}>
            <Field
              icon={MdPersonOutline}
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              autoComplete="name"
              autoFocus
            />
          </motion.div>

          <motion.div variants={fadeUp} custom={2}>
            <Field
              icon={MdMailOutline}
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </motion.div>

          <motion.div variants={fadeUp} custom={3}>
            <Field
              icon={MdLockOutline}
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </motion.div>

          <motion.div variants={fadeUp} custom={4}>
            <UI.Button
              type="submit"
              disabled={busy}
              className="h-11 w-full gap-2 rounded-full bg-white text-[15px] font-medium text-[#1b1b1b] shadow-lg shadow-black/30 transition-all hover:scale-[1.01] hover:bg-white/90 disabled:opacity-60"
            >
              {busy ? "Creating account…" : "Create account"}
            </UI.Button>
          </motion.div>
        </form>

        <motion.p variants={fadeUp} custom={5} className="mt-6 text-center text-sm text-[#9aa0a6]">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[#8ab4f8] transition-colors hover:underline">
            Sign in
          </Link>
        </motion.p>
      </motion.div>

    </div>
  )
}

