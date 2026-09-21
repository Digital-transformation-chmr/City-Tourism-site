'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Bug,
  MessageCircle,
  PlusCircle,
  Trash2,
  Code2,
  Database,
  MapPin,
  Lightbulb,
  X,
  Upload,
  Image as ImageIcon,
  Send,
  ChevronDown,
} from 'lucide-react';

const developers = [
  {
    name: 'Ткаченко Дмитро Олександрович',
    role: 'Розробник порталу',
    description: 'Розробка та технічна реалізація порталу',
    icon: Code2,
  },
  {
    name: 'Холупняк Катерина Олександрівна',
    role: 'Автор ідеї',
    description: 'Концепція та стратегія розвитку',
    icon: Lightbulb,
  },
  {
    name: 'КП «Інститут розвитку міста та цифрової трансформації» ЧМР',
    role: 'Адміністрування порталу',
    description:
      'Формування сучасного візуального стилю, типографіки та подачі інформації про Черкаси.',
    icon: Database,
  },
];

const feedbackTypes = [
  {
    title: 'Відгук',
    description:
      'Поділіться враженнями або розкажіть, що можна зробити краще.',
    icon: MessageCircle,
    value: 'review',
  },
  {
    title: 'Повідомити про помилку',
    description:
      'Знайшли неточність, несправність або проблему на сайті?',
    icon: Bug,
    value: 'error',
  },
  {
    title: 'Запропонувати ресурс',
    description:
      'Знаєте про місце, подію чи ресурс, якого ще немає на сайті?',
    icon: PlusCircle,
    value: 'resource',
  },
  {
    title: 'Видалити ресурс',
    description:
      'Потрібно видалити або виправити інформацію про певний ресурс?',
    icon: Trash2,
    value: 'delete',
  },
];

const reveal = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  show: {
    opacity: 1,
    y: 0,
  },
};

type FeedbackType = 'review' | 'error' | 'resource' | 'delete';

