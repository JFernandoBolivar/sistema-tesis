"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Icon } from "@phosphor-icons/react";

interface ChartCardProps {
  title: string;
  icon?: Icon;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  icon: IconComponent,
  loading = false,
  className,
  children,
}: ChartCardProps) {
  if (loading) {
    return (
      <Card className={cn("p-5", className)}>
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </Card>
    );
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          {IconComponent && (
            <IconComponent className="size-4 text-muted-foreground" weight="bold" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  );
}
