import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const symbol = (searchParams.get("symbol") ?? "NIFTY").toUpperCase();
    const date = searchParams.get("date") ?? "";

    const url = `http://localhost:8001/options/${symbol}${date ? `?date=${encodeURIComponent(date)}` : ""}`;

    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Option server returned ${res.status}`);
        const data = await res.json();
        return Response.json(data);
    } catch (err: any) {
        console.error("[options]:", err.message);
        return Response.json({
            error: true,
            message: "Option server not running. Run: python option_server.py",
        }, { status: 503 });
    }
}
