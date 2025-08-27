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
import { ArrowRight, Check, ChevronDown, SquareCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSearchStore } from "@/lib/store";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";
import { CacheManager } from "./cache-manager";

export const RapidSearchResults = () => {
  const { searchResults, expectedCount, setStoredLibrary, searchTerms } =
    useSearchStore();

  // Check if search is loading by checking if we have expected count but no results
  const isLoading = expectedCount > 0 && searchResults.length === 0;

  const [key, setKey] = useState("all");
  const [library, setLibrary] = useState<string[]>([]);

  // Filter search results by checking if search term appears in title
  const filteredSearchResults =
    key === "all"
      ? searchResults
      : searchResults.filter((result) =>
          result.title.toLowerCase().includes(key.toLowerCase())
        );

  const items = filteredSearchResults
    ? filteredSearchResults.map((result) => ({
        src: result.url,
        thumbnail: result.thumbnail,
        title: result.title,
        key: result.title,
      }))
    : [];

  const isYoutube =
    searchResults &&
    searchResults.length > 0 &&
    searchResults[0]?.url?.includes("youtube");

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

    // Save to Zustand store
    setStoredLibrary(selectedItems);

    // Clear local selection after saving
    setLibrary([]);
  };

  // Clear library selection when search results change
  useEffect(() => {
    setLibrary([]);
    setKey("all");
  }, [searchResults]);

  // Use search terms from Zustand store for filtering
  const uniqueTerms = searchTerms || [];

  // Debug logging
  console.log("searchResults:", searchResults.length);
  console.log("searchTerms from Zustand:", searchTerms);
  console.log("uniqueTerms:", uniqueTerms);

  return (
    <div className="w-full">

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-6 bg-card rounded-xl shadow-sm border border-border">
        <div className="flex items-center gap-4">
          {/* Filter Dropdown */}
          {searchResults.length > 0 && uniqueTerms.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                Filter:
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-9 px-3 text-sm font-medium rounded-lg bg-background border-input text-foreground hover:bg-accent"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2 capitalize"
                      >
                        <span className="font-medium">{key}</span>
                        <ChevronDown className="w-4 h-4 opacity-50" />
                      </motion.div>
                    </AnimatePresence>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className={cn(
                    "min-w-[12rem] shadow-lg border border-border",
                    "bg-popover rounded-lg"
                  )}
                >
                  <DropdownMenuItem
                    onSelect={() => setKey("all")}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">All</div>
                    {key === "all" && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </DropdownMenuItem>

                  {uniqueTerms.map((term, index) => (
                    <DropdownMenuItem
                      key={index}
                      onSelect={() => setKey(term)}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 capitalize">
                        {term}
                      </div>
                      {key === term && (
                        <Check className="w-4 h-4 text-blue-500" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Add to Library Button */}
          {library.length > 0 && (
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-primary-foreground font-medium rounded-lg"
              onClick={() => {
                saveToLibrary();
                toast.success(
                  `Successfully added ${library.length} items to library!`
                );
              }}
            >
              Add to library ({library.length})
            </Button>
          )}

          {/* Cache Status Indicator */}
          {searchResults.length > 0 && (
            <div className="text-sm text-muted-foreground font-medium">
              {searchResults.length} results found
            </div>
          )}

          {/* Cache Manager 
          <CacheManager /> */}
        </div>
      </div>

      {/* Results Grid */}
      <FlipReveal
        className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 w-full gap-4 space-y-4"
        keys={[key]}
        showClass="flex"
        hideClass="hidden"
      >
        {isLoading
          ? Array.from({ length: expectedCount || 6 }).map((_, index) => (
              <div key={index} className="break-inside-avoid mb-4">
                <Skeleton className="w-full h-48 rounded-xl" />
              </div>
            ))
          : items.length > 0 &&
            items.map((item, index) => (
              <FlipRevealItem
                className="group cursor-pointer break-inside-avoid mb-4"
                key={`${item.key}-${index}`}
                flipKey={key === "all" ? "all" : key}
              >
                <div
                  className={`relative overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer ${
                    library.includes(item.src)
                      ? "ring-4 ring-green-500 ring-opacity-70"
                      : ""
                  }`}
                  onClick={() => addToLibrary(item.src)}
                >
                  <Image
                    src={isYoutube ? item.thumbnail : item.src}
                    alt={item.title}
                    width={400}
                    height={300}
                    className={`w-full h-auto object-cover transition-all duration-200 group-hover:scale-105 ${
                      library.includes(item.src) ? "brightness-50" : ""
                    }`}
                  />
                  {library.includes(item.src) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <SquareCheck
                        size={32}
                        stroke="white"
                        className="drop-shadow-lg"
                      />
                    </div>
                  )}
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </FlipRevealItem>
            ))}
      </FlipReveal>

      {/* Empty State */}
      {!isLoading && searchResults.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <ArrowRight className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No search results yet
            </h3>
            <p className="text-muted-foreground">
              Enter search terms above to discover amazing content with
              lightning-fast results.
            </p>
          </div>
        </div>
      )}

      {/* No Results for Filter */}
      {!isLoading &&
        searchResults.length > 0 &&
        items.length === 0 &&
        key !== "all" && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-foreground mb-2">
                No results found for &quot;{key}&quot;
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filter or view all results.
              </p>
              <Button
                variant="outline"
                onClick={() => setKey("all")}
                className="font-medium"
              >
                Show all results
              </Button>
            </div>
          </div>
        )}
    </div>
  );
};

export default RapidSearchResults;
