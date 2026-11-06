
"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Send,
  ChevronDown,
} from "lucide-react";

type FeedbackType = "review" | "error" | "resource" | "delete";

type FeedbackModalProps = {
  open: boolean;
  email: string;
  category: FeedbackType;
  message: string;
  files: File[];
  isSending: boolean;
  sendStatus: "idle" | "success" | "error";

  feedbackTypes: {
    title: string;
    description: string;
    value: FeedbackType;
  }[];

  onClose: () => void;
  onEmailChange: (value: string) => void;
  onCategoryChange: (value: FeedbackType) => void;
  onMessageChange: (value: string) => void;
  onFiles: (files: FileList | null) => void;
  onRemoveFile: (index: number) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const STORAGE_KEY = "feedback-draft-v1";

type SavedFile = {
  name: string;
  type: string;
  lastModified: number;
  data: string;
};

type SavedDraft = {
  email: string;
  category: FeedbackType;
  message: string;
  files: SavedFile[];
};

export default function FeedbackModal({
  open,
  email,
  category,
  message,
  files,
  isSending,
  sendStatus,
  feedbackTypes,
  onClose,
  onEmailChange,
  onCategoryChange,
  onMessageChange,
  onFiles,
  onRemoveFile,
  onSubmit,
}: FeedbackModalProps) {
  const restored = useRef(false);
  const restoring = useRef(false);
  const previousStatus = useRef(sendStatus);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Відновлення чернетки після першого відкриття
  useEffect(() => {
    if (!open || restored.current) return;

    restored.current = true;
    restoring.current = true;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const draft = JSON.parse(raw) as SavedDraft;

        onEmailChange(draft.email ?? "");
        onCategoryChange(draft.category ?? "review");
        onMessageChange(draft.message ?? "");

        const restoredFiles = (draft.files ?? []).map((file) => {
          const binary = atob(file.data);
          const bytes = new Uint8Array(binary.length);

          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          return new File([bytes], file.name, {
            type: file.type,
            lastModified: file.lastModified,
          });
        });

        if (restoredFiles.length > 0) {
          const transfer = new DataTransfer();

          restoredFiles.forEach((file) => transfer.items.add(file));
          onFiles(transfer.files);
        }
      }
    } catch (error) {
      console.error("Помилка відновлення чернетки:", error);
    }

    // Даємо React застосувати відновлені значення
    const timeout = window.setTimeout(() => {
      restoring.current = false;
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [
    open,
    onEmailChange,
    onCategoryChange,
    onMessageChange,
    onFiles,
  ]);

  // Автоматичне збереження полів та файлів
  useEffect(() => {
    if (!open || !restored.current || restoring.current) return;

    const timeout = window.setTimeout(async () => {
      try {
        const savedFiles = await Promise.all(
          files.map(
            (file) =>
              new Promise<SavedFile>((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = () => {
                  const result = String(reader.result);
                  const data = result.split(",")[1];

                  if (!data) {
                    reject(new Error("Не вдалося прочитати файл"));
                    return;
                  }

                  resolve({
                    name: file.name,
                    type: file.type,
                    lastModified: file.lastModified,
                    data,
                  });
                };

                reader.onerror = () => {
                  reject(new Error("Помилка читання файлу"));
                };

                reader.readAsDataURL(file);
              }),
          ),
        );

        const draft: SavedDraft = {
          email,
          category,
          message,
          files: savedFiles,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch (error) {
        console.error("Не вдалося зберегти чернетку:", error);
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [open, email, category, message, files]);

  // Видалення чернетки після успішного відправлення
  useEffect(() => {
    if (
      previousStatus.current !== "success" &&
      sendStatus === "success"
    ) {
      localStorage.removeItem(STORAGE_KEY);

      onEmailChange("");
      onCategoryChange("review");
      onMessageChange("");

      // Очищення файлів через наявний callback
      if (files.length > 0) {
        const emptyFiles = new DataTransfer();
        onFiles(emptyFiles.files);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }

    previousStatus.current = sendStatus;
  }, [
    sendStatus,
    files,
    onEmailChange,
    onCategoryChange,
    onMessageChange,
    onFiles,
  ]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSending) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative flex max-h-[75vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--rule)] bg-[var(--paper-r)] shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--rule)] bg-[var(--paper-r)] px-5 py-5 sm:px-8">
              <div>
                <div className="mb-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Зворотний зв'язок
                </div>

                <h2
                  className="text-2xl font-medium sm:text-4xl"
                  style={{ fontFamily: "'Unbounded', sans-serif" }}
                >
                  Напишіть нам
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--rule)] transition-colors hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Закрити"
              >
                <X size={18} />
              </button>
            </div>

            {/* SCROLL AREA */}
            <div
              className="feedback-scrollbar min-h-0 overflow-y-auto"
              style={{ margin: "0 4px 4px 0" }}
            >
              <form onSubmit={handleSubmit} className="p-5 sm:p-8">
                <div className="grid gap-6">
                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="feedback-email"
                      className="mb-2 block text-sm font-medium uppercase tracking-[0.12em]"
                    >
                      Пошта
                    </label>

                    <input
                      id="feedback-email"
                      type="email"
                      value={email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-xl border border-[var(--rule)] bg-[var(--paper-l)] px-4 py-3 text-base outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                    />
                  </div>

                  {/* CATEGORY */}
                  <div>
                    <label
                      htmlFor="feedback-category"
                      className="mb-2 block text-sm font-medium uppercase tracking-[0.12em]"
                    >
                      Категорія
                    </label>

                    <div className="relative">
                      <select
                        id="feedback-category"
                        value={category}
                        onChange={(e) =>
                          onCategoryChange(e.target.value as FeedbackType)
                        }
                        className="w-full cursor-pointer appearance-none rounded-xl border border-[var(--rule)] bg-[var(--paper-l)] px-4 py-3 pr-12 text-base outline-none transition-colors focus:border-[var(--accent)]"
                      >
                        {feedbackTypes.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.title}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                      />
                    </div>
                  </div>

                  {/* MESSAGE */}
                  <div>
                    <label
                      htmlFor="feedback-message"
                      className="mb-2 block text-sm font-medium uppercase tracking-[0.12em]"
                    >
                      Повідомлення
                    </label>

                    <textarea
                      id="feedback-message"
                      value={message}
                      onChange={(e) => onMessageChange(e.target.value)}
                      placeholder="Напишіть ваше повідомлення..."
                      required
                      rows={7}
                      className="w-full resize-y rounded-xl border border-[var(--rule)] bg-[var(--paper-l)] px-4 py-3 text-base leading-7 outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                    />
                  </div>

                  {/* FILE UPLOAD */}
                  <div>
                    <label className="mb-2 block text-sm font-medium uppercase tracking-[0.12em]">
                      Фотографії
                    </label>

                    <label
                      htmlFor="feedback-images"
                      className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--rule)] bg-[var(--paper-l)] px-6 py-8 text-center transition-colors hover:border-[var(--accent)]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--rule)] transition-colors group-hover:border-[var(--accent)]">
                        <Upload size={20} />
                      </div>

                      <p className="mt-4 font-medium">
                        Додати фотографії
                      </p>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        PNG, JPG, WEBP
                      </p>

                      <input
                        ref={fileInputRef}
                        id="feedback-images"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          onFiles(e.target.files);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>

                    {/* FILES */}
                    {files.length > 0 && (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {files.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-3 rounded-xl border border-[var(--rule)] bg-[var(--paper-l)] p-3"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--paper-r)]">
                              <ImageIcon size={17} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {file.name}
                              </p>

                              <p className="text-xs text-[var(--muted)]">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemoveFile(index)}
                              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/5"
                              aria-label={`Видалити ${file.name}`}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* STATUS */}
                {sendStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700"
                  >
                    Повідомлення успішно відправлено.
                  </motion.div>
                )}

                {sendStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700"
                  >
                    Не вдалося відправити повідомлення. Спробуйте ще раз.
                  </motion.div>
                )}

                {/* SUBMIT */}
                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSending}
                    className="cursor-pointer rounded-xl border border-[var(--rule)] px-6 py-3 text-sm font-medium transition-colors hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Скасувати
                  </button>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--paper-r)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={16} />
                    {isSending ? "Відправлення..." : "Надіслати"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
