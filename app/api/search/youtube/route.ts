import { NextRequest, NextResponse } from "next/server";
import pLimit from "p-limit";

const limit = pLimit(5);
const MAX_RESULTS_PER_CALL = 50;

interface YoutubeItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: { medium: { url: string } };
    channelTitle: string;
    publishedAt: string;
  };
}

export const fetchVideosForTerm = async (
  term: string,
  resultsPerTerm: number
) => {
  const maxResults = Math.min(resultsPerTerm, MAX_RESULTS_PER_CALL);

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("key", process.env.GOOGLE_SEARCH_API_KEY!);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", term);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", maxResults.toString());

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`Youtube API Error ${res.status} for ${term}`);
  }

  const data = await res.json();

  return data.items.map((item: YoutubeItem) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.medium.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    searchTerm: term,
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

    const tasks = terms.map((term) =>
      limit(() => fetchVideosForTerm(term, resultsPerTerm))
    );

    const allResults = (await Promise.all(tasks)).flat();

    return NextResponse.json(
      {
        results: allResults,
        totalResults: allResults.length,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    console.error("Error in /api/youtube:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch YouTube videos." },
      { status: 500 }
    );
  }
}
