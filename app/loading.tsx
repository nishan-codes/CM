import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex w-full flex-1 flex-col gap-2 border border-border bg-white pt-14 md:pt-19 px-5 sm:px-6 lg:px-8">
      {/* Page Title */}
      <Skeleton className="h-6 w-[200px]" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 shadow-sm bg-card border border-border rounded-lg flex flex-col gap-3"
          >
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-6 w-[100px]" />
            <Skeleton className="h-8 w-8 rounded-full self-end" />
            <Skeleton className="h-3 w-[120px]" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="mt-4 p-4 shadow-sm border border-border rounded-lg bg-card">
        <Skeleton className="h-5 w-[180px]" />
        <Skeleton className="h-[250px] w-full mt-4 rounded-lg" />
      </div>

      {/* Table Skeleton */}
      <div className="my-4 p-4 border border-border bg-card rounded-lg shadow-sm space-y-4">
        <Skeleton className="h-6 w-[240px]" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-[20%]" />
              <Skeleton className="h-4 w-[30%]" />
              <Skeleton className="h-4 w-[25%]" />
              <Skeleton className="h-4 w-[15%]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
