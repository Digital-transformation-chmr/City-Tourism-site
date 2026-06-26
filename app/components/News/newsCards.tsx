import Image from "next/image";
import { useRef } from "react";

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

  title = title.replace(
    /^(📌|🎶|🚀|👋|🎙️|💃|☀️|💜|🌲)\s*(Куди піти:\s*)?/i,
    ""
  );

  const description = lines.slice(1).join("\n");

  return { title, description };
}

/* ================= MAIN ================= */

export default function NewsGrid({ items }: { items: NewsItem[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;

    ref.current.scrollBy({
      left: dir === "left" ? -600 : 600,
      behavior: "smooth",
    });
  };

  const channel = process.env.NEXT_PUBLIC_TG_CHANNEL;

  return (
    <div className="relative w-full">

      {/* buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 text-white px-3 py-2 rounded-full"
      >
        ←
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 text-white px-3 py-2 rounded-full"
      >
        →
      </button>

      {/* SCROLL */}
      <div
        ref={ref}
        className="
          flex gap-6
          overflow-x-auto
          scroll-smooth
          px-12 py-6

          [&::-webkit-scrollbar]:h-1
          [&::-webkit-scrollbar-thumb]:bg-white/10
          [&::-webkit-scrollbar-track]:bg-transparent
        "
      >
        {items.map((item) => {
          const { title, description } = parseTelegramContent(item.content);

          const cardTitle = item.title || title;
          const cardDescription = item.description || description;

          const imageSrc = item.image || "/Banners/banner3.png";

          const telegramLink = channel
            ? `https://t.me/${channel}/${item.telegramId}`
            : "#";

          return (
            <a
              key={item.id}
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="
                min-w-[600px]
                h-[400px]
                flex
                bg-black/40
                border border-white/10
                rounded-2xl
                overflow-hidden
                backdrop-blur-md
                transition
                hover:scale-[1.02]
              "
            >

              {/* IMAGE LEFT */}
              <div className="relative w-[45%] h-full">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={cardTitle}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
                    <div className="text-center text-white/40">
                      <div className="text-3xl mb-2">🖼️</div>
                      <div className="text-xs">Немає зображення</div>
                    </div>
                  </div>
                )}
              </div>

              {/* TEXT RIGHT */}
              <div className="w-[55%] p-6 flex flex-col justify-between">

                <div>
                  <h3 className="text-white font-bold text-xl line-clamp-2">
                    {cardTitle}
                  </h3>

                  <p className="text-white/60 text-sm mt-3 line-clamp-5 leading-relaxed">
                    {cardDescription}
                  </p>
                </div>

                <div className="text-xs text-blue-400">
                  Відкрити в Telegram →
                </div>

              </div>

            </a>
          );
        })}
      </div>
    </div>
  );
}