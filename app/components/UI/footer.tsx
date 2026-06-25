import Link from "next/link"
import { Logo } from "./logo"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-gray-300 bg-white/20 backdrop-blur-md">
      <div className=" mx-4 px-8 py-10">
        {/* Main content */}
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          
          {/* Logo section */}
          <Link 
            href="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Logo />
            <span className="text-lg font-semibold text-gray-900">CheTour</span>
          </Link>

          {/* Navigation links */}
          <nav className="flex gap-8 text-sm text-gray-600">
            <a 
              href="#privacy" 
              className="hover:text-gray-900 transition-colors"
            >
              Privacy
            </a>
            <a 
              href="#terms" 
              className="hover:text-gray-900 transition-colors"
            >
              Terms
            </a>
            <a 
              href="#contact" 
              className="hover:text-gray-900 transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Divider */}
        <div className="my-6 h-px" />

        {/* Footer bottom */}
        <div className="flex flex-col gap-2 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} CheTour. All rights reserved.</p>
          <p>Made with ❤️ in Ukraine</p>
        </div>
      </div>
    </footer>
  )
}