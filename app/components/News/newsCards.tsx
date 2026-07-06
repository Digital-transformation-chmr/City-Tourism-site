import Image from "next/image";
import { useEffect, useRef, useState, useCallback, MouseEvent } from "react";

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

/* ================= CONFIG ================= */

const CARD_WIDTH = 640; 
const CARD_HEIGHT = 440; 

const MIN_SCALE = 0.86; 
const MAX_SCALE = 1.12; 

/* ================= MAIN ================= */

export default function NewsGrid({ items }: { items: NewsItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [scales, setScales] = useState<number[]>(() => items.map(() => MIN_SCALE));
  const rafRef = useRef<number | null>(null);

  // Рефи для реалізації перетягування (Drag)
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [isMoved, setIsMoved] = useState(false); // Щоб відрізнити клік від свайпу

  const updateScales = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const scrollerCenter = scrollerRect.left + scrollerRect.width / 2;

    const next = cardRefs.current.map((card) => {
      if (!card) return MIN_SCALE;
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenter - scrollerCenter);

      const maxDistance = scrollerRect.width / 2 + rect.width / 2;
      const ratio = Math.min(distance / maxDistance, 1);

      return MAX_SCALE - ratio * (MAX_SCALE - MIN_SCALE);
    });

    setScales(next);
  }, []);

  const onScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateScales();
    });
  }, [updateScales]);

  useEffect(() => {
    updateScales();

    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [items.length, onScroll, updateScales]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollerRef.current) return;

    scrollerRef.current.scrollBy({
      left: dir === "left" ? -700 : 700,
      behavior: "smooth",
    });
  };

  /* ================= DRAG HANDLERS ================= */

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!scrollerRef.current) return;
    isDragging.current = true;
    setIsMoved(false);
    
    // Тимчасово вимикаємо плавну прокрутку (scroll-smooth), щоб картка йшла чітко за мишкою
    scrollerRef.current.style.scrollBehavior = 'auto';
    // Також вимикаємо snap-ефект під час руху миші
    scrollerRef.current.style.scrollSnapType = 'none';

    startX.current = e.pageX - scrollerRef.current.offsetLeft;
    scrollLeft.current = scrollerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollerRef.current) return;
    e.preventDefault();
    
    const x = e.pageX - scrollerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Коефіцієнт 1.5 робить прокрутку чутливішою
    
    if (Math.abs(walk) > 5) {
      setIsMoved(true); // Користувач саме тягне, а не просто клікнув
    }
    
    scrollerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!isDragging.current || !scrollerRef.current) return;
    isDragging.current = false;

    // Повертаємо назад плавний скрол та snap-ефект
    scrollerRef.current.style.scrollBehavior = 'smooth';
    scrollerRef.current.style.scrollSnapType = 'x mandatory';

    // Невеликий хак: змушуємо контейнер оновити свою позицію згідно з правилами snap
    const currentScroll = scrollerRef.current.scrollLeft;
    scrollerRef.current.scrollLeft = currentScroll + 1;
    scrollerRef.current.scrollLeft = currentScroll;
  };

  const handleCardClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Якщо користувач тягнув картку — блокуємо перехід за посиланням
    if (isMoved) {
      e.preventDefault();
    }
  };

  const channel = process.env.NEXT_PUBLIC_TG_CHANNEL;

  return (
    <div className="relative w-full z-0">
      {/* buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white px-3 py-2 rounded-full z-[999] cursor-pointer selection:bg-transparent"
      >
        ←
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white px-3 py-2 rounded-full z-[999] cursor-pointer selection:bg-transparent"
      >
        →
      </button>

      {/* SCROLL CONTAINER */}
      <div
        ref={scrollerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="
          flex items-center gap-8
          overflow-x-auto
          scroll-smooth
          snap-x snap-mandatory
          px-[15vw] py-16
          gap-20
          cursor-grab active:cursor-grabbing
          select-none
          [&::-webkit-scrollbar]:h-1
          [&::-webkit-scrollbar-thumb]:bg-white/10
          [&::-webkit-scrollbar-track]:bg-transparent
        "
      >
        {items.map((item, index) => {
          const { title, description } = parseTelegramContent(item.content);

          const cardTitle = item.title || title;
          const cardDescription = item.description || description;

          const telegramLink = channel
            ? `https://t.me/${channel}/${item.telegramId}`
            : "#";

          const scale = scales[index] ?? MIN_SCALE;

          return (
            <a
              key={item.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCardClick}
              
              // 1. Забороняємо браузеру підхоплювати посилання як drag-елемент
              draggable={false} 
              
              // 2. Додатково глушимо подію старту drag-і-дропу на рівні JS
              onDragStart={(e) => e.preventDefault()} 

              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                minWidth: CARD_WIDTH,
                transform: `scale(${scale})`,
                zIndex: Math.round(scale * 100),
              }}
              className="
                snap-center
                shrink-0
                flex
                bg-black/40
                border border-white/10
                rounded-2xl
                overflow-hidden
                backdrop-blur-md
                transition-transform
                duration-300
                ease-out
                pointer-events-auto
                select-none
              "
            >
              {/* IMAGE LEFT */}
              <div className="relative w-[45%] h-full pointer-events-none">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={cardTitle}
                    fill
                    className="object-cover"
                    draggable={false}
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
              <div className="w-[55%] p-7 flex flex-col justify-between pointer-events-none">
                <div>
                  <h3 className="text-white font-bold text-2xl line-clamp-2">
                    {cardTitle}
                  </h3>

                  <p className="text-white/60 text-sm mt-4 line-clamp-6 leading-relaxed">
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