"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "primary",
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{value}</span>
              {trend && (
                <span
                  className={`text-xs font-medium ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.isPositive ? "+" : "-"}
                  {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div
            className={`p-3 rounded-full bg-${color}/10`}
            style={{ backgroundColor: `hsl(var(--${color}) / 0.1)` }}
          >
            <Icon
              className="h-5 w-5"
              style={{ color: `hsl(var(--${color}))` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
