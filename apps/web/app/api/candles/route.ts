import { client } from "@repo/db";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    // const { searchParams } = req.nextUrl;

    // const asset = searchParams.get("assets"); 
    // const duration = searchParams.get("duration"); 
    const data = await client.$queryRawUnsafe(`
        SELECT * FROM candle_1m WHERE symbol = 'BTCUSDT' ORDER BY bucket ASC;
        `);


  return NextResponse.json(data);
}
