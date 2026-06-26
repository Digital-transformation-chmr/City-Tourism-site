import Header from "../components/UI/header";
import Footer from "../components/UI/footer";
import PageTransition from "../components/pageTransition";
 export default function siteLayout({children,}: Readonly<{children: React.ReactNode;}>){
 return(
    <div>
      <Header/>
      <PageTransition>
            <main className="flex-1">
              {children}
            </main>
          <Footer/>
        </PageTransition>
    </div>
 )

 }
