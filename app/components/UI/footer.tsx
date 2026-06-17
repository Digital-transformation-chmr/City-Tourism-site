import Link from "next/link"
import { Logo } from "./logo"

export default function Footer() {
  return (
    <footer className="
      w-full
      backdrop-blur-md
      border-t border-[var(--text)]
    ">
      <div className="  mx-2 px-10 py-4 flex items-center justify-between">
        
        <Link href="#" className="flex items-center gap-3">
            <Logo/>
            <p className="text-[var(--text)]">CheTour</p>
        </Link>

        <div className="flex gap-6 text-base text-[var(--text)]">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>

      </div>
    </footer>
  );
}