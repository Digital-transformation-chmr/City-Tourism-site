import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

/* ================= TYPES ================= */
export interface NewsItem {
  id: string;
  content?: string;
  title?: string;
  description?: string;
  image: string | null;
  publishedAt?: string | Date;
  date?: string;
  category?: string;
  telegramId?: string | number;
}

/* ================= PARSER ================= */
function parseTelegramContent(content: string = "") {
  if (!content) {
    return {
      title: "Подія",
      description: "",
    };
  }

  const cleanContent = content
    .replace(/Підписуйтесь на канал:[\s\S]*/g, "")
    .replace(/🎭 Запропонувати подію.*/g, "")
    .replace(/📩 Замовити рекламу.*/g, "")
    .trim();

  const lines = cleanContent.split("\n").map(l => l.trim()).filter(Boolean);

  let title = lines[0] || "Цікава подія";
  title = title.replace(/^(📌|🎶|🚀|👋|🎙️|💃|☀️|💜|🌲)\s*(Куди піти:\s*)?/i, "");

  const description = lines.slice(1).join("\n");

  return { title, description };
}

/* ================= MAIN COMPONENT ================= */
/* ================= MAIN COMPONENT ================= */
export default function TelegramEventsSection({ items }: { items: NewsItem[] }) {
  // Фільтруємо масив, залишаючи тільки елементи з фото, і беремо перші 4 для сітки 2x2
  const displayItems = items.filter(item => item.image !== null && item.image !== undefined).slice(0, 4);
  const channel = process.env.NEXT_PUBLIC_TG_CHANNEL || "kudypityCherkasy";

  return (
    <motion.section
      id="kudy"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.1 } },
      }}
      className="relative overflow-hidden py-20  bg-[#071a2e]"
    >

      <div className="relative mx-2 px-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center z-10">
        
        {/* ================= ЛІВА КОЛОНКА (ТЕКСТ) ================= */}
        <motion.div
          variants={{
            hidden: { opacity: 0, x: -30 },
            show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[oklch(0.99_0.002_90)]/12 text-[oklch(0.99_0.002_90)] text-sm font-semibold mb-5 select-none">
            Telegram-канал
          </div>
          
          <h2 className="font-['Unbounded',sans-serif] text-4xl font-bold text-[oklch(0.99_0.002_90)] mb-4 leading-snug">
            «Куди піти?» — щодня свіжі події
          </h2>
          
          <p className="text-[oklch(0.92_0.02_250)] text-base leading-relaxed max-w-lg mb-7">
            Концерти, ярмарки, виставки та маркети Черкас — все в одному каналі. 
            Приєднуйся, щоб не пропустити найцікавіше цього тижня.
          </p>
          
          <a
            href={`https://t.me/${channel}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-4 bg-[oklch(0.55_0.19_25)] text-[oklch(0.99_0.002_90)] font-semibold rounded-xl text-base no-underline transition-transform duration-300 hover:scale-105 active:scale-95 shadow-md"
          >
            Підписатись у Telegram →
          </a>
        </motion.div>

        {/* ================= ПРАВА КОЛОНКА (WIDGET 2x2) ================= */}
        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            show: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
          }}
          className="bg-[oklch(0.99_0.002_90)] rounded-[20px] p-5 md:p-6 flex flex-col gap-4 shadow-xl"
        >
          {/* Telegram Header MOCK */}
          <div className="flex items-center gap-3 pb-3 border-b border-[oklch(0.9_0.02_70)] select-none">
            <div className="relative w-10 h-10 mb-5 rounded-xl overflow-hidden select-none">
              <Image
                src="/telegramLogo.jpg"
                alt="Telegram"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <div>
              <div className="font-bold text-lg text-[oklch(0.22_0.05_250)]">Куди піти? Черкаси</div>
              <div className="text-xs text-[oklch(0.5_0.04_250)]">@{channel}</div>
            </div>
          </div>

          {/* SGRID 2x2 OF CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {displayItems.length > 0 ? (
              displayItems.map((item, idx) => {
                const { title, description } = parseTelegramContent(item.content);
                const cardTitle = item.title || title;
                const cardDesc = item.description || description;
                const postLink = `https://t.me/${channel}/${item.telegramId || ""}`;

                return (
                  <motion.a
                    key={item.id || idx}
                    href={postLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="flex flex-col justify-between p-3.5 rounded-xl bg-[oklch(0.94_0.02_70)] border border-[oklch(0.9_0.02_70)]/30 no-underline group transition-shadow hover:shadow-md"
                  >
                    <div>
                      {item.image && (
                        <div className="relative w-full h-24 rounded-lg overflow-hidden mb-2.5">
                          <Image
                            src={item.image}
                            alt={cardTitle}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="text-[11px] font-bold text-[oklch(0.46_0.19_25)] uppercase tracking-wide mb-1">
                        {item.date || "Анонс"}
                      </div>
                      
                      <h4 className="font-semibold text-sm text-[oklch(0.22_0.05_250)] line-clamp-1 group-hover:text-[oklch(0.42_0.13_250)] transition-colors mb-1">
                        {cardTitle}
                      </h4>
                      
                      <p className="text-xs text-[oklch(0.42_0.04_250)] line-clamp-2 leading-normal">
                        {cardDesc}
                      </p>
                    </div>

                    <div className="text-sm font-medium text-[oklch(0.42_0.13_250)] mt-2.5 flex items-center gap-1">
                      Читати в TG <span>→</span>
                    </div>
                  </motion.a>
                );
              })
            ) : (
              <>
                {[
                  { date: "Сьогодні, 18:00", title: "Джаз-вечір на набережній", place: "Набережна Дніпра" },
                  { date: "Завтра, 11:00", title: "Ярмарок ремісників", place: "Центральна площа" },
                  { date: "Субота, 19:00", title: "Кіно під відкритим небом", place: "Парк Слави" },
                  { date: "Неділя, 16:00", title: "Ворワークшоп з живопису", place: "Студія 'Арт'" }
                ].map((fallback, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -3 }}
                    className="p-3.5 rounded-xl bg-[oklch(0.94_0.02_70)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-[oklch(0.46_0.19_25)] mb-1">{fallback.date}</div>
                      <div className="text-sm font-semibold text-[oklch(0.22_0.05_250)] mb-1 line-clamp-1">{fallback.title}</div>
                      <div className="text-xs text-[oklch(0.42_0.04_250)]">{fallback.place}</div>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
}