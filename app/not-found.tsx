export default function NotFoundPage(){
    return(
        <div className="h-screen w-full flex items-center justify-center bg-black/30 text-white">
            <p className="text-center text-5xl">404<br/>Такої сторінки не знайдено</p>
            <a href="/" className="absolute border bg-black/20 p-2 rounded-2xl border-white/20 bottom-10 text-lg text-white/80 hover:!underline">Повернутися на головну</a>
        </div>
    )
}

