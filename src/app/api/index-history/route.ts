import pool from "@/lib/db";
import { NextRequest } from "next/server";

/*
 * Map ticker -> PostgreSQL table
 *
 * Add new indices here later.
 */
const INDEX_TABLES: Record<string, string> = {
    "^NSEI": "nifty_index",
    "^NSEBANK": "nifty_bank",
    "^CNXIT": "nifty_it",

    // Future examples:
    // "^CNXAUTO": "nifty_auto",
    // "^CNXPHARMA": "nifty_pharma",
};

const RANGE_DAYS: Record<string, number> = {
    "1mo": 30,
    "3mo": 90,
    "6mo": 180,
    "1y": 365,
    "2y": 730,
    "5y": 1825,
    "10y": 3652,
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const ticker = searchParams.get("ticker");
    const range = searchParams.get("range") ?? "1y";

    if (!ticker) {
        return Response.json(
            {
                error: "Ticker is required",
            },
            {
                status: 400,
            }
        );
    }

    const tableName = INDEX_TABLES[ticker];

    if (!tableName) {
        return Response.json(
            { error: `Unknown index: ${ticker}`, },
            { status: 400, }
        );
    }

    const days = RANGE_DAYS[range] ?? 365;

    try {
        const { rows } = await pool.query(
            `
            SELECT
                "Date" AS date,
                "Open" AS open,
                "High" AS high,
                "Low" AS low,
                "Close" AS close,
                "Shares Traded" AS shares_traded,
                "Turnover (₹ Cr)" AS turnover
            FROM "${tableName}"
            WHERE "Date" >= CURRENT_DATE
                - ($1 * INTERVAL '1 day')
            ORDER BY "Date" ASC
            `,
            [days]
        );

        const data = rows.map((row) => ({
            date:
                row.date instanceof Date
                    ? row.date.toISOString().split("T")[0]
                    : String(row.date).split("T")[0],

            ticker,

            open:
                row.open !== null && row.open !== undefined
                    ? Number(row.open)
                    : null,

            high:
                row.high !== null && row.high !== undefined
                    ? Number(row.high)
                    : null,

            low:
                row.low !== null && row.low !== undefined
                    ? Number(row.low)
                    : null,

            close:
                row.close !== null && row.close !== undefined
                    ? Number(row.close)
                    : null,

            sharesTraded:
                row.shares_traded !== null &&
                    row.shares_traded !== undefined
                    ? Number(row.shares_traded)
                    : null,

            turnover:
                row.turnover !== null &&
                    row.turnover !== undefined
                    ? Number(row.turnover)
                    : null,
        }));

        return Response.json(data);
    } catch (error: any) {
        console.error(
            "GET /api/index-history:",
            error?.message || error
        );

        return Response.json(
            { error: "Failed to fetch index history", },
            { status: 500 }
        );
    }
}
