'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect  } from 'react'
import { X, MapPin, Clock, Phone, Globe } from 'lucide-react'

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })

 

interface Monument {
  title: string
  subtitle: string
  description: string
  images: string[]
  mainInfo: {
    yearBuilt: number
    status: string
    type: string
    visiting: string
  }
  location: {
    address: string
    lat: number
    lng: number
  }
  openingHours: string
  contacts: {
    phone: string | any
    website: string | any
  }
  tags: string[]
}

// --- Заглушки ---
const MONUMENTS: Monument[] = [
  {
    title: 'Черкаський краєзнавчий музей',
    subtitle: 'Найбільший музей регіону',
    description: 'Черкаський обласний краєзнавчий музей — один з найбільших музеїв України, що зберігає понад 180 000 експонатів.',
    images: [],
    mainInfo: { yearBuilt: 1918, status: 'Діючий', type: 'Музей', visiting: 'Платний' },
    location: { address: 'вул. Хрещатик, 259', lat: 49.4445, lng: 32.0598 },
    openingHours: '10:00 – 18:00, пн — вихідний',
    contacts: { phone: '+380472123456', website: 'museum.ck.ua' },
    tags: ['музей', 'культура', 'історія'],
  },
  {
    title: 'Парк Сосновий Бір',
    subtitle: 'Найбільша рекреаційна зона',
    description: 'Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою.',
    images: [],
    mainInfo: { yearBuilt: 1960, status: 'Діючий', type: 'Парк', visiting: 'Безкоштовний' },
    location: { address: 'вул. Смілянська', lat: 49.4123, lng: 32.0701 },
    openingHours: 'Цілодобово',
    contacts: { phone: null, website: null },
    tags: ['парк', 'природа', 'відпочинок'],
  },
  {
    title: 'Свято-Михайлівський собор',
    subtitle: 'Православний собор XIX ст.',
    description: 'Один з найстаріших православних храмів Черкас, пам\'ятка архітектури національного значення.',
    images: [],
    mainInfo: { yearBuilt: 1810, status: 'Діючий', type: 'Церква', visiting: 'Вільний' },
    location: { address: 'вул. Байди Вишневецького, 36', lat: 49.4401, lng: 32.0521 },
    openingHours: '08:00 – 20:00',
    contacts: { phone: '+380472654321', website: null },
    tags: ['церква', 'архітектура', 'релігія'],
  },
  {
    title: 'Черкаський драматичний театр',
    subtitle: 'Театр імені Т. Г. Шевченка',
    description: 'Черкаський академічний музично-драматичний театр імені Тараса Шевченка — провідний культурний заклад міста.',
    images: [],
    mainInfo: { yearBuilt: 1931, status: 'Діючий', type: 'Театр', visiting: 'За квитком' },
    location: { address: 'вул. Байди Вишневецького, 25', lat: 49.4423, lng: 32.0534 },
    openingHours: 'За розкладом вистав',
    contacts: { phone: '+380472789012', website: 'theatre.ck.ua' },
    tags: ['театр', 'культура', 'мистецтво'],
  },
  {
    title: 'Набережна Черкас',
    subtitle: 'Головна прогулянкова зона',
    description: 'Черкаська набережна — одна з найкрасивіших в Україні, простягається вздовж Кременчуцького водосховища.',
    images: [],
    mainInfo: { yearBuilt: 1954, status: 'Діючий', type: 'Парк', visiting: 'Безкоштовний' },
    location: { address: 'Набережна Черкас', lat: 49.4198, lng: 32.0634 },
    openingHours: 'Цілодобово',
    contacts: { phone: null, website: null },
    tags: ['набережна', 'відпочинок', 'природа'],
  },
  {
    title: 'Черкаська обласна філармонія',
    subtitle: 'Центр музичного мистецтва',
    description: 'Черкаська обласна філармонія проводить концерти класичної та сучасної музики протягом усього року.',
    images: [],
    mainInfo: { yearBuilt: 1944, status: 'Діючий', type: 'Галерея', visiting: 'За квитком' },
    location: { address: 'вул. Хрещатик, 203', lat: 49.4467, lng: 32.0612 },
    openingHours: 'За розкладом концертів',
    contacts: { phone: '+380472345678', website: 'philharmonic.ck.ua' },
    tags: ['музика', 'культура', 'мистецтво'],
  },
]

