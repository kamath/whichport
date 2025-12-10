import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Home, Menu, X, Radio } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="bg-primary text-primary-foreground flex items-center justify-between p-4 shadow-lg">
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="hover:bg-primary-foreground/10 rounded-lg p-2 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-4 flex items-center gap-2 text-xl font-semibold">
            <Link to="/" className="flex items-center gap-2">
              <Radio size={24} className="text-cyan-400" />
              <span>Which Port</span>
            </Link>
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <aside
        className={`bg-sidebar text-sidebar-foreground fixed left-0 top-0 z-50 flex h-full w-80 transform flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-sidebar-border flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold">Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-sidebar-accent rounded-lg p-2 transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="hover:bg-sidebar-accent mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors"
            activeProps={{
              className:
                'mb-2 flex items-center gap-3 rounded-lg bg-cyan-600 p-3 transition-colors hover:bg-cyan-700',
            }}
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>
        </nav>
      </aside>
    </>
  )
}
