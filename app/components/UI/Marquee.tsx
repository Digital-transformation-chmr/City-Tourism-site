import React from 'react';

interface MarqueeProps {
  items: Array<{
    logo?: React.ReactNode;
    title?: string;
    customNode?: React.ReactNode;
  }>;
  speed?: number;
  pauseOnHover?: boolean;
  defaultLogo?: React.ReactNode;
}

export const Marquee: React.FC<MarqueeProps> = ({
  items,
  speed = 28,
  pauseOnHover = false,
  defaultLogo,
}) => {
  // Дублюємо елементи для ефекту нескінченної стрічки
  const listItems = [...items, ...items, ...items, ...items];

  const renderTitleWithFixedNumbers = (text: string) => {
    const parts = text.split(/(\d+)/);

    return parts.map((part, index) => {
      if (/^\d+$/.test(part)) {
        return (
          <span
            key={index}
            className="inline-block text-[16.5px] font-semibold tracking-tight translate-y-[-2px]"
          >
            {part}
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

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
            className="flex items-center gap-7 shrink-0 font-['Unbounded',sans-serif] text-[14px] font-semibold tracking-[0.06em] uppercase text-[oklch(0.97_0.012_75_/_0.7)]"
          >
            {item.customNode ? (
              item.customNode
            ) : (
              <>
                {item.title && (
                  <span className="flex items-baseline gap-[2px]">
                    {renderTitleWithFixedNumbers(item.title)}
                  </span>
                )}

                {item.logo ? (
                  <div className="flex items-center justify-center shrink-0">
                    {item.logo}
                  </div>
                ) : (
                  defaultLogo && (
                    <div className="flex items-center justify-center shrink-0">
                      {defaultLogo}
                    </div>
                  )
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