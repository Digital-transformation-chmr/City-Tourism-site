'use client';

import React, { useState, useEffect } from 'react';
import { PersonStanding, Check } from 'lucide-react'; // Імпортуємо іконку людини

// Типізація для словника перекладів
type Translations = Record<string, string>;

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('ua');
  const [t, setT] = useState<Translations>({});

  // Стани функцій доступності
  const [isGray, setIsGray] = useState(false);
  const [isSpacing, setIsSpacing] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Завантаження локалізації (за вашим шаблоном)
  useEffect(() => {
    async function loadLocale() {
      try {
        let res = await fetch(`/locales/${lang}.json`);
        let data = await res.json();
        setT(data);
      } catch (err) {
        console.error("AccessibilityMenu: Помилка завантаження локалізації:", err);
        // Запасні переклади, якщо файли .json не знайдено
        setT({
          title: "Доступність", lang: "Мова", grayscale: "ЧБ", 
          letterSpacing: "Відступи", fontSize: "Текст", highlightLinks: "Посилання"
        });
      }
    }
    loadLocale();
  }, [lang]);

  // Керування станами на рівні всього документа
  useEffect(() => {
    const html = document.documentElement;

    // Чорно-білий режим
    if (isGray) html.classList.add('grayscale');
    else html.classList.remove('grayscale');

    // Відступи між літерами
    if (isSpacing) html.style.letterSpacing = '0.15em';
    else html.style.letterSpacing = 'normal';

    // Збільшений текст (масштабуємо базовий розмір html)
    if (isLargeText) html.style.fontSize = '120%';
    else html.style.fontSize = '100%';

    // Підсвічування посилань (динамічно додаємо стиль для всіх 'a')
    const styleId = 'accessibility-links-style';
    let styleTag = document.getElementById(styleId);
    
    if (isHighlighted) {
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        styleTag.innerHTML = `
                a {
        border: 2px solid #699fd1 !important;
        background: transparent !important;
        
      }
        `;
        document.head.appendChild(styleTag);
      }
    } else if (styleTag) {
      styleTag.remove();
    }

  }, [isGray, isSpacing, isLargeText, isHighlighted]);

  // Стандартний стиль для кнопок функцій
  const buttonClass = (isActive: boolean) => `
    w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors 
    ${isActive 
      ? 'bg-blue-50 border-blue-400 text-blue-700 hover:bg-blue-100' 
      : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
    }
  `;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans antialiased text-gray-900">
      
      {/* Головна кнопка виклику меню (з іконкою Lucide людини) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t['title'] || "Налаштування доступності"}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        <PersonStanding size={28} /> {/* Lucide icon */}
      </button>

      {/* Панель налаштувань */}
      {isOpen && (
        <div className="absolute bottom-18 right-0 w-72 rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl flex flex-col gap-4">
          <h3 className="text-xl font-bold border-b border-gray-100 pb-3 text-gray-950">
            {t['title'] || 'Доступність'}
          </h3>

          {/* Перемикач мови */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">{t['lang']}:</span>
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="w-24 rounded-lg border border-gray-200 p-2 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="ua">UA</option>
              <option value="en">EN</option>
            </select>
          </div>

          <div className="border-t border-gray-100 pt-1" />

          {/* Кнопки функцій з іконками відмітки (Check) */}
          <button onClick={() => setIsGray(!isGray)} className={buttonClass(isGray)}>
            {t['grayscale'] || "ЧБ сайт"}
            {isGray && <Check className="w-4 h-4 text-blue-600" />}
          </button>

          <button onClick={() => setIsSpacing(!isSpacing)} className={buttonClass(isSpacing)}>
            {t['letterSpacing'] || "Відступи"}
            {isSpacing && <Check className="w-4 h-4 text-blue-600" />}
          </button>

          <button onClick={() => setIsLargeText(!isLargeText)} className={buttonClass(isLargeText)}>
            {t['fontSize'] || "Текст"}
            {isLargeText && <Check className="w-4 h-4 text-blue-600" />}
          </button>

          <button onClick={() => setIsHighlighted(!isHighlighted)} className={buttonClass(isHighlighted)}>
            {t['highlightLinks'] || "Посилання"}
            {isHighlighted && <Check className="w-4 h-4 text-blue-600" />}
          </button>
        </div>
      )}
    </div>
  );
}