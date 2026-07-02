'use client'

import dynamic from 'next/dynamic'
import { MapPin, Clock, Phone, Globe, Bus, TramFront, ChevronDown } from 'lucide-react' // 🆕 Додали іконки для транспорту та стрілочку
import { useEffect, useMemo, useState } from 'react'
import { X, Search } from 'lucide-react'
import { Place } from '@/app/components/Places/placeCard'
import Image from 'next/image'
import { useSearchParams } from "next/navigation";

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false })

interface TransportRoute {
  id: string
  number: string
  transportType: 'bus' | 'trolleybus'
  color: string
  path: [number, number][]
}

const TYPE_COLORS: Record<string, string> = {
  'Музей': '#a855f7',
  'Парк': '#22c55e',
  'Церква': '#eab308',
  'Театр': '#3b82f6',
  'Галерея': '#ec4899',
  "Пам'ятник": '#f97316',
  "Готель": '#6788e6',
  "Ресторан": '#5b24bf',
  "Кафе": '#bf7b50',
}

const DEFAULT_COLOR = '#64748b'

const getColor = (type?: string) => {
  if (!type) return DEFAULT_COLOR
  return TYPE_COLORS[type] ?? DEFAULT_COLOR
}

export default function MapPage() {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  const [places, setPlaces] = useState<Place[]>([])
  const [activeType, setActiveType] = useState('Всі')
  const [selected, setSelected] = useState<Place | null>(null)
  const [leaflet, setLeaflet] = useState<any>(null)

  const [routes, setRoutes] = useState<TransportRoute[]>([])
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([])

  // 🆕 Стан для відкриття нижніх віконець вибору маршрутів
  const [activePanel, setActivePanel] = useState<'bus' | 'trolleybus' | null>(null)

  // 🔍 search UI
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    import('leaflet').then(L => setLeaflet(L))

    const load = async () => {
      const resPlaces = await fetch('/api/places')
    const dataPlaces = await resPlaces.json();

    setPlaces(dataPlaces);

    if (placeId) {
      const place = dataPlaces.find((p: Place) => String(p.id) === placeId);

      if (place) {
        setSelected(place);
      }
    }

      try {
        const resRoutes = await fetch('/data/routes.json')
        const dataRoutes = await resRoutes.json()
        setRoutes(dataRoutes)
      } catch (error) {
        console.error("Помилка завантаження маршрутів:", error)
      }
    }

    load()
  }, [])

  const toggleRoute = (id: string) => {
    setSelectedRouteIds(prev => 
      prev.includes(id) ? prev.filter(routeId => routeId !== id) : [...prev, id]
    )
  }

  const createIcon = (type?: string, active = false) => {
    if (!leaflet) return undefined
    const color = getColor(type)
    return leaflet.divIcon({
      className: 'custom-pin',
      html: `
        <div class="pin ${active ? 'active' : ''}" style="background:${color}">
          <div class="pin-dot"></div>
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [10, 30],
    })
  }

  const types = useMemo(
    () => ['Всі', ...Array.from(new Set(places.map(p => p.type).filter(Boolean)))],
    [places]
  )

  const filtered = useMemo(() => {
    return places.filter(p => {
      const matchType = activeType === 'Всі' || p.type === activeType
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase())
      return matchType && matchSearch
    })
  }, [places, activeType, search])

  const buses = useMemo(() => routes.filter(r => r.transportType === 'bus'), [routes])
  const trolleybuses = useMemo(() => routes.filter(r => r.transportType === 'trolleybus'), [routes])
  const searchParams = useSearchParams();
  const placeId = searchParams.get("id");

  const activeRoutesOnMap = useMemo(() => {
    return routes.filter(route => selectedRouteIds.includes(route.id))
  }, [routes, selectedRouteIds])

  

  return (
    <div className="relative w-full h-dvh flex flex-col pt-12 overflow-hidden">

      {/* 🔝 TOP BAR (Тільки фільтри та пошук місць) */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-6 py-3 backdrop-blur-md bg-black/30 border-b border-white/10">
        {/* TAGS */}
        <div className="flex gap-2 flex-wrap">
          {types.map(type => {
            const color = type === 'Всі' ? null : getColor(type)
            const isActive = activeType === type

            return (
              <button
                key={type}
                onClick={() => setActiveType(type!)}
                style={isActive && color ? { backgroundColor: color, borderColor: color } : {}}
                className={`px-4 py-1.5 rounded-full text-sm border transition
                  ${isActive ? 'text-white' : 'bg-black/30 border-white/20 text-white/70 hover:text-white'}
                `}
              >
                {type}
              </button>
            )
          })}
        </div>

        {/* SEARCH */}
        <div className="flex items-center">
          {!searchOpen ? (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full bg-black/30 border border-white/20 text-white hover:border-white/40"
            >
              <Search size={18} />
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-black/40 border border-white/20 rounded-full px-3 py-1">
              <Search size={16} className="text-white/60" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Пошук місця..."
                className="bg-transparent outline-none text-white text-sm w-40"
              />
              <button onClick={() => setSearchOpen(false)}>
                <X size={16} className="text-white/60 hover:text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🗺 MAP */}
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

          {activeRoutesOnMap.map((route) => (
            <Polyline
              key={route.id}
              positions={route.path}
              pathOptions={{
                color: route.color, 
                weight: route.transportType === 'trolleybus' ? 4 : 5,         
                opacity: 0.8,      
                lineJoin: 'round',
                dashArray: route.transportType === 'trolleybus' ? '2, 2' : undefined
              }}
            />
          ))}

          {leaflet &&
            filtered
              .filter((place) => {
                // якщо нічого не вибрано — показуємо всі результати фільтрації
                if (!selected) return true;

                // якщо вибрано місце — показуємо тільки його
                return place.id === selected.id;
              })
              .map((place) => (
                <Marker
                  key={place.id}
                  position={[place.lat!, place.lng!]}
                  icon={createIcon(place.type, true)}
                  eventHandlers={{
                    click: () => setSelected(place),
                  }}
                />
              ))}
        </MapContainer>

        {/* 🆕 ІКОНКИ ТРАНСПОРТУ ЗНИЗУ ПРАВОРУЧ */}
        <div className="absolute bottom-6 left-10 z-10 flex gap-3">
          {/* Кнопка Автобусів */}
          <button
            onClick={() => setActivePanel(activePanel === 'bus' ? null : 'bus')}
            className={`flex items-center justify-center p-4 rounded-full shadow-lg border backdrop-blur-md transition-all duration-300
              ${activePanel === 'bus' 
                ? 'bg-amber-500/80 border-amber-400 text-white scale-110' 
                : 'bg-black/60 border-white/10 text-white/80 hover:text-white hover:bg-black/80'
              }
            `}
          >
            <Bus size={24} />
          </button>

          {/* Кнопка Тролейбусів */}
          <button
            onClick={() => setActivePanel(activePanel === 'trolleybus' ? null : 'trolleybus')}
            className={`flex items-center justify-center p-4 rounded-full shadow-lg border backdrop-blur-md transition-all duration-300
              ${activePanel === 'trolleybus' 
                ? 'bg-cyan-500/80 border-cyan-400 text-white scale-110' 
                : 'bg-black/60 border-white/10 text-white/80 hover:text-white hover:bg-black/80'
              }
            `}
          >
            <TramFront size={24} />
          </button>
        </div>

        {/* 🆕 ВИПЛИВАЮЧЕ ВІКОНЦЕ ЗНИЗУ (BOTTOM SHEET) */}
        <div
          className={`absolute bottom-6 left-6 z-20 backdrop-blur-xl bg-black/85 border border-white/10 shadow-2xl rounded-2xl transition-all duration-500 ease-out p-5 max-h-[250px] overflow-y-auto
            w-[calc(100%-48px)] sm:w-[400px] md:w-[500px]
            ${activePanel 
              ? 'translate-y-0 opacity-100 pointer-events-auto' 
              : 'translate-y-10 opacity-0 pointer-events-none'
            }
          `}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4">
            <div className="flex items-center gap-2">
              {activePanel === 'bus' ? <Bus size={18} className="text-amber-400" /> : <TramFront size={18} className="text-cyan-400" />}
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Маршрути: {activePanel === 'bus' ? 'Автобуси' : 'Тролейбуси'}
              </h3>
            </div>
            <button 
              onClick={() => setActivePanel(null)}
              className="text-white/40 hover:text-white p-1 rounded-full hover:bg-white/5 transition"
            >
              <X size={16} /> {/* Замінили велику стрілочку на акуратний хрестик */}
            </button>
          </div>

          {/* Список маршрутів залежно від обраного типу */}
          <div className="flex flex-wrap gap-2">
            {activePanel === 'bus' && buses.map(route => {
              const isSelected = selectedRouteIds.includes(route.id)
              return (
                <button
                  key={route.id}
                  onClick={() => toggleRoute(route.id)}
                  style={isSelected ? { backgroundColor: `${route.color}20`, borderColor: route.color, color: '#fff' } : {}}
                  className={`px-3 py-1.5 rounded-xl border transition text-xs font-medium flex items-center gap-2
                    ${isSelected ? 'font-semibold bg-white/10' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/30'}
                  `}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: route.color }} />
                  {route.number}
                </button>
              )
            })}

            {activePanel === 'trolleybus' && trolleybuses.map(route => {
              const isSelected = selectedRouteIds.includes(route.id)
              return (
                <button
                  key={route.id}
                  onClick={() => toggleRoute(route.id)}
                  style={isSelected ? { backgroundColor: `${route.color}20`, borderColor: route.color, color: '#fff' } : {}}
                  className={`px-3 py-1.5 rounded-xl border transition text-xs font-medium flex items-center gap-2
                    ${isSelected ? 'font-semibold bg-white/10' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/30'}
                  `}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: route.color }} />
                  {route.number}
                </button>
              )
            })}
            
            {((activePanel === 'bus' && buses.length === 0) || (activePanel === 'trolleybus' && trolleybuses.length === 0)) && (
              <span className="text-xs text-white/40 italic">Немає доступних маршрутів</span>
            )}
          </div>
        </div>
        {/* BACKGROUND OVERLAY FOR SIDEBAR */}
        <div
          className={`
            absolute inset-0 z-10 transition-all duration-300 ease-in-out
            ${selected ? 'bg-black/40 pointer-events-auto' : 'bg-black/0 pointer-events-none'}
          `}
          onClick={() => setSelected(null)}
        />

        {/* 📌 SIDEBAR */}
        <div
          className={`
            absolute top-0 right-0 h-full w-[360px] z-20
            backdrop-blur-xl bg-black/70 border-l border-white/10
            shadow-2xl overflow-y-auto no-scrollbar
            transform transition-all duration-500 ease-out
            ${selected ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}
          `}
        >
          {/* close */}
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition z-30"
          >
            <X size={20} />
          </button>

          {selected && (
            <>
              {/* content */}
              <div className="w-full h-44 relative overflow-hidden">
                {selected.images?.[0] ? (
                  <>
                    <Image src={selected.images[0]} alt={selected.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <MapPin size={40} className="text-white/20" />
                  </div>
                )}
              </div>

              <div className="p-6 space-y-5 animate-fadeIn">
                <div>
                  <span
                    className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: getColor(selected.type) }}
                  >
                    {selected.type}
                  </span>
                  <h2 className="mt-3 text-2xl font-bold text-white leading-tight">{selected.title}</h2>
                  <p className="text-sm text-white/60 mt-1 italic">{selected.subtitle}</p>
                </div>

                <p className="text-sm text-white/80 leading-relaxed">{selected.description}</p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Рік', value: selected.yearBuilt },
                    { label: 'Статус', value: selected.status },
                    { label: 'Тип', value: selected.type },
                    { label: 'Вхід', value: selected.visiting },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <p className="text-[11px] uppercase tracking-wide text-white/40">{item.label}</p>
                      <p className="text-sm text-white font-semibold mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 text-sm text-white/70">
                  <div className="flex gap-2 items-start">
                    <MapPin size={16} className="mt-0.5 text-red-400" />
                    <span>{selected.address}</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Clock size={16} className="mt-0.5 text-yellow-300" />
                    <span>{selected.openingHours}</span>
                  </div>
                  {selected.phone && (
                    <div className="flex gap-2 items-center">
                      <Phone size={16} className="text-green-400" />
                      <span>{selected.phone}</span>
                    </div>
                  )}
                  {selected.website && (
                    <div className="flex gap-2 items-center">
                      <Globe size={16} className="text-blue-400" />
                      <a href={`https://${selected.website}`} target="_blank" className="underline hover:text-white">
                        {selected.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {selected.tags?.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10 text-white/60">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ❌ empty state */}
        {filtered.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-white/40">
            Нічого не знайдено
          </div>
        )}
      </div>
    </div>
  )
}