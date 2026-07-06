'use client'

import Header from "../components/UI/header";
import Footer from "../components/UI/footer";
import PageTransition from "../components/pageTransition";
import ClickSpark from "@/components/ClickSpark";
import DotField from "@/components/DotField";
 export default function siteLayout({children,}: Readonly<{children: React.ReactNode;}>){
 return(
    <div>
      <Header/>
      <PageTransition>
         <ClickSpark
              sparkColor="#000"
              sparkSize={10}
              sparkRadius={15}
              sparkCount={8}
              duration={400}
            >
            <main className="flex-1  pt-[var(--header-h)]"> 
              {children}
            </main>

          <Footer/>
          </ClickSpark>
        </PageTransition>
    </div>
 )

 }
