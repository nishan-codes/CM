import { NextRequest, NextResponse } from "next/server";
import pLimit from "p-limit";
import { deduplicateImages, isValidImageUrl } from "@/lib/image-utils";

const API_KEY = process.env.GOOGLE_SEARCH_API_KEY!;
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID!;
const PER_CALL = 10;

const limit = pLimit(5);

interface GoogleImageItem {
  title: string;
  link: string;
  displayLink: string;
  image?: {
    thumbnailLink: string;
    width: number;
    height: number;
  };
}

const fetchImagesForTerm = async (term: string, resultsPerTerm: number) => {
  const callsNeeded = Math.ceil(resultsPerTerm / PER_CALL);
  const allItems: GoogleImageItem[] = [];

  for (let i = 0; i < callsNeeded; i++) {
    const start = i * PER_CALL + 1;
    const actualNum = Math.min(PER_CALL, resultsPerTerm - i * PER_CALL);

    const res = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}` +
        `&q=${encodeURIComponent(
          term
        )}&searchType=image&num=${actualNum}&start=${start}`
    );

    if (!res.ok) {
      throw new Error(`API error ${res.status} for term ${term}`);
    }

    const data = await res.json();
    if (data.items) allItems.push(...data.items);
  }

  // Map items and only filter out known problematic domains
  const mappedItems = allItems
    .map((item: GoogleImageItem) => ({
      title: item.title,
      thumbnail: item.image?.thumbnailLink || item.link,
      url: item.link,
    }))
    .filter((item) => {
      // Only filter out known social media redirects
      return isValidImageUrl(item.url);
    });

  return mappedItems;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { terms, resultsPerTerm } = body;

    if (
      !Array.isArray(terms) ||
      terms.length === 0 ||
      typeof resultsPerTerm !== "number" ||
      !terms.every((term) => typeof term === "string" && term.trim().length > 0)
    ) {
      return NextResponse.json(
        { error: "Invalid request body. Terms must be non-empty strings." },
        { status: 400 }
      );
    }

    const tasks = terms.map((term: string) =>
      limit(() => fetchImagesForTerm(term, resultsPerTerm))
    );

    const allResults = (await Promise.all(tasks)).flat();

    // Only deduplicate - no aggressive filtering
    const deduplicatedResults = deduplicateImages(allResults);

    // Only filter out obvious spam/error cases
    const filteredResults = deduplicatedResults.filter((result) => {
      // Keep results with any meaningful title
      if (!result.title || result.title.trim().length < 2) return false;

      // Only filter out obvious error cases
      const title = result.title.toLowerCase();
      if (title === "error" || title === "404" || title === "not found") {
        return false;
      }

      return true;
    });

    console.log(
      `Original: ${allResults.length}, After deduplication: ${deduplicatedResults.length}, After filtering: ${filteredResults.length}`
    );

    return NextResponse.json(
      { results: filteredResults, totalResults: filteredResults.length },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    console.error("error in /api/google-images", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch images. " },
      { status: 500 }
    );
  }
}
