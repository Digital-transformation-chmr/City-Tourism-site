import Image from "next/image";

interface Place{
    name:string,
    description:string,
    photoURL:string,
    type:string
}

interface PlaceCardProps{
    item:Place
}

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
{/*Список популярних місць */}
export function PlaceCard({item}:PlaceCardProps){
    return(
            <a
            href="/PlacePage"
            className="flex flex-col 
            backdrop-blur-md bg-black/50
                border-white/10
            rounded-2xl overflow-hidden shadow-lg"
            >
                <p className="absolute top-2 left-2  backdrop-blur-md bg-black/30
                border-white/10 rounded-2xl overflow-hidden shadow-lg text-white px-2 py-1 text-sm">{item.type}</p>
                <Image
                    alt="Фото картки"
                    src={item.photoURL}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                />

                <div className="p-4">
                    <p className="text-lg  text-white font-semibold">{item.name}</p>
                    <p className="text-base text-gray-300">
                    {item.description}
                    </p>
                </div>
            </a>
    )
}

export default function PopPlaceGrid(){
    return(
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {Places.map((item, index) => (
              <PlaceCard key={index} item={item}/>))}
        </div>
    );
}