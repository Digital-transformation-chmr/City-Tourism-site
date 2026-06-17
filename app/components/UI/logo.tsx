import Image from "next/image"

export const Logo = ()=>{
    return(
        <Image
            alt="Лого" 
            src="/Logo.svg" 
            width={26}
            height={26}
            priority
        />           
    )
}

