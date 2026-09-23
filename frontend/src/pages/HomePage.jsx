import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  MdAdd,
  MdAutoAwesome,
  MdCheckCircle,
  MdChevronRight,
  MdDescription,
  MdFormatQuote,
  MdMenuBook,
  MdQuestionAnswer,
  MdUploadFile,
} from "react-icons/md"
import { Home } from "@/components/home"
import { Shared } from "@/components/shared"
import { UI } from "@/components/ui"
import { useAuth } from "@/context/AuthContext"

const HOW_ICONS = [MdUploadFile, MdQuestionAnswer, MdFormatQuote]

const USE_ICONS = [MdAdd, MdDescription, MdQuestionAnswer, MdCheckCircle]

const HOW_STEPS = [
  {
    title: "Organize your material",
    body: "Bring everything you're working with into one clean workspace — organized, searchable, and ready whenever you need it.",
  },
  {
    title: "Ask in your own words",
    body: "Type a question the way you'd ask a colleague — no commands, no setup — and get a clear, direct answer.",
  },
  {
    title: "See the reasoning",
    body: "Every answer shows where it came from, so you can review the details and move forward with confidence.",
  },
]

const USE_STEPS = [
  {
    title: "Create a notebook",
    body: "Give your workspace a name and you're ready to go in seconds.",
  },
  {
    title: "Add your material",
    body: "Bring in whatever you're working with — the more you add, the more you can ask about.",
  },
  {
    title: "Ask questions",
    body: "Type what you want to know and press Enter. Clear answers, without the digging.",
  },
  {
    title: "Check the evidence",
    body: "See exactly where each answer comes from, so you can act with confidence.",
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
}

function HeroBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#1e2227] px-3 py-1 text-[13px] text-[#9aa0a6]">
      <MdAutoAwesome className="size-3.5 text-[#8ab4f8]" />
      Built for better answers
    </span>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [createOpen, setCreateOpen] = useState(false)

  function handleCreate() {
    if (user) setCreateOpen(true)
    else navigate("/login")
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#121417] text-[#e3e3e3]">
      {}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-[#121417]/80 px-4 backdrop-blur-sm sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex min-w-0 items-center gap-3"
        >
          <Shared.BrandMark className="size-9 [&>svg]:size-5" />
          <span className="hidden text-[15px] font-medium text-[#e3e3e3] sm:inline">OpenNotebook</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="ml-auto flex items-center gap-2"
        >
          {user ? (
            <>
              <span className="hidden max-w-40 truncate rounded-full border border-white/10 bg-[#1e2227] px-3 py-1.5 text-[13px] text-[#e3e3e3] sm:inline">
                {user.name}
              </span>
              <UI.Button asChild variant="ghost" className="h-9 rounded-full px-4 text-sm text-[#e3e3e3] hover:bg-white/5">
                <Link to="/dashboard">Dashboard</Link>
              </UI.Button>
            </>
          ) : (
            <UI.Button asChild variant="ghost" className="h-9 rounded-full px-4 text-sm text-[#e3e3e3] hover:bg-white/5">
              <Link to="/login">Sign in</Link>
            </UI.Button>
          )}
          <UI.Button
            onClick={handleCreate}
            className="h-9 gap-2 rounded-full bg-white px-4 text-sm font-medium text-[#1b1b1b] shadow-sm transition-colors hover:bg-white/90"
          >
            <MdAdd className="size-4" />
            Create notebook
          </UI.Button>
        </motion.div>
      </header>

      <main className="flex-1">
        {}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-blue-500/[0.07] to-transparent"
          />
          <motion.div
            initial="hidden"
            animate="visible"
            className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28 sm:pb-20"
          >
            <motion.div variants={fadeUp} custom={0}>
              <HeroBadge />
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mt-6 text-4xl leading-[1.1] font-bold tracking-tight text-[#e3e3e3] sm:text-[44px]"
            >
              Ask anything.
              <span className="block text-[#8ab4f8]">Get answers you can trust.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#9aa0a6] sm:text-base"
            >
              OpenNotebook is a workspace for people who care about getting things right. Bring your material together, ask questions in your own words, and get answers you can stand behind — every response shows its work.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8">
              <UI.Button
                onClick={handleCreate}
                className="h-12 gap-2 rounded-full bg-white px-7 text-[15px] font-medium text-[#1b1b1b] shadow-lg shadow-black/30 transition-all hover:scale-[1.02] hover:bg-white/90"
              >
                <MdAutoAwesome className="size-5 text-[#4a6fd6]" />
                Create a notebook
                <MdChevronRight className="size-5" />
              </UI.Button>
            </motion.div>
            <motion.p
              variants={fadeUp}
              custom={4}
              className="mt-4 text-[13px] text-[#9aa0a6]"
            >
              Free to use — start a notebook and ask your first question today.
            </motion.p>
          </motion.div>
        </section>

        <HowItWorks />
        <HowToUse />
        <ReadyCta onOpen={handleCreate} />
      </main>

      {}
      <footer className="flex h-12 shrink-0 items-center justify-center border-t border-border bg-[#121417] px-4">
        <p className="text-[11px] text-[#9aa0a6]">OpenNotebook may make mistakes — please verify important information.</p>
      </footer>

      <Home.CreateNotebookDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

function HowItWorks() {
  return (
    <section className="border-t border-border bg-[#1a1d20]">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
          className="text-center text-xs font-semibold tracking-widest text-[#8ab4f8] uppercase"
        >
          How it works
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="mt-3 text-center text-[28px] font-bold tracking-tight text-[#e3e3e3] sm:text-3xl"
        >
          From question to confident answer in three steps.
        </motion.p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {HOW_STEPS.map((step, i) => {
            const Icon = HOW_ICONS[i] ?? MdMenuBook
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#1e2227] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#8ab4f8]/40 hover:shadow-lg hover:shadow-black/30"
              >
                <span className="pointer-events-none absolute top-5 right-5 text-3xl font-bold text-white/5 transition-colors group-hover:text-white/10">
                  0{i + 1}
                </span>
                <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-600/15 text-[#8ab4f8] ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#e3e3e3]">{step.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#9aa0a6]">{step.body}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function HowToUse() {
  return (
    <section className="bg-[#121417]">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
          className="text-center text-xs font-semibold tracking-widest text-[#8ab4f8] uppercase"
        >
          How to use it
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="mt-3 text-center text-[28px] font-bold tracking-tight text-[#e3e3e3] sm:text-3xl"
        >
          Four steps to your first answer — no learning curve.
        </motion.p>

        <ol className="mt-10 space-y-3">
          {USE_STEPS.map((step, i) => {
            const Icon = USE_ICONS[i] ?? MdChevronRight
            return (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, duration: 0.45, ease: "easeOut" }}
                className="group flex items-start gap-4 rounded-2xl border border-white/5 bg-[#1a1d20] p-5 transition-all duration-300 hover:border-white/15 hover:bg-[#1e2227]"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-[13px] font-semibold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="flex items-center gap-1.5 text-[15px] font-semibold text-[#e3e3e3]">
                    <Icon className="size-4 text-[#8ab4f8]" />
                    {step.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#9aa0a6]">{step.body}</p>
                </div>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

function ReadyCta({ onOpen }) {
  return (
    <section className="border-t border-border bg-[#1a1d20]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6"
      >
        <span className="animate-wave text-4xl" aria-hidden="true">
          👋
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-[#e3e3e3] sm:text-3xl">
          Ready to get better answers?
        </h2>
        <p className="max-w-md text-[15px] leading-relaxed text-[#9aa0a6]">
          Start a notebook and put it to work — it takes less than a minute.
        </p>
        <UI.Button
          onClick={onOpen}
          className="mt-2 h-11 gap-2 rounded-full bg-white px-6 text-[15px] font-medium text-[#1b1b1b] shadow-md shadow-black/20 transition-all hover:scale-[1.02] hover:bg-white/90"
        >
          Create a notebook
          <MdChevronRight className="size-5" />
        </UI.Button>
      </motion.div>
    </section>
  )
}

