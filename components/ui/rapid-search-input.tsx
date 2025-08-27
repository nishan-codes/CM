"use client";

import {
  ArrowRight,
  BookImage,
  Bot,
  Check,
  ChevronDown,
  Youtube,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchStore } from "@/lib/store";
import { useSearch, useSearchCache } from "@/hooks/useSearch";
import { toast } from "sonner";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;

      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

const OPENAI_ICON = <Youtube className="w-4 h-4" />;

export default function RapidSearchInput() {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 300,
  });
  const [platform, setPlatform] = useState<"Youtube" | "Google Images">(
    "Google Images"
  );
  const [resultsPerTerm, setResultsPerTerm] = useState(1);
  const { setSearchResults, setExpectedCount, setSearchTerms } =
    useSearchStore();

  // React Query hooks
  const searchMutation = useSearch();
  const { getCachedResult } = useSearchCache();

  const platforms = ["Youtube", "Google Images"] as const;
  const count = [1, 5, 10];

  const MODEL_ICONS: Record<string, React.ReactNode> = {
    Youtube: OPENAI_ICON,
    "Google Images": <BookImage className="w-4 h-4" />,
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault();
      handleSearch();
      adjustHeight(true);
    }
  };

  const handleSearch = async () => {
    const terms = value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (terms.length === 0) {
      toast.error("Please enter at least one search term");
      return;
    }

    const searchParams = { terms, resultsPerTerm, platform };

    // Store search terms in Zustand for filtering
    setSearchTerms(terms);

    // Check cache first
    const cachedResult = getCachedResult(searchParams);
    if (cachedResult) {
      setSearchResults(cachedResult.results);
      toast.success(`Found ${cachedResult.results.length} cached results!`);
      return;
    }

    // Set expected count for loading state
    setExpectedCount(terms.length * resultsPerTerm);

    // Execute search with React Query
    searchMutation.mutate(searchParams, {
      onSuccess: (data) => {
        setSearchResults(data.results);
        toast.success(`Found ${data.results.length} new results!`);
      },
      onError: (error) => {
        toast.error(`Search failed: ${error.message}`);
        setSearchResults([]);
      },
    });
  };

  // Update loading state based on mutation status
  useEffect(() => {
    // This will be handled by the Results component based on mutation state
  }, [searchMutation.isPending]);

  return (
    <div className="w-full">
      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="relative">
          <div className="relative flex flex-col">
            <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
              <Textarea
                id="rapid-search-input"
                value={value}
                placeholder="Try searching: React, Vue, Angular, or any technology..."
                className={cn(
                  "w-full rounded-t-2xl px-4 sm:px-6 py-4 sm:py-6 bg-transparent border-none text-foreground placeholder:text-muted-foreground resize-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent text-base sm:text-lg font-medium",
                  "min-h-[100px] sm:min-h-[120px]"
                )}
                ref={textareaRef}
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  setValue(e.target.value);
                  adjustHeight();
                }}
                disabled={searchMutation.isPending}
              />
            </div>

            <div className="border-t border-border bg-muted/50 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  {/* Platform Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2 h-9 sm:h-10 px-3 sm:px-4 text-sm font-medium rounded-lg bg-background border-input text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        disabled={searchMutation.isPending}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={platform}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-2"
                          >
                            {MODEL_ICONS[platform]}
                            <span className="font-medium">{platform}</span>
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
                      {platforms.map((model) => (
                        <DropdownMenuItem
                          key={model}
                          onSelect={() => setPlatform(model)}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            {MODEL_ICONS[model] || (
                              <Bot className="w-4 h-4 opacity-50" />
                            )}
                            <span>{model}</span>
                          </div>
                          {platform === model && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Results Count Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2 h-9 sm:h-10 px-3 sm:px-4 text-sm font-medium rounded-lg bg-background border-input text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        disabled={searchMutation.isPending}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={resultsPerTerm}
                            initial={{ opacity: 0, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-2"
                          >
                            <span className="font-medium">
                              {resultsPerTerm} results
                            </span>
                            <ChevronDown className="w-4 h-4 opacity-50" />
                          </motion.div>
                        </AnimatePresence>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className={cn(
                        "min-w-[8rem] shadow-lg border border-border",
                        "bg-popover rounded-lg"
                      )}
                    >
                      {count.map((num) => (
                        <DropdownMenuItem
                          key={num}
                          onSelect={() => setResultsPerTerm(num)}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span>{num}</span>
                          </div>
                          {resultsPerTerm === num && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Search Button */}
                <Button
                  type="button"
                  className={cn(
                    "h-9 sm:h-10 px-4 sm:px-6 bg-blue-500 hover:bg-blue-500/90 cursor-pointer text-primary-foreground font-medium rounded-lg shadow-sm",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
                    searchMutation.isPending && "animate-pulse"
                  )}
                  disabled={!value.trim() || searchMutation.isPending}
                  onClick={() => {
                    if (!value.trim() || searchMutation.isPending) return;
                    handleSearch();
                    adjustHeight(true);
                  }}
                >
                  {searchMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Search</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {searchMutation.isError && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-destructive rounded-full flex-shrink-0" />
            <p className="text-sm font-medium text-destructive">
              Search failed. Please try again.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
