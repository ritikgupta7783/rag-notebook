import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { MdAdd, MdBook, MdChevronRight, MdDelete, MdLogout, MdSchedule } from "react-icons/md"
import { Home } from "@/components/home"
import { Shared } from "@/components/shared"
import { UI } from "@/components/ui"
import { api } from "@/configs/axios"
import { useAuth } from "@/context/AuthContext"
import { toNotebook } from "@/utils/notebooks"

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" },
  }),
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function LoadingState() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#121417]">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-[#121417]/80 px-4 sm:px-6">
        <UI.Skeleton className="size-9 rounded-xl" />
        <div className="ml-auto flex items-center gap-2">
          <UI.Skeleton className="h-9 w-32 rounded-full" />
          <UI.Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <UI.Skeleton className="h-8 w-52" />
        <UI.Skeleton className="mt-3 h-4 w-64" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <UI.Skeleton key={i} className="min-h-40 rounded-2xl" />
          ))}
        </div>
      </main>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [notebooks, setNotebooks] = useState([])
  const [busy, setBusy] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    let mounted = true
    void api
      .get("/notebooks")
      .then(({ data }) => {
        if (mounted) setNotebooks(data.map(toNotebook))
      })
      .catch((error) =>
        toast.error(error.message || "Could not load your notebooks."),
      )
      .finally(() => {
        if (mounted) setBusy(false)
      })
    return () => {
      mounted = false
    }
  }, [user])

  async function handleLogout() {
    await logout()
    toast.success("Signed out — see you soon!")
    navigate("/")
  }

  function openNotebook(notebook) {

    navigate(`/notebook?id=${notebook.id}`)
  }

  async function confirmDelete() {
    if (!deleteTarget || deleteBusy) return
    setDeleteBusy(true)
    try {
      await api.delete(`/notebooks/${deleteTarget.id}`)
      setNotebooks((prev) => prev.filter((n) => n.id !== deleteTarget.id))
      toast.success(`"${deleteTarget.title}" deleted`)
    } catch (error) {
      toast.error(error.message || "Could not delete the notebook.")
    } finally {
      setDeleteTarget(null)
      setDeleteBusy(false)
    }
  }

  if (busy) return <LoadingState />

  return (
    <div className="flex min-h-dvh flex-col bg-[#121417] text-[#e3e3e3]">
      {}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-[#121417]/80 px-4 backdrop-blur-sm sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3 rounded-lg transition-opacity hover:opacity-80">
          <Shared.BrandMark className="size-9 [&>svg]:size-5" />
          <span className="hidden text-[15px] font-medium sm:inline">OpenNotebook</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden max-w-48 truncate rounded-full border border-white/10 bg-[#1e2227] px-3 py-1.5 text-[13px] text-[#e3e3e3] sm:inline">
            {user.name}
          </span>
          <UI.Button
            variant="ghost"
            onClick={handleLogout}
            aria-label="Sign out"
            className="h-9 gap-2 rounded-full border border-white/10 bg-[#1e2227] px-4 text-sm text-[#e3e3e3] hover:bg-[#262a30] hover:text-white"
          >
            <MdLogout className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </UI.Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your notebooks</h1>
          <p className="mt-1.5 text-[15px] text-[#9aa0a6]">
            {notebooks.length} {notebooks.length === 1 ? "notebook" : "notebooks"} · click one to open it
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {}
          <motion.button
            type="button"
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="visible"
            onClick={() => setCreateOpen(true)}
            className="group flex min-h-40 flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-white/15 bg-transparent text-[#9aa0a6] transition-all duration-300 hover:-translate-y-1 hover:border-[#8ab4f8]/50 hover:bg-white/[0.02] hover:text-[#e3e3e3]"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-[#262a30] transition-transform duration-300 group-hover:scale-110">
              <MdAdd className="size-6" />
            </span>
            <span className="text-sm font-medium">Create new notebook</span>
          </motion.button>

          {}
          {notebooks.map((notebook, i) => (
            <motion.div
              key={notebook.id}
              variants={fadeUp}
              custom={i + 1}
              initial="hidden"
              animate="visible"
              onClick={() => openNotebook(notebook)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  openNotebook(notebook)
                }
              }}
              role="button"
              tabIndex={0}
              className="group relative flex min-h-40 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#1a1d20] p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-black/30 focus-visible:ring-2 focus-visible:ring-[#3b82f6]/40 outline-none"
            >
              {}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-[#8ab4f8]/0 transition-colors duration-300 group-hover:bg-[#8ab4f8]/60"
              />

              <div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#8ab4f8]/10 text-[#8ab4f8] ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105">
                  <MdBook className="size-5" />
                </span>
                <h2 className="mt-3 line-clamp-2 text-[15px] leading-snug font-semibold text-[#e3e3e3]">
                  {notebook.title}
                </h2>
              </div>

              <div className="mt-4 flex items-center gap-3 text-xs text-[#7c8189]">
                <span className="flex items-center gap-1">
                  <MdSchedule className="size-3.5" />
                  Updated {formatDate(notebook.updatedAt)}
                </span>
                <span className="flex items-center gap-1">
                  {notebook.sourceCount} {notebook.sourceCount === 1 ? "source" : "sources"}
                </span>
                <MdChevronRight className="ml-auto size-4 text-[#7c8189] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#8ab4f8]" />
              </div>

              {}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteTarget(notebook)
                }}
                aria-label={`Delete ${notebook.title}`}
                className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-[#262a30] text-[#9aa0a6] opacity-0 ring-1 ring-white/10 transition-all duration-200 group-hover:opacity-100 hover:bg-red-500/15 hover:text-red-400 focus-visible:opacity-100"
              >
                <MdDelete className="size-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      <Home.CreateNotebookDialog open={createOpen} onOpenChange={setCreateOpen} />

      <UI.AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <UI.AlertDialogContent>
          <UI.AlertDialogHeader>
            <UI.AlertDialogTitle>Delete notebook?</UI.AlertDialogTitle>
            <UI.AlertDialogDescription>
              {`"${deleteTarget?.title ?? ""}" and all of its sources and chat history will be permanently deleted. This cannot be undone.`}
            </UI.AlertDialogDescription>
          </UI.AlertDialogHeader>
          <UI.AlertDialogFooter>
            <UI.AlertDialogCancel disabled={deleteBusy}>Cancel</UI.AlertDialogCancel>
            <UI.AlertDialogAction variant="destructive" onClick={confirmDelete} disabled={deleteBusy}>
              {deleteBusy ? "Deleting…" : "Delete"}
            </UI.AlertDialogAction>
          </UI.AlertDialogFooter>
        </UI.AlertDialogContent>
      </UI.AlertDialog>
    </div>
  )
}

