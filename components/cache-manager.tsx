"use client";

import { Button } from "@/components/ui/button";
import { useSearchCache } from "@/hooks/useSearch";
import { Trash2, RefreshCw, Database } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const CacheManager = () => {
  const { invalidateSearchCache, clearSearchCache } = useSearchCache();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      clearSearchCache();
      toast.success("Cache cleared successfully!");
    } catch {
      toast.error("Failed to clear cache");
    } finally {
      setIsClearing(false);
    }
  };

  const handleRefreshCache = async () => {
    try {
      invalidateSearchCache();
      toast.success(
        "Cache invalidated. Fresh data will be fetched on next search."
      );
    } catch {
      toast.error("Failed to refresh cache");
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Database className="w-4 h-4 text-gray-500" />
      <span className="text-xs text-gray-600 dark:text-gray-300">Cache:</span>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefreshCache}
        className="h-6 px-2 text-xs"
      >
        <RefreshCw className="w-3 h-3 mr-1" />
        Refresh
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleClearCache}
        disabled={isClearing}
        className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
      >
        <Trash2 className="w-3 h-3 mr-1" />
        Clear
      </Button>
    </div>
  );
};
