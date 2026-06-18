'use client'

import PopPlaceGrid  from "../components/Places/popularPlaces"
import { Place } from "../components/Places/popularPlaces"


const Places:Place[] = [
    {name:"Ресторан", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     photoURL:"/PlacesPhoto/sosnovyj-bir.jpg",
     type:"Ресторан"},
     {name:"Кафе", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     photoURL:"/PlacesPhoto/sosnovyj-bir.jpg",
     type:"Кафе"},
     {name:"Ресторан", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     photoURL:"/PlacesPhoto/sosnovyj-bir.jpg",
     type:"Ресторан"},
     {name:"Ресторан", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     photoURL:"/PlacesPhoto/sosnovyj-bir.jpg",
     type:"Ресторан"},
     {name:"Кафе", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     photoURL:"/PlacesPhoto/sosnovyj-bir.jpg",
     type:"Кафе"},
     {name:"Ресторан", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     photoURL:"/PlacesPhoto/sosnovyj-bir.jpg",
     type:"Ресторан"},
     {name:"Кафе", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     photoURL:"/PlacesPhoto/sosnovyj-bir.jpg",
     type:"Кафе"},
]

export default function Attraction() {
  return (
    <div className="min-h-screen">

      {/* Hero-банер */}
      <div className=" relative overflow-hidden bg-black/10">
        {/* Декоративна лінія зліва */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)] opacity-80" />

        <div className="py-20 px-12 flex flex-col items-start">
          {/* Eyebrow */}

          {/* Заголовок */}
          <h1 className="
            text-5xl sm:text-6xl font-bold text-[var(--text-light)]
            leading-tight max-w-xl
          ">
            <span className="italic text-[var(--accent)]">Де поїсти?</span>
          </h1>

          {/* Декоративний розподільник */}
          <div className="mt-8 flex items-center gap-3">
            <div className="w-12 h-px bg-[var(--accent)] opacity-60" />
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-80" />
            <div className="w-4 h-px bg-[var(--accent)] opacity-40" />
          </div>
        </div>
      </div>

      {/* Секція з гріді */}
      <div className="mx-2 px-6 sm:px-10 py-8">

        {/* Лічильник/фільтр рядок */}
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <p className="text-[var(--gray-text)] text-sm tracking-wide uppercase">
            Ресторани
          </p>
          <div className="w-8 h-px bg-[var(--accent)] opacity-50" />
        </div>

        <PopPlaceGrid Places={Places.filter(place => place.type === "Ресторан")} />
      </div>

      <div className="mx-2 px-6 sm:px-10 py-8">

        {/* Лічильник/фільтр рядок */}
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <p className="text-[var(--gray-text)] text-sm tracking-wide uppercase">
            Кафе
          </p>
          <div className="w-8 h-px bg-[var(--accent)] opacity-50" />
        </div>

        <PopPlaceGrid Places={Places.filter(place => place.type === "Кафе")} />
      </div>
    </div>
  )
}