import { Toaster as Sonner } from "sonner"
import {
  MdCheckCircle,
  MdInfo,
  MdWarning,
  MdCancel,
  MdHourglassTop,
} from "react-icons/md"

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <MdCheckCircle className="size-4" />,
        info: <MdInfo className="size-4" />,
        warning: <MdWarning className="size-4" />,
        error: <MdCancel className="size-4" />,
        loading: <MdHourglassTop className="size-4 animate-spin" />,
      }}
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
      }}
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

