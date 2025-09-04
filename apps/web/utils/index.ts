import { UTCTimestamp } from "lightweight-charts";

export function isoToUTCTimestamp(isoDate: string): UTCTimestamp {
  return Math.floor(new Date(isoDate).getTime() / 1000) as UTCTimestamp;
}

export interface CandleApiData {
  symbol: string;
  bucket: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}