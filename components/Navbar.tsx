import { Bell, BellDot } from 'lucide-react'
import React from 'react'

const Navbar = () => {
  return (
    <div>
      <nav className="hidden md:block z-5000 fixed top-0 w-full border border-border bg-white dark:bg-neutral-900">
        <div className="md:py-2 pl-4 pr-11">
          <div className="flex justify-between h-10">
            <div className="flex items-center">
              <div className="max-md:hidden text-xl font-semibold text-gray-900 dark:text-white">
               CLink AI
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell />
              <BellDot stroke='red'/>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navbar