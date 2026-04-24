"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    let chart: import("echarts").ECharts | null = null;
    let cancelled = false;

    async function renderChart() {
      const echarts = await import("echarts");
      if (!chartRef.current || cancelled) return;

      chart = echarts.init(chartRef.current);
      chart.setOption(option);

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
        <div ref={chartRef} className="w-full" style={{ height }} />
      </CardContent>
    </Card>
  );
}
