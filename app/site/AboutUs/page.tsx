'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Bug,
  MessageCircle,
  PlusCircle,
  Trash2,
  Code2,
  Database,
  Palette,
  MapPin,
  Lightbulb
} from 'lucide-react';

const developers = [
  {
    name: 'Ткаченко Дмитро Олександрович',
    role: 'Розробник порталу',
    description:
      'Розробка та технічна реалізація порталу',
    icon: Code2,
  },
  {
    name: 'Холупняк Катерина Олександрівна',
    role: 'Автор ідеї',
    description:
      'Концепція та стратегія розвитку',
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
    description: 'Поділіться враженнями або розкажіть, що можна зробити краще.',
    icon: MessageCircle,
    href: '/site/feedback?type=review',
  },
  {
    title: 'Повідомити про помилку',
    description: 'Знайшли неточність, несправність або проблему на сайті?',
    icon: Bug,
    href: '/site/feedback?type=error',
  },
  {
    title: 'Запропонувати ресурс',
    description: 'Знаєте про місце, подію чи ресурс, якого ще немає на сайті?',
    icon: PlusCircle,
    href: '/site/feedback?type=resource',
  },
  {
    title: 'Видалити ресурс',
    description: 'Потрібно видалити або виправити інформацію про певний ресурс?',
    icon: Trash2,
    href: '/site/feedback?type=delete',
  },
];

const reveal = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden text-[var(--ink)]">
     

      {/* ABOUT + DEVELOPERS */}
      <section id="about" className="px-5 pt-20 sm:px-8 lg:px-14 ">
        <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
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
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="group grid gap-5 py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--rule)] transition-colors group-hover:border-[var(--accent)]">
                      <Icon size={19} />
                    </div>

                    <div>
                      <p className="text-xl font-medium">{developer.role}</p>
                      <p className="mt-1 uppercase tracking-[0.12em] text-[var(--muted)]">
                        {developer.name}
                      </p>
                      <p className="text-base leading-7 text-[var(--muted)] sm:text-lg">
                        {developer.description}
                      </p>
                    </div>

                    <span className="text-sm text-[var(--muted)]">0{index + 1}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>


      {/* FEEDBACK */}
      <section className="px-5 py-20 sm:px-8 lg:px-14">
        <div className="mx-auto max-w-[1500px]">
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

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {feedbackTypes.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.55, delay: index * 0.07 }}
                >
                  <Link
                    href={item.href}
                    className="group flex h-full min-h-[245px] flex-col justify-between rounded-2xl border border-[var(--rule)] bg-[var(--paper-l)] p-6 no-underline transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)] sm:p-7"
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
                      <h3 className="text-xl font-medium sm:text-2xl">{item.title}</h3>
                      <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section className="border-t border-[var(--rule)] px-5 py-8 sm:px-8 lg:px-14">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>Туристичний портал Черкас</span>
          <span>Місто над Дніпром · 2026</span>
        </div>
      </section>
    </main>
  );
}
