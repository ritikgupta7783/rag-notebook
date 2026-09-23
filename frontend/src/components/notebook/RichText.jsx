import ReactMarkdown from "react-markdown"
import { cn } from "@/utils/cn"

export function RichText({
  content,
  streaming,
  className,
}) {
  if (!content.trim() && streaming) {
    return (
      <span className="flex gap-1 py-1" aria-label="Thinking">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="leading-relaxed">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em>{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1 pl-5">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          h1: ({ children }) => (
            <h1 className="text-xl font-bold tracking-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold tracking-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold tracking-tight">{children}</h3>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-muted pl-3 text-muted-foreground italic">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[13px]">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[13px] leading-relaxed [&>code]:bg-transparent [&>code]:p-0">
              {children}
            </pre>
          ),
          hr: () => <hr className="border-muted" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
