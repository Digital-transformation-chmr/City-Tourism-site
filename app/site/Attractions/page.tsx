'use client'

import PopPlaceGrid  from "../../components/Places/placeCard"
import { Place } from "../../components/Places/placeCard"


const Places:Place[] = [
    {title:"Парк Сосновий Бір", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     images:["/PlacesPhoto/sosnovyj-bir.jpg"],
     tags:["Парк"]},
     {title:"Парк Сосновий Бір", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     images:["/PlacesPhoto/sosnovyj-bir.jpg"],
     tags:["Парк"]},
     {title:"Парк Сосновий Бір", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     images:["/PlacesPhoto/sosnovyj-bir.jpg"],
     tags:["Парк"]},
     {title:"Парк Сосновий Бір", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     images:["/PlacesPhoto/sosnovyj-bir.jpg"],
     tags:["Парк"]},
     {title:"Парк Сосновий Бір", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     images:["/PlacesPhoto/sosnovyj-bir.jpg"],
     tags:["Парк"]},
     {title:"Парк Сосновий Бір", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     images:["/PlacesPhoto/sosnovyj-bir.jpg"],
     tags:["Парк"]},
]

export default function Attraction() {
  return (
    <div className="min-h-screen">

      {/* Hero-банер */}
      <div className=" relative overflow-hidden bg-black/10">
        {/* Декоративна лінія зліва */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-(--accent) opacity-80" />

        <div className="py-20 px-12 flex flex-col items-start">
          {/* Eyebrow */}
          <span className="
            text-sm tracking-[0.25em] uppercase font-bold text-(--accent)
            flex items-center gap-3 mb-4
          ">
            <span className="inline-block w-8 h-px bg-(--accent)" />
            Каталог
          </span>

          {/* Заголовок */}
          <h1 className="
            text-5xl sm:text-6xl font-bold text-(--text-light)
            leading-tight max-w-xl
          ">
            Пам'ятки 
            <span className="italic text-(--accent)"> міста</span>
          </h1>

          {/* Підзаголовок */}
          <p className="mt-4 text-(--gray-text) text-base max-w-md leading-relaxed">
            Відкрийте унікальні місця, що зберігають дух і душу міста
          </p>

          {/* Декоративний розподільник */}
          <div className="mt-8 flex items-center gap-3">
            <div className="w-12 h-px bg-(--accent) opacity-60" />
            <div className="w-2 h-2 rounded-full bg-(--accent) opacity-80" />
            <div className="w-4 h-px bg-(--accent) opacity-40" />
          </div>
        </div>
      </div>

      {/* Секція з гріді */}
      <div className="mx-2 px-6 sm:px-10 py-8">

        {/* Лічильник/фільтр рядок */}
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <p className="text-(--gray-text) text-sm tracking-wide uppercase">
            Всі пам'ятки
          </p>
          <div className="w-8 h-px bg-(--accent) opacity-50" />
        </div>

        <PopPlaceGrid Places={Places} />
      </div>
    </div>
  )
}