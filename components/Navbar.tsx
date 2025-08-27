import { Bell, BellDot } from "lucide-react";
import React from "react";
import { ThemeToggle } from "./theme-toggle";
import Image from "next/image";

const Navbar = () => {
  return (
    <div>
      <nav className="hidden md:block z-5000 fixed top-0 w-full border border-border bg-background">
        <div className="md:py-2 pl-4 pr-11">
          <div className="flex justify-between h-10">
            <div className="flex items-center">
              <div className="max-md:hidden text-xl font-semibold text-foreground">
                <Image
                  src="/CLink.svg"
                  alt="CLink AI"
                  width={100}
                  height={100}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Bell className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              <BellDot
                stroke="red"
                className="cursor-pointer transition-colors"
              />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
