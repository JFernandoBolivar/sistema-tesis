"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Icon } from "@phosphor-icons/react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: Icon;
  iconColor?: string;
  loading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: IconComponent,
  iconColor = "text-chart-1",
  loading = false,
  className,
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className="p-5 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-16" />
      </Card>
    );
  }

  return (
    <Card className={cn("p-5 flex items-start gap-4", className)}>
      <div
        className={cn(
          "size-11 rounded-lg flex items-center justify-center shrink-0",
          "bg-linear-to-br from-chart-1/20 to-chart-2/10",
        )}
      >
        <IconComponent className={cn("size-5", iconColor)} weight="bold" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{title}</p>
        <p className="text-2xl font-bold text-foreground tracking-tight tabular-nums">
          {value}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </Card>
  );
}