export default function AboutPage() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<FeedbackType>('review');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const openFeedback = (type: FeedbackType) => {
    setCategory(type);
    setFeedbackOpen(true);
    setSendStatus('idle');
  };

  const closeFeedback = () => {
    if (isSending) return;

    setFeedbackOpen(false);
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const selectedFiles = Array.from(newFiles).filter((file) =>
      file.type.startsWith('image/')
    );

    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !message.trim()) {
      return;
    }

    setIsSending(true);
    setSendStatus('idle');

    try {
      const formData = new FormData();

      formData.append('email', email);
      formData.append('category', category);
      formData.append('message', message);

      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/feedback', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Не вдалося відправити звернення');
      }

      setSendStatus('success');

      setEmail('');
      setMessage('');
      setFiles([]);

      setTimeout(() => {
        setFeedbackOpen(false);
        setSendStatus('idle');
      }, 1500);
    } catch (error) {
      console.error(error);
      setSendStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden text-[var(--ink)]">
      {/* ABOUT + DEVELOPERS */}
      <section id="about" className="px-10 mx-2 pt-20">
        <div className="mx-auto grid  gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          {/* ABOUT */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-7 flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
              <span>01</span>
              <span className="h-px w-10 bg-[var(--rule)]" />
              Про сайт
            </div>

            <h2
              className="max-w-2xl text-4xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-6xl"
              style={{ fontFamily: "'Unbounded', sans-serif" }}
            >
              Черкаси — це більше, ніж точка на карті.
            </h2>

            <div className="mt-8 max-w-xl space-y-5 text-lg leading-8 text-[var(--muted)] sm:text-xl">
              <p>
                Ми створюємо сучасний туристичний путівник, який збирає в одному
                місці цікаві локації міста, гастрономію, події, історію та
                практичну інформацію для подорожей.
              </p>

              <p>
                Наша мета — зробити відкриття Черкас простим. Щоб за кілька
                хвилин можна було знайти нове місце, дізнатися його історію,
                подивитися фотографії та побудувати маршрут.
              </p>

              <p>
                Сайт розвивається разом із містом, тому для нас важливі актуальні
                дані, нові ресурси та зворотний зв’язок від людей, які ним
                користуються.
              </p>
            </div>

            <div className="mt-10 flex items-center gap-3 text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
              <MapPin size={16} />
              Черкаси, Україна
            </div>
          </motion.div>

          {/* DEVELOPERS */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.08 }}
          >
            <div className="mb-7 flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
              <span>02</span>
              <span className="h-px w-10 bg-[var(--rule)]" />
              Розробники
            </div>

            <h3
              className="text-3xl font-medium tracking-[-0.03em] sm:text-5xl"
              style={{ fontFamily: "'Unbounded', sans-serif" }}
            >
              Люди за сайтом
            </h3>

            <div className="mt-8 divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
              {developers.map((developer, index) => {
                const Icon = developer.icon;

                return (
                  <motion.div
                    key={developer.name}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                    }}
                    className="group grid gap-5 py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--rule)] transition-colors group-hover:border-[var(--accent)]">
                      <Icon size={19} />
                    </div>

                    <div>
                      <p className="text-xl font-medium">
                        {developer.role}
                      </p>

                      <p className="mt-1 uppercase tracking-[0.12em] text-[var(--muted)]">
                        {developer.name}
                      </p>

                      <p className="text-base leading-7 text-[var(--muted)] sm:text-lg">
                        {developer.description}
                      </p>
                    </div>

                    <span className="text-sm text-[var(--muted)]">
                      0{index + 1}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEEDBACK */}
      <section className="px-10 py-20 mx-2">
        <div className="">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65 }}
            className="max-w-3xl"
          >
            <div className="mb-7 flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
              <span>03</span>
              <span className="h-px w-10 bg-[var(--rule)]" />
              Зворотній зв'язок
            </div>

            <h2
              className="text-4xl font-medium leading-tight tracking-[-0.03em] sm:text-6xl"
              style={{ fontFamily: "'Unbounded', sans-serif" }}
            >
              Допоможіть нам зробити сайт кращим.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
              Оберіть тип звернення — і ми зможемо швидше зрозуміти, що саме ви
              хочете нам повідомити.
            </p>
          </motion.div>

          {/* FEEDBACK CARDS */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {feedbackTypes.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.07,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => openFeedback(item.value as FeedbackType)}
                    className="group flex h-full min-h-[245px] w-full cursor-pointer flex-col justify-between rounded-2xl border border-[var(--rule)] bg-[var(--paper-l)] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)] sm:p-7"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--paper-r)]">
                        <Icon size={20} />
                      </div>

                      <ArrowUpRight
                        size={18}
                        className="text-[var(--muted)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[var(--ink)]"
                      />
                    </div>

                    <div className="mt-8">
                      <h3 className="text-xl font-medium sm:text-2xl">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                        {item.description}
                      </p>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section className="border-t border-[var(--rule)] px-10 py-8 mx-2">
        <div className="mx-auto flex flex-col gap-3 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>Туристичний портал Черкас</span>
          <span>Місто над Дніпром · 2026</span>
        </div>
      </section>

      {/* FEEDBACK MODAL */}
      <AnimatePresence>
        {feedbackOpen && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                closeFeedback();
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
             className="feedback-scrollbar relative max-h-[75vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[var(--rule)] bg-[var(--paper-r)] shadow-2xl"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--rule)] bg-[var(--paper-r)] px-5 py-5 sm:px-8">
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
                  onClick={closeFeedback}
                  disabled={isSending}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--rule)] transition-colors hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Закрити"
                >
                  <X size={18} />
                </button>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="p-5">
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
                      onChange={(e) => setEmail(e.target.value)}
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
                          setCategory(e.target.value as FeedbackType)
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
                      onChange={(e) => setMessage(e.target.value)}
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
                          handleFiles(e.target.files);
                          e.currentTarget.value = '';
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
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--paper-r)]">
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
                              onClick={() => removeFile(index)}
                              className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/5"
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
                {sendStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700"
                  >
                    Повідомлення успішно відправлено.
                  </motion.div>
                )}

                {sendStatus === 'error' && (
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
                    onClick={closeFeedback}
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

                    {isSending ? 'Відправлення...' : 'Надіслати'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}