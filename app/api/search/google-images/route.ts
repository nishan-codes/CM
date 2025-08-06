import { NextRequest, NextResponse } from "next/server";
import pLimit from "p-limit";

const API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
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
    const actualNum = Math.min(PER_CALL, resultsPerTerm - (i * PER_CALL));

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

  return allItems.map((item: GoogleImageItem) => ({
    title: item.title,
    thumbnail: item.image?.thumbnailLink || item.link,
    url: item.link,
  }));
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { terms, resultsPerTerm } = body;

    if (
      !Array.isArray(terms) ||
      terms.length === 0 ||
      typeof resultsPerTerm !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const tasks = terms.map((term: string) =>
      limit(() => fetchImagesForTerm(term, resultsPerTerm))
    );

    const allResults = (await Promise.all(tasks)).flat();

    console.log(allResults)

    return NextResponse.json({ results: allResults, totalResults: allResults.length }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';

    console.error("error in /api/google-images", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch images. " },
      { status: 500 }
    );
  }
}
