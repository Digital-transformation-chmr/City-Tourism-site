import Header from "../components/UI/header";
import Footer from "../components/UI/footer";
 export default function siteLayout({children,}: Readonly<{children: React.ReactNode;}>){
 return(
    <div>
        <Header/>
        <main className="flex-1">
          {children}
        </main>
        <Footer/>
    </div>
 )

 }
