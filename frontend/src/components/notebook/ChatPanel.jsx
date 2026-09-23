import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MdArrowUpward, MdAutoAwesome, MdDescription } from "react-icons/md"
import { UI } from "@/components/ui"
import { useWorkspace } from "@/context/WorkspaceContext"
import { cn } from "@/utils/cn"
import { MessageItem } from "./MessageItem"

function ChatSkeleton() {
  return (
    <div className="flex flex-1 flex-col justify-end gap-7">
      <div className="flex gap-3">
        <UI.Skeleton className="mt-0.5 size-8 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <UI.Skeleton className="h-3.5 w-3/4" />
          <UI.Skeleton className="h-3.5 w-1/2" />
        </div>
      </div>
      <div className="flex justify-end">
        <UI.Skeleton className="h-10 w-2/3 rounded-[18px] rounded-br-[6px]" />
      </div>
      <div className="flex gap-3">
        <UI.Skeleton className="mt-0.5 size-8 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <UI.Skeleton className="h-3.5 w-2/3" />
          <UI.Skeleton className="h-3.5 w-1/3" />
        </div>
      </div>
      <div className="flex gap-3">
        <UI.Skeleton className="mt-0.5 size-8 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <UI.Skeleton className="h-3.5 w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function ChatPanel() {
  const { messages, sendMessage, messagesLoading } = useWorkspace()
  const [value, setValue] = useState("")
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  const isStreaming = messages.some((m) => m.status === "streaming")
  const empty = messages.length === 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length, isStreaming])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [value])

  function submit() {
    const text = value.trim()
    if (!text || isStreaming) return
    void sendMessage(text)
    setValue("")
    textareaRef.current?.focus()
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[#1a1d20]">
      {}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-8 sm:px-8">
          {empty ? (
            messagesLoading ? (
              <ChatSkeleton />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative flex flex-1 flex-col items-center justify-center overflow-hidden text-center"
              >
                {}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-purple-600/15 blur-3xl"
                />

                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
                  className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20"
                >
                  <MdAutoAwesome className="size-8 text-white" />
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.4, ease: "easeOut" }}
                  className="relative mt-6 text-[28px] font-bold tracking-tight text-[#e3e3e3] sm:text-[30px]"
                >
                  Let's start your notebook…
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26, duration: 0.4, ease: "easeOut" }}
                  className="relative mt-3 max-w-md text-[15px] leading-relaxed text-[#9aa0a6]"
                >
                  Ask anything about your sources and get clear answers grounded in your
                  uploaded documents.
                </motion.p>
              </motion.div>
            )
          ) : (
            <div className="flex flex-1 flex-col justify-end gap-7">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <MessageItem
                      message={message}
                      usertype={message.role}
                      streaming={message.status === "streaming"}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 pb-4 sm:px-8">
        <div
          className={cn(
            "flex items-end gap-2 rounded-[26px] border border-white/10 bg-[#22262b] px-4 py-2.5 transition-all duration-200",
            "focus-within:border-[#3b82f6]/40 focus-within:shadow-lg focus-within:shadow-blue-500/10 focus-within:ring-2 focus-within:ring-[#3b82f6]/25",
          )}
        >
          <UI.Textarea
            id="chat-composer"
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Ask a question about your sources…"
            rows={1}
            className="text-[15px] text-[#e3e3e3] shadow-none focus-visible:ring-0 placeholder:text-[#7c8189]"
          />

          <button
            type="button"
            onClick={submit}
            disabled={isStreaming || !value.trim()}
            aria-label="Send message"
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-200",
              isStreaming || !value.trim()
                ? "bg-[#2a2e33] text-[#9aa0a6]"
                : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/40 active:scale-95",
            )}
          >
            <MdArrowUpward className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

