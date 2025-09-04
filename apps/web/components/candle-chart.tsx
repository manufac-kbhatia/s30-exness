"use client";
import {
  TimeChartOptions,
  createChart,
  ColorType,
  DeepPartial,
  CandlestickSeries,
  CandlestickData,
  LineSeries,
  LineData,
  UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

const chartOptions: DeepPartial<TimeChartOptions> = {
  layout: {
    textColor: "black",
    background: { type: ColorType.Solid, color: "white" },
    fontSize: 12,
    fontFamily: "Arial",
  },
  rightPriceScale: {
    borderColor: "#000000ff",
  },
  timeScale: {
    borderColor: "#000000ff",
  },
};
interface CandleChartProps {
  candles: CandlestickData[];
}
export function CandleChart({ candles }: CandleChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  console.log(candles.length);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chart = createChart(chartContainerRef.current, chartOptions);
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      wickVisible: true,
      borderVisible: true,
      borderColor: "black",
      title: "BTCUSDT",
    });
    const priceLine = candlestickSeries.createPriceLine({
      price: 108500, // initial price
      color: "red",
      lineWidth: 1,
      axisLabelVisible: true,
    });

    priceLine.applyOptions({
      price: 108600,
    });

    chart.timeScale().applyOptions({
    timeVisible: true,
    secondsVisible: false,
  });

    candlestickSeries.setData(candles);
    chart.timeScale().fitContent();
  }, [candles]);

  return (
    <div
      ref={chartContainerRef}
      style={{ width: "50%", height: "400px" }}
    ></div>
  );
}
