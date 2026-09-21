import Image from "next/image"

export const Houses = ()=>{
    return(        
        <Image
            className="mb-11"
            alt="Лого" 
            src="/identit.png" 
            width={200}
            height={280}
            priority
        />       
    )
}

