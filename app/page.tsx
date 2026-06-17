import Image from "next/image";
import PopPlaceGrid from "./components/Places/popularPlaces";
import WeatherCity from "./components/UI/weather";

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
      <div className="my-8 mx-2 px-10 py-4">
        <p className="text-lg font-bold text-[var(--accent)] flex items-center relative pl-5 
        before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 
        before:w-4 before:h-[2px] before:bg-[var(--accent)]"
        >Топ</p>
        <p className="mb-2 text-5xl font-bold text-[var(--text)]">Пам'ятки міста</p>
        <p className="mb-4 text-lg font-medium text-[var(--gray-text)] ">Найкращі місця для відвідування</p>
        <PopPlaceGrid />
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
