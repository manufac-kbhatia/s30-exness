"use client";
import { useEffect, useState } from "react";
import { CandleApiData, isoToUTCTimestamp } from "../utils";
import { CandlestickData } from "lightweight-charts";

export default function Home() {
  const [candles, setCandles] = useState<CandlestickData[]>();
  const [bookTicker, setBookTicker] = useState<{ 
    bid: number; 
    ask: number; 
    markup: number; 
    dynamicSpread: number; 
  }>();
  
  useEffect(() => {
    const ws = new WebSocket(
      "ws://localhost:8080"
    );

    ws.onmessage = (event) => {
    const {bid,ask} = JSON.parse(event.data);
    setBookTicker({bid, ask, markup: 1, dynamicSpread: ask - bid})
    }

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    async function getCandles() {
      const res = await fetch("/api/candles");
      const data = (await res.json()) as CandleApiData[];
      const candlesData: CandlestickData[] = data.map((candle) => ({
        time: isoToUTCTimestamp(candle.bucket),
        open: Number(candle.open),
        close: Number(candle.close),
        high: Number(candle.high),
        low: Number(candle.low),
      }));
      setCandles(candlesData);
    }

    getCandles();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>BTC/USDT Ticker Comparison</h2>
      
      {/* Original Binance Data */}
      {bookTicker && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Original Binance Data</h3>
          <div>Bid: ${bookTicker.bid}</div>
          <div>Ask: ${bookTicker.ask}</div>
          <div>Spread: ${(bookTicker.ask - bookTicker.bid).toFixed(2)} USD</div>
        </div>
      )}

      {/* Uncomment to show chart */}
      {/* {candles && <CandleChart candles={candles} />} */}
    </div>
  );
}