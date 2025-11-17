import { Card } from "@/components/ui/card";

export function QuizCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      {/* Cover Image Skeleton */}
      <div className="relative aspect-video skeleton" />

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <div className="h-6 skeleton rounded w-3/4" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 skeleton rounded w-full" />
          <div className="h-4 skeleton rounded w-2/3" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {/* Creator */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full skeleton" />
            <div className="h-3 skeleton rounded w-20" />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="h-3 skeleton rounded w-12" />
            <div className="h-3 skeleton rounded w-12" />
          </div>
        </div>
      </div>
    </Card>
  );
}
