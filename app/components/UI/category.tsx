import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type CategoryKey = "food" | "entertainment" | "newbies";

interface PlaceItem {
  icon: string;
  title: string;
  desc: string;
}

const CATEGORIES_DATA: Record<CategoryKey, { label: string; items: PlaceItem[] }> = {
  food: {
    label: "Їжа",
    items: [
      { icon: "☕️", title: "Кав’ярня «Друзі»", desc: "Затишна спешелті-кав’ярня в центрі." },
      { icon: "🍝", title: "Ресторан «Барон»", desc: "Європейська кухня, вечірня атмосфера." },
      { icon: "🍕", title: "Napoli Pizza", desc: "Автентична неаполітанська піца." },
      { icon: "🥟", title: "Кафе «Верховина»", desc: "Домашня українська кухня." },
    ],
  },
  entertainment: {
    label: "Розваги",
    items: [
      { icon: "🎬", title: "Кінотеатр «Мир»", desc: "Прем’єри та ретроспективи в центрі." },
      { icon: "🎳", title: "Боулінг-клуб", desc: "Вечір з друзями чи родиною." },
      { icon: "💦", title: "Аквапарк", desc: "Гірки та басейни для всієї родини." },
      { icon: "🎭", title: "Театр ляльок", desc: "Вистави для дітей і дорослих." },
    ],
  },
  newbies: {
    label: "Новачкам у місті",
    items: [
      { icon: "🌊", title: "Набережна", desc: "Почни з головної локації міста." },
      { icon: "🏛️", title: "Центральна площа", desc: "Серце Черкас, звідси — все поруч." },
      { icon: "🧭", title: "Турінфоцентр", desc: "Карти, поради, безкоштовні буклети." },
      { icon: "🕍", title: "Собор", desc: "Архітектурна перлина в 10 хв від центру." },
    ],
  },
};

{/* ================= CATEGORIES SECTION (02) ================= */}
export function CategoriesSection() {
  const [activeTab, setActiveTab] = useState<CategoryKey>("food");

  return (
    <motion.section
      id="categories"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      className="relative overflow-hidden py-20 px-12 bg-[oklch(0.94_0.02_70)]"
    >


      <div className="relative max-w-7xl mx-auto z-10">
        {/* Section Header */}
        <div className="text-center mb-8">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
            className="text-lg  font-bold uppercase tracking-[0.2em] text-[oklch(0.55_0.19_25)] mb-2"
          >
            Категорії
          </motion.div>

          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 25 },
              show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="font-['Unbounded',sans-serif] text-5xl font-bold text-[oklch(0.22_0.05_250)] mb-3"
          >
            Обери свій формат
          </motion.h2>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
            }}
            className="text-[oklch(0.4_0.04_250)] text-lg mx-auto max-w-xl"
          >
            Їжа, розваги чи перше знайомство з містом — підбірка під будь-який настрій.
          </motion.p>
        </div>

        {/* Filter Buttons */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } },
          }}
          className="flex justify-center gap-2.5 mb-9 flex-wrap"
        >
          {(Object.keys(CATEGORIES_DATA) as CategoryKey[]).map((tabKey) => {
            const isActive = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`px-6 py-3 rounded-full border-2 font-semibold text-lg transition-all duration-300 font-['Golos_Text',sans-serif] cursor-pointer relative overflow-hidden ${
                  isActive
                    ? "border-[oklch(0.42_0.13_250)] bg-[oklch(0.42_0.13_250)] text-[oklch(0.99_0.002_90)]"
                    : "border-[oklch(0.42_0.13_250)] bg-transparent text-[oklch(0.32_0.11_250)] hover:bg-[oklch(0.42_0.13_250)]/5"
                }`}
              >
                <span className="relative z-10">{CATEGORIES_DATA[tabKey].label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Places Grid with AnimatePresence */}
        <div className="min-h-[380px] sm:min-h-[220px] lg:min-h-[160px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={{
                initial: { opacity: 0 },
                animate: { opacity: 1, transition: { staggerChildren: 0.06 } },
                exit: { opacity: 0, transition: { duration: 0.15 } },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {CATEGORIES_DATA[activeTab].items.map((item, index) => (
                <motion.div
                  key={item.title + index}
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="bg-[oklch(0.99_0.002_90)] rounded-2xl p-5.5 border border-[oklch(0.9_0.02_70)] shadow-sm origin-center"
                >
                  <div className="w-11 h-11 rounded-xl bg-[oklch(0.93_0.03_250)] flex items-center justify-center text-2xl mb-3.5 select-none">
                    <span>{item.icon}</span>
                  </div>
                  <h4 className="font-['Unbounded',sans-serif] text-2xl font-semibold text-[oklch(0.22_0.05_250)] mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-lg text-[oklch(0.42_0.04_250)] leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}