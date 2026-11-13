import { Skeleton } from '@client/src/components/ui/skeleton';

interface TaskTableSkeletonProps {
  rows?: number;
  showModule?: boolean;
}

const TaskTableSkeleton = ({
  rows = 8,
  showModule = true,
}: TaskTableSkeletonProps) => {
  return (
    <div className="space-y-2.5 p-2" aria-busy="true" aria-label="任务数据加载中">
      {Array.from({ length: rows }).map((_, i: number) => (
        <div key={i} className="flex items-center gap-3 bp-hairline-b pb-2.5">
          <Skeleton className="h-3 w-16 rounded-none" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-1/3 rounded-none" />
            <Skeleton className="h-2.5 w-1/5 rounded-none" />
          </div>
          {showModule && <Skeleton className="h-3 w-20 rounded-none" />}
          <Skeleton className="h-3 w-14 rounded-none" />
          <Skeleton className="h-3 w-12 rounded-none" />
          <Skeleton className="h-4 w-12 rounded-none" />
          <Skeleton className="h-4 w-14 rounded-none" />
        </div>
      ))}
    </div>
  );
};

export { TaskTableSkeleton };
