import Image from "next/image";

export interface Place{
    name:string,
    description:string,
    photoURL:string,
    type:string
}
export interface PlaceGrid{
    Places: Place[];
}
interface PlaceCardProps{
    item:Place
}


{/*Список популярних місць */}
export function PlaceCard({ item }: PlaceCardProps) {
    return (
        <a
            href="/PlacePage"
            className="
                group
                relative
                flex flex-col
                overflow-hidden
                rounded-2xl
                border border-white/10
                bg-black/40
                backdrop-blur-md
                shadow-lg
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-white/20
                hover:shadow-2xl
            "
        >
            <div className="relative">
                <Image
                    alt={item.name}
                    src={item.photoURL}
                    width={400}
                    height={300}
                    className="
                        h-48
                        w-full
                        object-cover
                        transition-transform
                        duration-500
                        group-hover:scale-105
                    "
                />

                <div className="absolute inset-0  to-transparent" />

                <span
                    className="
                        absolute
                        left-3
                        top-3
                        rounded-full
                        bg-black/40
                        px-3
                        py-1
                        text-sm
                        text-[var(--text-light)]
                        backdrop-blur-md
                    "
                >
                    {item.type}
                </span>
            </div>

            <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-2 text-lg font-semibold text-[var(--text-light)]">
                    {item.name}
                </h3>

                <p className="line-clamp-3 text-sm text-[var(--text-light)]">
                    {item.description}
                </p>

                <div className="mt-auto pt-4">
                    <span
                        className="
                            inline-flex
                            items-center
                            gap-2
                            text-sm
                            font-medium
                            text-blue-400
                            transition-colors
                            group-hover:text-blue-300
                        "
                    >
                        Детальніше
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                            →
                        </span>
                    </span>
                </div>
            </div>
        </a>
    );
}

export default function PopPlaceGrid({Places}:PlaceGrid){
    return(
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
            {Places.map((item, index) => (
              <PlaceCard key={index} item={item}/>))}
        </div>
    );
}