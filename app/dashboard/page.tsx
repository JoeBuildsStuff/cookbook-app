import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 h-full min-h-[80vh] w-full">
      {/* KPI Header Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-36 w-full rounded-lg bg-secondary/50" />
        <div className="h-36 w-full rounded-lg bg-secondary/50" />
        <div className="h-36 w-full rounded-lg bg-secondary/50" />
      </div>
      {/* Main Content Skeleton */}
      <div className="flex-1 flex">
        <div className="w-full h-full min-h-[300px] rounded-xl bg-secondary/50" />
      </div>
    </div>
  );
}
