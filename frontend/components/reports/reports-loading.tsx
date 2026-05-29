import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export function ReportsLoading() {
  return (
    <main className="min-h-screen bg-background report-grid-bg">
      <section className="container py-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="flex gap-2">
              <SkeletonBlock className="h-6 w-24" />
              <SkeletonBlock className="h-6 w-28" />
            </div>
            <SkeletonBlock className="h-10 w-72 max-w-full" />
            <SkeletonBlock className="h-5 w-[38rem] max-w-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-10 w-28" />
            <SkeletonBlock className="h-10 w-24" />
            <SkeletonBlock className="h-10 w-28" />
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-5">
                <SkeletonBlock className="h-9 w-9" />
                <SkeletonBlock className="mt-4 h-4 w-28" />
                <SkeletonBlock className="mt-2 h-8 w-20" />
                <SkeletonBlock className="mt-2 h-3 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SkeletonBlock className="h-12 w-full lg:w-[34rem]" />
          <SkeletonBlock className="h-10 w-full lg:w-80" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader className="space-y-2">
              <SkeletonBlock className="h-6 w-48" />
              <SkeletonBlock className="h-4 w-72 max-w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-2">
              <SkeletonBlock className="h-6 w-40" />
              <SkeletonBlock className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
