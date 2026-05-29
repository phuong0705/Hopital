"use client";

import { useEffect, useRef, useState } from "react";
import type { EChartsOption } from "echarts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function EChartsPanel({
  title,
  description,
  option,
  height = 320
}: {
  title: string;
  description?: string;
  option: EChartsOption;
  height?: number;
}) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let chart: import("echarts").ECharts | null = null;
    let cancelled = false;
    setIsReady(false);

    async function renderChart() {
      const echarts = await import("echarts");
      if (!chartRef.current || cancelled) return;

      chart = echarts.init(chartRef.current);
      chart.setOption(option);
      setIsReady(true);

      const resize = () => chart?.resize();
      window.addEventListener("resize", resize);

      return () => window.removeEventListener("resize", resize);
    }

    let cleanup: (() => void) | undefined;
    renderChart().then((fn) => {
      cleanup = fn;
    });

    return () => {
      cancelled = true;
      cleanup?.();
      chart?.dispose();
    };
  }, [option]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className="relative w-full" style={{ height }}>
          {!isReady ? (
            <div className="absolute inset-0 space-y-3 rounded-md border bg-muted/20 p-4">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="flex h-[calc(100%-2rem)] items-end gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex-1 animate-pulse rounded-t bg-muted"
                    style={{ height: `${32 + ((index * 17) % 52)}%` }}
                  />
                ))}
              </div>
            </div>
          ) : null}
          <div ref={chartRef} className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
