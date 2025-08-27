import RapidSearchResults from "@/components/rapid-search-results";
import RapidSearchInput from "@/components/ui/rapid-search-input";
import { ReactQueryProvider } from "@/lib/react-query";

const page = () => {
  return (
    <ReactQueryProvider>
      <div className="mt-20 min-h-screen bg-background">
        {/* Header Section */}
        <h2 className="text-lg text-center sm:text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
          What do you want to search?
        </h2>

        {/* Search Section */}
        <div className="w-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <RapidSearchInput />
          </div>
        </div>

        {/* Results Section */}
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <RapidSearchResults />
          </div>
        </div>
      </div>
    </ReactQueryProvider>
  );
};

export default page;
