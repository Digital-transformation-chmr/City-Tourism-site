
"use client";

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
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
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
                  Зворотній зв'язок
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
            <div className="feedback-scrollbar min-h-0 overflow-y-auto"
                style={{ margin: "0 4px 4px 0" }}>
              {/* FORM */}
              <form onSubmit={onSubmit} className="p-5 sm:p-8">
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