export default function MapPage() {
  const [activeType, setActiveType] = useState('Всі')
  const [selected, setSelected] = useState<Monument | null>(null)
  const [pinIcon, setPinIcon] = useState<any>(null)
  // Унікальні типи з mainInfo.type
  const types = ['Всі', ...Array.from(new Set(MONUMENTS.map(m => m.mainInfo.type)))]

  const filtered = activeType === 'Всі'
    ? MONUMENTS
    : MONUMENTS.filter(m => m.mainInfo.type === activeType)

    // Кастомна іконка — useMemo щоб не створювати на кожен рендер
    useEffect(() => {
    import('leaflet').then(L => {
        setPinIcon(L.divIcon({
        className: 'custom-pin',
        html: `
            <div class="pin">
            <div class="pin-dot"></div>
            </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [10, 30],
        }))
    })
    }, [])

  return (
    <div className="relative w-full h-screen flex flex-col pt-12">

      {/* Фільтри */}
      <div className="relative z-10 flex gap-2 flex-wrap px-6 py-3 backdrop-blur-md bg-black/30 border-b border-white/10">
        {types.map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200
              ${activeType === type
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                : 'bg-black/30 border-white/20 text-white/70 hover:border-white/50 hover:text-white'
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Карта */}
      <div className="relative flex-1">
        <MapContainer
          center={[49.4444, 32.0598]}
          zoom={13}
          className="w-full h-full z-0"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap"
          />
          {filtered.map((monument, index) => (
            <Marker
              key={index}
              icon={pinIcon}
              position={[monument.location.lat, monument.location.lng]}
              eventHandlers={{ click: () => setSelected(monument) }}
            />
          ))}
        </MapContainer>

        {/* Бокова панель */}
        {selected && (
          <div className="absolute top-0 right-0 h-full w-80 z-10 backdrop-blur-md bg-black/60 border-l border-white/10 overflow-y-auto">

            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Фото-заглушка */}
            <div className="w-full h-44 bg-white/5 flex items-center justify-center">
              <MapPin size={40} className="text-white/20" />
            </div>

            <div className="p-5 flex flex-col gap-4">

              {/* Тип + назва */}
              <div>
                <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white bg-[var(--accent)]/70">
                  {selected.mainInfo.type}
                </span>
                <h2 className="mt-2 text-xl font-bold text-[var(--text-light)]">{selected.title}</h2>
                <p className="text-sm text-[var(--accent)] italic">{selected.subtitle}</p>
              </div>

              {/* Опис */}
              <p className="text-sm text-[var(--gray-text)] leading-relaxed">
                {selected.description}
              </p>

              {/* Основна інфо */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Рік', value: selected.mainInfo.yearBuilt },
                  { label: 'Статус', value: selected.mainInfo.status },
                  { label: 'Тип', value: selected.mainInfo.type },
                  { label: 'Вхід', value: selected.mainInfo.visiting },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-[var(--gray-text)] uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-semibold text-[var(--text-light)]">{value}</p>
                  </div>
                ))}
              </div>

              {/* Адреса */}
              <div className="flex items-start gap-2 text-sm text-[var(--gray-text)]">
                <MapPin size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
                {selected.location.address}
              </div>

              {/* Години */}
              <div className="flex items-start gap-2 text-sm text-[var(--gray-text)]">
                <Clock size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
                {selected.openingHours}
              </div>

              {/* Контакти */}
              {selected.contacts.phone && (
                <div className="flex items-center gap-2 text-sm text-[var(--gray-text)]">
                  <Phone size={16} className="text-[var(--accent)] shrink-0" />
                  {selected.contacts.phone}
                </div>
              )}
              {selected.contacts.website && (
                <div className="flex items-center gap-2 text-sm text-[var(--gray-text)]">
                  <Globe size={16} className="text-[var(--accent)] shrink-0" />
                  <a href={`https://${selected.contacts.website}`} className="hover:text-white underline underline-offset-2">
                    {selected.contacts.website}
                  </a>
                </div>
              )}

              {/* Теги */}
              <div className="flex flex-wrap gap-2 pt-1">
                {selected.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60 border border-white/10">
                    #{tag}
                  </span>
                ))}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}