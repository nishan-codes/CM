import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SearchResult } from "@/lib/store";

export interface SearchParams {
  terms: string[];
  resultsPerTerm: number;
  platform: "Youtube" | "Google Images";
}

interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
}

const searchAPI = async ({
  terms,
  resultsPerTerm,
  platform,
}: SearchParams): Promise<SearchResponse> => {
  const endpoint =
    platform === "Youtube"
      ? "/api/search/youtube"
      : "/api/search/google-images";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ terms, resultsPerTerm }),
  });

  if (!res.ok) {
    throw new Error(
      `API request failed with status ${res.status}: ${res.statusText}`
    );
  }

  return res.json();
};

export const useSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: searchAPI,

    // Cache successful search results
    onSuccess: (data, variables) => {
      // Create a unique cache key for this search
      const cacheKey = [
        "search",
        variables.platform,
        variables.terms.sort().join(","),
        variables.resultsPerTerm,
      ];

      // Cache the result for future use with timestamp
      queryClient.setQueryData(cacheKey, {
        ...data,
        cachedAt: Date.now(),
        searchParams: variables,
      });

      // Cache individual term results for faster partial searches
      if (variables.resultsPerTerm > 1) {
        variables.terms.forEach((term) => {
          const singleTermKey = ["search", variables.platform, term, 1];
          const singleTermResults = data.results
            .filter(
              (result) => "searchTerm" in result && result.searchTerm === term
            )
            .slice(0, 1);

          if (singleTermResults.length > 0) {
            queryClient.setQueryData(singleTermKey, {
              results: singleTermResults,
              totalResults: singleTermResults.length,
              cachedAt: Date.now(),
              searchParams: { ...variables, terms: [term], resultsPerTerm: 1 },
            });
          }
        });
      }

      // Prefetch related searches with more results
      if (variables.resultsPerTerm < 10 && variables.terms.length === 1) {
        const higherCountKey = [
          "search",
          variables.platform,
          variables.terms[0],
          Math.min(variables.resultsPerTerm * 2, 10),
        ];

        // Only prefetch if we don't already have this data
        if (!queryClient.getQueryData(higherCountKey)) {
          queryClient.prefetchQuery({
            queryKey: higherCountKey,
            queryFn: () =>
              searchAPI({
                ...variables,
                resultsPerTerm: Math.min(variables.resultsPerTerm * 2, 10),
              }),
            staleTime: 1000 * 60 * 5, // 5 minutes
          });
        }
      }
    },

    // Error handling with retry logic
    onError: (error, variables) => {
      console.error("Search failed:", error);

      // Optionally invalidate related cache entries on certain errors
      if (error.message.includes("API request failed with status 5")) {
        // Server error - invalidate cache for this platform
        queryClient.invalidateQueries({
          queryKey: ["search", variables.platform],
          exact: false,
        });
      }
    },

    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error.message.includes("API request failed with status 4")) {
        return false;
      }
      // Retry up to 2 times for server errors
      return failureCount < 2;
    },

    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook to get cached search results without triggering a new search
export const useCachedSearch = (params: SearchParams) => {
  const queryClient = useQueryClient();
  const cacheKey = [
    "search",
    params.platform,
    params.terms.sort().join(","),
    params.resultsPerTerm,
  ];

  return queryClient.getQueryData<SearchResponse>(cacheKey);
};

// Hook to check if a search is currently in cache
export const useSearchCache = () => {
  const queryClient = useQueryClient();

  const getCachedResult = (
    params: SearchParams
  ): SearchResponse | undefined => {
    const cacheKey = [
      "search",
      params.platform,
      params.terms.sort().join(","),
      params.resultsPerTerm,
    ];
    return queryClient.getQueryData<SearchResponse>(cacheKey);
  };

  const invalidateSearchCache = () => {
    queryClient.invalidateQueries({ queryKey: ["search"] });
  };

  const clearSearchCache = () => {
    queryClient.removeQueries({ queryKey: ["search"] });
  };

  return {
    getCachedResult,
    invalidateSearchCache,
    clearSearchCache,
  };
};
