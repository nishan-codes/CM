"use client";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FlipReveal, FlipRevealItem } from "@/components/ui/flip-reveal";
import { Button } from "./ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, SquareCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSearchStore } from "@/lib/store";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";

export const Demo = () => {
  const {
    searchResults,
    isLoading,
    setIsLoading,
    expectedCount,
    storedLibrary,
    setStoredLibrary,
  } = useSearchStore();

  const items = searchResults
    ? searchResults.map((result) => ({
        src: result.url,
        thumbnail: result.thumbnail,
        title: result.title,
        key: result.title,
      }))
    : [];

  const isYoutube = searchResults && items.length > 0 && items[0].src.includes("youtube");
  // console.log(items);

  useEffect(() => {
    setIsLoading(false);
  }, [searchResults]);

  const [key, setKey] = useState("all");
  const [library, setLibrary] = useState<string[]>([]);

  const addToLibrary = (src: string) => {
    if (library.includes(src)) {
      // Remove from library
      setLibrary((prev) => prev.filter((item) => item !== src));
    } else {
      // Add to library
      setLibrary((prev) => [...prev, src]);
    }
  };

  const saveToLibrary = () => {
    const selectedItems = searchResults
      .filter((item) => library.includes(item.url))
      .map((item) => ({
        title: item.title,
        url: item.url,
      }));

    setStoredLibrary(selectedItems);
  };

  useEffect(() => {
    console.log("Updated storedLibrary:", storedLibrary);
  }, [storedLibrary]);

  return (
    <div className="flex min-h-120 flex-col items-start gap-8">
      <div className="flex gap-3">
        {searchResults.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 h-8 pl-1 pr-2 text-xs rounded-md dark:text-white hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 "
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={key}
                    initial={{
                      opacity: 0,
                      y: -5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: 5,
                    }}
                    transition={{
                      duration: 0.15,
                    }}
                    className="flex items-center gap-1 capitalize"
                  >
                    {key}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </motion.div>
                </AnimatePresence>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className={cn(
                "min-w-[10rem]",
                "bg-gradient-to-b from-white via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800"
              )}
            >
              <DropdownMenuItem
                onSelect={() => setKey("all")}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">All</div>
              </DropdownMenuItem>
              {items.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  onSelect={() => setKey(item.title)}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 capitalize">
                    {item.key}
                  </div>
                  {key === item.key && (
                    <Check className="w-4 h-4 text-blue-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          ""
        )}
        {library.length > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              saveToLibrary();
              toast("Successfully added to library!");
            }}
          >
            Add to library
          </Button>
        ) : (
          ""
        )}
      </div>

      <FlipReveal
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 w-full"
        keys={[key]}
        showClass="flex"
        hideClass="hidden"
      >
        {isLoading
          ? Array.from({ length: expectedCount || 6 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="w-full aspect-square rounded-md" />
              </div>
            ))
          : items.length > 0 &&
            items.map((item, index) => (
              <FlipRevealItem
                className="relative aspect-square overflow-hidden rounded-md shadow-2xl"
                key={index}
                flipKey={item.key}
              >
                <Image
                  src={isYoutube ? item.thumbnail : item.src}
                  alt={item.title}
                  fill
                  className={`object-cover hover:scale-105 cursor-pointer w-full aspect-square rounded-md transition-all ease-in
                ${library.includes(item.src) ? "brightness-50" : ""}`}
                  onClick={() => addToLibrary(item.src)}
                />
                {library.includes(item.src) && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <SquareCheck size={50} stroke="white" />
                  </div>
                )}
              </FlipRevealItem>
            ))}
      </FlipReveal>
    </div>
  );
};

export default Demo;
