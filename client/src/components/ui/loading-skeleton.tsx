import React from 'react';
import { cn } from "@/lib/utils";

const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
};

interface CardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ className, ...props }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
};

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-4 md:p-8">
      <div className="grid gap-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <CardSkeleton className="h-64" />
          <CardSkeleton className="h-64" />
        </div>
        <div>
          <CardSkeleton className="h-96" />
        </div>
      </div>
    </div>
  );
};

export { Skeleton, CardSkeleton, DashboardSkeleton };

// Pre-built skeleton components for common use cases
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  );
}