import Image from "next/image";
import PopPlaceGrid from "./components/Places/popularPlaces";
import WeatherCity from "./components/UI/weather";

import { Place } from "./components/Places/popularPlaces";


const Places:Place[] = [
    {name:"Парк Сосновий Бір", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     photoURL:"/PlacesPhoto/sosnovyj-bir.jpg",
     type:"Парк"},
     {name:"Парк Сосновий Бір", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     photoURL:"/PlacesPhoto/sosnovyj-bir.jpg",
     type:"Парк"},
     {name:"Парк Сосновий Бір", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     photoURL:"/PlacesPhoto/sosnovyj-bir.jpg",
     type:"Парк"},
     {name:"Парк Сосновий Бір", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     photoURL:"/PlacesPhoto/sosnovyj-bir.jpg",
     type:"Парк"},
     {name:"Парк Сосновий Бір", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     photoURL:"/PlacesPhoto/sosnovyj-bir.jpg",
     type:"Парк"},
     {name:"Парк Сосновий Бір", 
     description:"Парк «Сосновий бір» є найбільшою рекреаційною зоною міста, що поєднує природні ландшафти соснового лісу із сучасною парковою інфраструктурою. Територія парку використовується для активного відпочинку, прогулянок, проведення культурно-масових та спортивних заходів.",
     photoURL:"/PlacesPhoto/sosnovyj-bir.jpg",
     type:"Парк"},
]
export default function Home() {
  return (
    <div>
      {/*Перший банер на головній сторінці*/}
      <div className="h-screen w-full flex items-center justify-center relative bg-black/50 text-white">
        <Image alt="Hero"
               src="/Banners/banner1.jpg"
               fill
               className="object-cover -z-10"
               priority
               />
        <p className="text-6xl text-center">Відчуйте магію<br/><span className="bg-gradient-to-r from-blue-300 to-red-300 bg-clip-text text-transparent">живого міста</span></p>

        <div className="absolute bottom-6 flex justify-center w-full">
          <div className="animate-bounce text-white/30 text-sm">
            ▼
          </div>
        </div>

        <div className="absolute top-16 right-6 z-10">
         <WeatherCity />
        </div>

      </div>
      {/* ////////////////////////////////////////////////////////////////// */}
      <div className=" relative overflow-hidden bg-black/20">
        {/* Декоративна лінія зліва */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)] opacity-80" />

        <div className="py-16 px-12 flex flex-col items-start">
          {/* Eyebrow */}
          <span className="
            text-sm tracking-[0.25em] uppercase font-bold text-[var(--accent)]
            flex items-center gap-3 mb-4
          ">
            <span className="inline-block w-8 h-px bg-[var(--accent)]" />
            ТОП
          </span>

          {/* Заголовок */}
          <h1 className="
            text-5xl sm:text-6xl font-bold text-[var(--text-light)]
            leading-tight max-w-xl
          ">
            Пам'ятки 
            <span className="italic text-[var(--accent)]"> міста</span>
          </h1>

          {/* Підзаголовок */}
          <p className="mt-4 text-[var(--gray-text)] text-base max-w-md leading-relaxed">
            Відкрийте найкращі місця, що зберігають дух і душу міста
          </p>

          {/* Декоративний розподільник */}
          <div className="mt-8 flex items-center gap-3">
            <div className="w-12 h-px bg-[var(--accent)] opacity-60" />
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-80" />
            <div className="w-4 h-px bg-[var(--accent)] opacity-40" />
          </div>
        </div>
      </div>
      <div className="my-8 mx-2 px-10 py-4">
        <PopPlaceGrid Places={Places}/>
      </div>
      {/*//////////////////////////////////////////  */}

      <div className="h-screen w-full flex items-center relative justify-center bg-black/50 text-white">
        <Image alt="Hero2"
               src="/Banners/banner2.jpg"
               fill
               className="object-cover -z-10"
               />
        <p className="text-6xl text-center">Відчуйте магію<br/><span className="bg-gradient-to-r from-blue-300 to-red-300 bg-clip-text text-transparent">живого міста</span></p>
      </div>
      
    </div>
  );
}
