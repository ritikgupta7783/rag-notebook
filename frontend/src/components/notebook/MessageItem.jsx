import { MdAutoAwesome } from "react-icons/md"
import { RichText } from "./RichText"

export function MessageItem({ message, usertype = "assistant", streaming }) {
  if (usertype === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[18px] rounded-br-[6px] bg-bubble px-4 py-2.5 text-[15px] text-bubble-foreground shadow-sm sm:max-w-[75%]">
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-sm">
        <MdAutoAwesome className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-[15px] text-foreground">
          <RichText
            content={message.content}
            streaming={streaming}
          />
        </div>
      </div>
    </div>
  )
}
