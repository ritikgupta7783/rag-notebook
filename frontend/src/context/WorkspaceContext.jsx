import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/configs/axios";
import { toMessage, toSource } from "@/utils/notebooks";

const WorkspaceContext = createContext(null);

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function isCanceled(error) {
  return (
    error?.code === "ERR_CANCELED" ||
    error?.name === "CanceledError" ||
    error?.name === "AbortError"
  );
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    let timer;
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

async function pollForAnswer({ notebookId, afterId, signal }) {
  const timeoutMs = 90000;
  const intervalMs = 1200;
  const maxConsecutiveErrors = 5;
  const deadline = Date.now() + timeoutMs;
  let consecutiveErrors = 0;

  while (Date.now() < deadline) {
    let history;
    try {
      const { data } = await api.get("/ask", {
        params: { notebook_id: notebookId },
        signal,
      });
      history = data;
      consecutiveErrors = 0;
    } catch (error) {

      if (isCanceled(error)) throw error;
      consecutiveErrors += 1;
      if (consecutiveErrors >= maxConsecutiveErrors) {
        throw new Error("Could not reach the server. Please try again.");
      }
      await delay(intervalMs, signal);
      continue;
    }

    const index = history.findIndex((m) => m.id === afterId);
    const answer =
      index === -1
        ? undefined
        : history.slice(index + 1).find((m) => m.role === "assistant");

    if (answer) return answer;

    await delay(intervalMs, signal);
  }

  throw new Error("The answer took too long. Please try again.");
}

function revealAnswer(assistantId, answer, setMessages, timerRef) {
  return new Promise((resolve) => {
    const words = (answer.content ?? "").split(" ");

    const duration = Math.min(2600, Math.max(600, words.length * 14));
    const delay = duration / words.length;
    let index = 0;

    timerRef.current = setInterval(() => {
      index += 1;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: words.slice(0, index).join(" ") }
            : m,
        ),
      );

      if (index >= words.length) {
        clearInterval(timerRef.current);
        timerRef.current = null;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, ...toMessage(answer), id: assistantId }
              : m,
          ),
        );
        resolve();
      }
    }, delay);
  });
}

export function WorkspaceProvider({ children }) {
  const [searchParams] = useSearchParams();
  const notebookId = searchParams.get("id")?.trim() || "";
  const [notebookTitle, setNotebookTitle] = useState("");
  const [uploads, setUploads] = useState([]);

  const [sources, setSources] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sourcesReady, setSourcesReady] = useState(false);
  const [messagesReady, setMessagesReady] = useState(false);

  const abortRef = useRef(null);
  const timerRef = useRef(null);
  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  const [loadErrorShown, setLoadErrorShown] = useState(false);

  useEffect(() => {
    if (!notebookId) return;
    let mounted = true;
    api
      .get(`/notebooks/${notebookId}`)
      .then(({ data }) => {
        if (mounted) setNotebookTitle(data.title);
      })
      .catch(() => {
        if (mounted) setNotebookTitle("Untitled notebook");
      });
    return () => {
      mounted = false;
    };
  }, [notebookId]);

  const refreshSources = useCallback(async () => {
    if (!notebookId) {
      setSourcesReady(true);
      return;
    }
    try {
      const { data } = await api.get("/sources", {
        params: { notebook_id: notebookId },
      });
      setSources(data.map(toSource));
      setLoadErrorShown(false);
    } catch (error) {
      if (!loadErrorShown) {
        setLoadErrorShown(true);
        toast.error(error.message || "Could not load sources.");
      }
    } finally {
      setSourcesReady(true);
    }
  }, [notebookId, loadErrorShown]);

  useEffect(() => {
    void refreshSources();
  }, [refreshSources]);

  useEffect(() => {
    const busy = sources.some(
      (s) => s.status === "uploading" || s.status === "processing",
    );
    if (!busy) return undefined;
    const timer = setInterval(() => void refreshSources(), 2500);
    return () => clearInterval(timer);
  }, [sources, refreshSources]);

  const loadMessages = useCallback(async () => {
    if (!notebookId) {
      setMessagesReady(true);
      return;
    }
    try {
      const { data } = await api.get("/ask", {
        params: { notebook_id: notebookId },
      });
      setMessages(data.map(toMessage));
    } catch (error) {

      if (error.response?.status !== 401) {
        toast.error(error.message || "Could not load chat history.");
      }
    } finally {
      setMessagesReady(true);
    }
  }, [notebookId]);

  useEffect(() => {
    setMessages([]);
    void loadMessages();
  }, [notebookId, loadMessages]);

  const uploadSources = useCallback(
    async (files) => {
      if (!notebookId) throw new Error("No notebook selected.");
      const uploaded = [];
      const failed = [];
      const items = files.map((file, i) => ({
        key: `${file.name}-${i}-${Date.now()}`,
        name: file.name,
        progress: 0,
      }));
      setUploads((prev) => [...prev, ...items]);
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const item = items[i];
        try {
          const form = new FormData();
          form.append("file", file);
          const { data } = await api.post("/sources", form, {
            params: { notebook_id: notebookId },
            onUploadProgress: (e) => {
              if (!e.total) return;
              const pct = Math.min(100, Math.round((e.loaded / e.total) * 100));
              setUploads((prev) =>
                prev.map((u) =>
                  u.key === item.key ? { ...u, progress: pct } : u,
                ),
              );
            },
          });
          const source = toSource(data);
          uploaded.push(source);
          setSources((prev) => [source, ...prev]);
          setUploads((prev) => prev.filter((u) => u.key !== item.key));
        } catch (error) {
          failed.push({
            name: file.name,
            message: error.message || "Upload failed",
          });
          setUploads((prev) => prev.filter((u) => u.key !== item.key));
        }
      }
      return { uploaded, failed };
    },
    [notebookId],
  );

  const removeSource = useCallback(async (id) => {
    await api.delete(`/sources/${id}`);
    setSources((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const renameNotebook = useCallback(
    async (title) => {
      const clean = title.trim();
      if (!clean || !notebookId) return;
      await api.patch(`/notebooks/${notebookId}`, { title: clean });
      setNotebookTitle(clean);
    },
    [notebookId],
  );

  const sendMessage = useCallback(
    async (text) => {
      if (!notebookId) return;
      const userMsg = {
        id: uid("msg"),
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };
      const assistantId = uid("msg");
      const assistantSeed = {
        id: assistantId,
        role: "assistant",
        status: "streaming",
        content: "",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantSeed]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {

        const { data } = await api.post(
          "/ask",
          { question: text, notebook_id: notebookId },
          { signal: controller.signal },
        );

        const answer = await pollForAnswer({
          notebookId,
          afterId: data.id,
          signal: controller.signal,
        });

        if (answer.status === "failed") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, ...toMessage(answer), id: assistantId }
                : m,
            ),
          );
          toast.error(answer.content || "Could not get an answer.");
        } else {
          await revealAnswer(assistantId, answer, setMessages, timerRef);
        }
      } catch (error) {
        if (isCanceled(error)) return;
        const detail = error.message || "Could not get an answer.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, status: "failed", content: detail }
              : m,
          ),
        );
        toast.error(detail);
      } finally {
        abortRef.current = null;
      }
    },
    [notebookId],
  );

  return (
    <WorkspaceContext.Provider
      value={{
        notebookId,
        notebookTitle,
        sources,
        messages,
        uploads,
        sourcesLoading: !sourcesReady,
        messagesLoading: !messagesReady,
        uploadSources,
        removeSource,
        sendMessage,
        renameNotebook,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return ctx;
}

