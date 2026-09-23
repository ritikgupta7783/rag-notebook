import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { MdAutoAwesome } from "react-icons/md"
import { UI } from "@/components/ui"
import { api } from "@/configs/axios"
import { toNotebook } from "@/utils/notebooks"

export function CreateNotebookDialog({ open, onOpenChange }) {
  const [title, setTitle] = useState("")
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setTitle("")
      setBusy(false)
    }
  }, [open])

  async function submit() {
    const clean = title.trim()
    if (!clean || busy) return

    setBusy(true)
    try {
      const { data } = await api.post("/notebooks", { title: clean })
      const notebook = toNotebook(data)
      onOpenChange(false)
      navigate(`/notebook?id=${notebook.id}`)
    } catch (error) {
      toast.error(error.message || "Could not create the notebook. Please try again.")
      setBusy(false)
    }
  }

  return (
    <UI.Dialog open={open} onOpenChange={onOpenChange}>
      <UI.DialogContent className="sm:max-w-md">
        <UI.DialogHeader>
          <UI.DialogTitle className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white">
              <MdAutoAwesome className="size-4" />
            </span>
            Create a new notebook
          </UI.DialogTitle>
          <UI.DialogDescription>Give your notebook a title — you can rename it later.</UI.DialogDescription>
        </UI.DialogHeader>

        <div className="grid gap-2">
          <UI.Label htmlFor="notebook-title">Notebook title</UI.Label>
          <UI.Input
            id="notebook-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="e.g. Machine Learning"
            maxLength={80}
            autoFocus
          />
        </div>

        <UI.DialogFooter>
          <UI.Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </UI.Button>
          <UI.Button onClick={submit} disabled={!title.trim() || busy}>
            {busy ? "Creating…" : "Create notebook"}
          </UI.Button>
        </UI.DialogFooter>
      </UI.DialogContent>
    </UI.Dialog>
  )
}

