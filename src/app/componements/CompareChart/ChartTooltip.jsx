import { formatFullDate, formatNumber } from "./ChartUtils";

function ChartTooltip({
    row,
    series,
    data,
    getSeriesData,
    width,
    x,
}) {
    const tooltipWidth = 420;

    let left = x + 15;

    if (left + tooltipWidth > width) {
        left = x - tooltipWidth - 15;
    }

    left = Math.max(5, left);

    return (
        <div
            className="pointer-events-none absolute z-20 w-[420px] rounded-lg border border-zinc-200 bg-white p-4 shadow-xl"
            style={{
                left,
                top: 20,
            }}
        >
            {/* Date */}
            <div className="mb-4 border-b border-zinc-200 pb-2 text-sm font-semibold text-zinc-600">
                {formatFullDate(row.date)}
            </div>

            {/* 2 Column Index Grid */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                {series.map((item) => {
                    const raw = getSeriesData(
                        item.ticker,
                        row.date
                    );

                    if (!raw) {
                        return (
                            <div
                                key={item.ticker}
                                className="text-sm text-zinc-400"
                            >
                                {item.label}: No data
                            </div>
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | First Close
                    |--------------------------------------------------------------------------
                    */

                    const firstRow = data.find((point) => {
                        const value =
                            point[item.ticker];

                        return (
                            value !== null &&
                            value !== undefined &&
                            Number.isFinite(
                                Number(value)
                            )
                        );
                    });

                    const firstClose = firstRow
                        ? Number(
                            firstRow[item.ticker]
                        )
                        : null;

                    const currentClose =
                        Number(raw.close);

                    let change = null;

                    if (
                        firstClose !== null &&
                        firstClose !== 0 &&
                        Number.isFinite(
                            currentClose
                        )
                    ) {
                        change =
                            ((currentClose -
                                firstClose) /
                                firstClose) *
                            100;
                    }

                    return (
                        <div
                            key={item.ticker}
                            className="min-w-0"
                        >
                            {/* Index Name */}
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{
                                        backgroundColor:
                                            item.color,
                                    }}
                                />

                                <span className="truncate text-sm font-semibold text-black">
                                    {item.label}
                                </span>
                            </div>

                            {/* Close + Change */}
                            <div className="mt-1 mb-3 flex items-center gap-2">
                                <span className="text-sm font-bold text-black">
                                    {formatNumber(
                                        raw.close
                                    )}
                                </span>

                                {change !== null && (
                                    <span
                                        className={`text-xs font-semibold ${change > 0
                                                ? "text-green-600"
                                                : change < 0
                                                    ? "text-red-600"
                                                    : "text-zinc-500"
                                            }`}
                                    >
                                        {change > 0
                                            ? "+"
                                            : ""}
                                        {change.toFixed(2)}
                                        %
                                    </span>
                                )}
                            </div>

                            {/* OHLC + Volume */}
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                                <span className="font-medium text-zinc-500">
                                    Open
                                </span>

                                <span className="text-right font-semibold text-black">
                                    {formatNumber(
                                        raw.open
                                    )}
                                </span>

                                <span className="font-medium text-zinc-500">
                                    High
                                </span>

                                <span className="text-right font-semibold text-black">
                                    {formatNumber(
                                        raw.high
                                    )}
                                </span>

                                <span className="font-medium text-zinc-500">
                                    Low
                                </span>

                                <span className="text-right font-semibold text-black">
                                    {formatNumber(
                                        raw.low
                                    )}
                                </span>

                                <span className="font-medium text-zinc-500">
                                    Close
                                </span>

                                <span className="text-right font-semibold text-black">
                                    {formatNumber(
                                        raw.close
                                    )}
                                </span>

                                <span className="font-medium text-zinc-500">
                                    Shares
                                </span>

                                <span className="text-right font-semibold text-black">
                                    {formatNumber(
                                        raw.sharesTraded
                                    )}
                                </span>

                                <span className="font-medium text-zinc-500">
                                    Turnover
                                </span>

                                <span className="text-right font-semibold text-black">
                                    {formatNumber(
                                        raw.turnover
                                    )}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ChartTooltip;
