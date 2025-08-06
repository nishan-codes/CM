"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { motion } from "motion/react";
import { Brain, ChartColumn, Home, Search, Table } from "lucide-react";

export function SidebarDemo() {
  const links = [
    {
      label: "Home",
      href: "/",
      icon: (
        //  text-neutral-700 dark:text-neutral-200
        <Home className="h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Tables",
      href: "/tables",
      icon: (
        <Table className="h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Rapid Search",
      href: "/rapid-search",
      icon: (
        <Search className="h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "AI Assistant",
      href: "/ai-assistant",
      icon: (
        <Brain className="h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Analytics",
      href: "#",
      icon: (
        <ChartColumn className="h-5 w-5 shrink-0" />
      ),
    },
    
  ];
  const [open, setOpen] = useState(false);

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
         {open ? <Logo /> : <LogoIcon />}
          <div className={`mt-14 flex flex-col gap-2`}>
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div>
          <SidebarLink
            link={{
              label: "Manu Arora",
              href: "#",
              icon: (
                <img
                  src="https://assets.aceternity.com/manu.png"
                  className="h-7 w-7 shrink-0 rounded-full"
                  width={50}
                  height={50}
                  alt="Avatar"
                />
              ),
            }}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
export const Logo = () => {
  return (
    <a
      href="#"
      className="md:hidden relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        Acet Labs
      </motion.span>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="md:hidden relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};

