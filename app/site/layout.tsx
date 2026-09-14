'use client'

import Header from "../components/UI/header";
import Footer from "../components/UI/footer";
import PageTransition from "../components/pageTransition";
import ClickSpark from "@/components/ClickSpark";

export default function siteLayout({children,}: Readonly<{children: React.ReactNode;}>){
  return(
    <div className="relative min-h-screen flex flex-col">
      <Header/>
      
      {/* ОРЕСУРСОМІСТКИЙ ЕФЕКТ ТОЧОК ІЗ ВАШОГО ПРИКЛАДУ */}
      {/* <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10, // тримаємо під хедером (50), але над контентом сторінки
          pointerEvents: 'none',
          opacity: 0.4,
          mixBlendMode: 'overlay', // змішує точки з кольорами сайту
          backgroundImage: `
            radial-gradient(oklch(0.99 0.002 90) 0.6px, transparent 0.6px), 
            radial-gradient(oklch(0.22 0.05 250) 0.6px, transparent 0.6px)
          `,
          backgroundSize: '5px 5px, 7px 7px',
          backgroundPosition: '0px 0px, 1.5px 2.5px'
        }}
      /> */}

      <PageTransition>
        <ClickSpark
          sparkColor="#000"
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
          <main className="relative z-10 flex-1 pt-[var(--header-h)]"> 
            {children}
          </main>

          <div className="relative z-10">
            <Footer />
          </div>
        </ClickSpark>
      </PageTransition>
    </div>
  )
}