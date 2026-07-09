import React from 'react';

interface MarqueeProps {
  items: Array<{
    logo?: React.ReactNode;
    title?: string;
    customNode?: React.ReactNode;
  }>;
  speed?: number;
  pauseOnHover?: boolean;
  defaultLogo?: React.ReactNode; // додаємо дефолтну іконку для розділення
}

export const Marquee: React.FC<MarqueeProps> = ({
  items,
  speed = 28,
  pauseOnHover = false,
  defaultLogo,
}) => {
  const listItems = [...items, ...items, ...items, ...items];

  return (
    <div className="w-full overflow-hidden flex whitespace-nowrap">
      <div 
        className={`flex w-max gap-7 pr-7 animate-marquee ${
          pauseOnHover ? 'hover:[animation-play-state:paused]' : ''
        }`}
        style={{ '--speed': `${speed}s` } as React.CSSProperties}
      >
        {listItems.map((item, index) => (
          <div 
            key={index} 
            /* Стилі твого тексту з тегу <span>: шрифт, розмір, жирність, трекінг, колір oklch */
            className="flex items-center gap-7 shrink-0 font-['Unbounded',sans-serif] text-[14px] font-semibold tracking-[0.06em] uppercase text-[oklch(0.97_0.012_75_/_0.7)]"
          >
            {item.customNode ? (
              item.customNode
            ) : (
              <>
                {item.title && <span>{item.title}</span>}
                
                {/* Якщо є кастомне лого для цього елемента — рендеримо його, якщо ні — дефолтний ромб */}
                {item.logo ? (
                  <div className="flex items-center justify-center shrink-0">{item.logo}</div>
                ) : (
                  defaultLogo && <div className="flex items-center justify-center shrink-0">{defaultLogo}</div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;