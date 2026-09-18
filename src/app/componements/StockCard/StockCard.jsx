"use client";

import { useEffect, useState } from "react";

import { getQuote } from "../../actions.ts";
import {
    MARKETS,
    COMMODITY_PRESETS,
    INDEX_PRESETS,
    REFRESH_INTERVAL,
    daysSince,
    calcRR,
    fmtMoney,
} from "./StockUtils.jsx";

import RangeBar from "./RangeBar.jsx";
import DragHandle from "./DragHandle.jsx";

function StockCard({
    symbol,
    market,
    target,
    stopLoss,
    entryDate,
    notes,
    qty,
    buyPrice,
    side,
    mode,
    onRemove,
    onUpdate,
    isDragging,
}) {
    const [quote, setQuote] = useState(null);
    const [showNotes, setShowNotes] = useState(false);

    const m = MARKETS[market] || MARKETS.NSE;
    const isTrading = mode !== "watch";

    useEffect(() => {
        let active = true;

        const fetchPrice = async () => {
            const ticker =
                market === "COMMODITY" || market === "INDEX"
                    ? symbol
                    : `${symbol}${m.suffix}`;

            const data = await getQuote(ticker);

            if (active) {
                setQuote(data);
            }
        };

        fetchPrice();

        const interval = setInterval(
            fetchPrice,
            REFRESH_INTERVAL
        );

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [symbol, market, m.suffix]);

    const price = quote?.price ?? null;

    const daysHeld = daysSince(entryDate);

    const rr = calcRR(
        buyPrice,
        target,
        stopLoss,
        side
    );

    const status =
        price === null
            ? "Loading"
            : !isTrading
                ? "Watching"
                : side === "buy"
                    ? price >= target
                        ? "Target hit"
                        : price <= stopLoss
                            ? "Stoploss hit"
                            : "Holding"
                    : price <= target
                        ? "Target hit"
                        : price >= stopLoss
                            ? "Stoploss hit"
                            : "Holding";

    const badgeClasses =
        status === "Target hit"
            ? "bg-green-100 text-green-700"
            : status === "Stoploss hit"
                ? "bg-red-100 text-red-700"
                : status === "Holding"
                    ? "bg-amber-100 text-amber-700"
                    : status === "Watching"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600";

    const changeColor =
        quote?.change > 0
            ? "text-green-600"
            : quote?.change < 0
                ? "text-red-600"
                : "text-gray-500";

    const rrColor =
        !rr
            ? "text-gray-400"
            : rr >= 2
                ? "text-green-600"
                : rr >= 1
                    ? "text-amber-600"
                    : "text-red-500";

    const volChgPct =
        quote?.volume && quote?.prevVolume
            ? (
                ((quote.volume - quote.prevVolume) /
                    quote.prevVolume) *
                100
            ).toFixed(1)
            : null;

    const displayName =
        market === "COMMODITY"
            ? (
                COMMODITY_PRESETS.find(
                    (c) => c.value === symbol
                )?.label ?? symbol
            )
            : market === "INDEX"
                ? (
                    INDEX_PRESETS.find(
                        (i) => i.value === symbol
                    )?.label ?? symbol
                )
                : symbol;

    return (
        <div
            className={`flex h-full flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm transition-all duration-150 ${isDragging
                ? "scale-95 border-blue-400 opacity-50 shadow-lg"
                : "border-gray-200"
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <DragHandle />

                    <h3 className="text-base font-semibold text-gray-900">
                        {displayName}
                    </h3>

                    <span className="text-[10px] font-medium text-gray-400">
                        {m.label}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() =>
                            onUpdate(
                                "mode",
                                isTrading ? "watch" : "trade"
                            )
                        }
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors ${isTrading
                            ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                            }`}
                    >
                        {isTrading ? "Trading" : "Watch"}
                    </button>

                    {isTrading && (
                        <button
                            onClick={() =>
                                setShowNotes((v) => !v)
                            }
                            className="text-xs text-gray-400 transition-colors hover:text-blue-500"
                        >
                            📝
                        </button>
                    )}

                    <button
                        onClick={onRemove}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 text-base leading-none text-gray-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    >
                        ×
                    </button>
                </div>
            </div>

            {/* Qty */}
            {isTrading && (
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                        Qty
                    </span>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() =>
                                onUpdate(
                                    "qty",
                                    Math.max(
                                        1,
                                        (qty || 1) - 1
                                    )
                                )
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-100"
                        >
                            −
                        </button>

                        <input
                            type="number"
                            value={qty || 1}
                            min={1}
                            onChange={(e) =>
                                onUpdate(
                                    "qty",
                                    Math.max(
                                        1,
                                        Number(e.target.value)
                                    )
                                )
                            }
                            className="w-16 rounded-md border border-gray-300 py-0.5 text-center text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                            onClick={() =>
                                onUpdate(
                                    "qty",
                                    (qty || 1) + 1
                                )
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-100"
                        >
                            +
                        </button>
                    </div>

                    <span className="text-xs text-gray-400">
                        {price !== null && qty
                            ? fmtMoney(
                                price * qty,
                                market
                            )
                            : ""}
                    </span>
                </div>
            )}

            {/* Buy / Sell */}
            {isTrading && (
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                        Direction
                    </span>

                    <div className="flex overflow-hidden rounded-md border border-gray-300 text-xs font-medium">
                        <button
                            onClick={() =>
                                onUpdate("side", "buy")
                            }
                            className={`px-3 py-1 transition-colors ${side === "buy"
                                ? "bg-green-500 text-white"
                                : "bg-white text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            Buy
                        </button>

                        <button
                            onClick={() =>
                                onUpdate("side", "sell")
                            }
                            className={`px-3 py-1 transition-colors ${side === "sell"
                                ? "bg-red-500 text-white"
                                : "bg-white text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            Sell
                        </button>
                    </div>
                </div>
            )}

            {/* Price */}
            <p className="text-2xl font-semibold text-gray-900">
                {price !== null
                    ? fmtMoney(price, market)
                    : "..."}
            </p>

            {/* Change */}
            {quote?.change !== undefined &&
                quote?.change !== null && (
                    <p
                        className={`text-sm font-medium ${changeColor}`}
                    >
                        {quote.change >= 0 ? "+" : ""}
                        {quote.change.toFixed(2)} (
                        {quote.changePercent?.toFixed(2)}
                        %)
                    </p>
                )}

            {/* Status */}
            <span
                className={`self-start rounded-md px-2.5 py-1 text-xs font-medium ${badgeClasses}`}
            >
                {status}
            </span>

            {/* 52W Range */}
            {quote?.low52Week &&
                quote?.high52Week && (
                    <RangeBar
                        price={price}
                        low52={quote.low52Week}
                        high52={quote.high52Week}
                        market={market}
                        fmtMoney={fmtMoney}
                    />
                )}

            {/* Stats */}
            {isTrading && (
                <div className="mt-1 grid grid-cols-3 gap-1 text-center">
                    <div className="rounded-lg bg-gray-50 px-2 py-1.5">
                        <p className="text-[10px] text-gray-400">
                            Volume
                        </p>
                        <p className="text-xs font-semibold text-gray-700">
                            {quote?.volume
                                ? (
                                    quote.volume /
                                    1_00_000
                                ).toFixed(1) + "L"
                                : "-"}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 px-2 py-1.5">
                        <p className="text-[10px] text-gray-400">
                            Prev Vol
                        </p>
                        <p className="text-xs font-semibold text-gray-700">
                            {quote?.prevVolume
                                ? (
                                    quote.prevVolume /
                                    1_00_000
                                ).toFixed(1) + "L"
                                : "-"}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 px-2 py-1.5">
                        <p className="text-[10px] text-gray-400">
                            Vol chg
                        </p>
                        <p
                            className={`text-xs font-semibold ${volChgPct === null
                                ? "text-gray-400"
                                : Number(volChgPct) > 0
                                    ? "text-blue-600"
                                    : "text-red-500"
                                }`}
                        >
                            {volChgPct !== null
                                ? `${volChgPct}%`
                                : "-"}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 px-2 py-1.5">
                        <p className="text-[10px] text-gray-400">
                            Days held
                        </p>
                        <p className="text-xs font-semibold text-gray-700">
                            {daysHeld !== null
                                ? `${daysHeld}d`
                                : "-"}
                        </p>
                    </div>

                    <div className="col-span-2 rounded-lg bg-gray-50 px-2 py-1.5">
                        <p className="text-[10px] text-gray-400">
                            R : R
                        </p>
                        <p
                            className={`text-xs font-semibold ${rrColor}`}
                        >
                            {rr ? `1 : ${rr}` : "-"}
                        </p>
                    </div>
                </div>
            )}

            {/* Inputs */}
            {isTrading && (
                <div className="mt-1 flex flex-col gap-1.5">
                    <label className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                            Target (
                            {price !== null
                                ? (
                                    target - price
                                ).toFixed(2)
                                : "-"}
                            )
                        </span>

                        <input
                            type="number"
                            value={target}
                            onChange={(e) =>
                                onUpdate(
                                    "target",
                                    e.target.value
                                )
                            }
                            className="w-24 rounded-md border border-gray-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </label>

                    <label className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                            Stop Loss (
                            {price !== null
                                ? (
                                    price - stopLoss
                                ).toFixed(2)
                                : "-"}
                            )
                        </span>

                        <input
                            type="number"
                            value={stopLoss}
                            onChange={(e) =>
                                onUpdate(
                                    "stopLoss",
                                    e.target.value
                                )
                            }
                            className="w-24 rounded-md border border-gray-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </label>

                    <label className="flex items-center justify-between text-sm text-gray-600">
                        <span>Entry date</span>

                        <input
                            type="date"
                            value={entryDate || ""}
                            onChange={(e) =>
                                onUpdate(
                                    "entryDate",
                                    e.target.value
                                )
                            }
                            className="w-36 rounded-md border border-gray-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </label>

                    <label className="flex items-center justify-between text-sm text-gray-600">
                        <span>Buy Price</span>

                        <input
                            type="number"
                            value={buyPrice || ""}
                            onChange={(e) =>
                                onUpdate(
                                    "buyPrice",
                                    e.target.value
                                )
                            }
                            placeholder="0"
                            className="w-24 rounded-md border border-gray-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </label>
                </div>
            )}

            {/* P&L */}
            {isTrading &&
                buyPrice > 0 &&
                price !== null &&
                qty > 0 &&
                (() => {
                    const pnl =
                        side === "buy"
                            ? (price - buyPrice) * qty
                            : (buyPrice - price) * qty;

                    const pnlPct =
                        side === "buy"
                            ? ((price - buyPrice) /
                                buyPrice) *
                            100
                            : ((buyPrice - price) /
                                buyPrice) *
                            100;

                    const isProfit = pnl >= 0;

                    return (
                        <div
                            className={`rounded-lg px-3 py-2 ${isProfit
                                ? "border border-green-100 bg-green-50"
                                : "border border-red-100 bg-red-50"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-gray-400">
                                    P&L (
                                    {daysHeld !== null
                                        ? `${daysHeld}d`
                                        : "0d"}
                                    )
                                </span>

                                <span
                                    className={`text-[10px] font-medium ${isProfit
                                        ? "text-green-600"
                                        : "text-red-500"
                                        }`}
                                >
                                    {pnlPct.toFixed(2)}%
                                </span>
                            </div>

                            <p
                                className={`text-base font-semibold ${isProfit
                                    ? "text-green-600"
                                    : "text-red-500"
                                    }`}
                            >
                                {isProfit ? "+" : ""}
                                {fmtMoney(pnl, market)}
                            </p>

                            <div className="mt-0.5 flex justify-between text-[10px] text-gray-400">
                                <span>
                                    Buy{" "}
                                    {fmtMoney(
                                        buyPrice,
                                        market
                                    )}
                                </span>

                                <span>
                                    Now{" "}
                                    {fmtMoney(
                                        price,
                                        market
                                    )}
                                </span>
                            </div>
                        </div>
                    );
                })()}

            {/* Notes */}
            {isTrading && showNotes && (
                <textarea
                    value={notes || ""}
                    onChange={(e) =>
                        onUpdate(
                            "notes",
                            e.target.value
                        )
                    }
                    placeholder="Trade thesis, setup, key levels..."
                    rows={3}
                    className="mt-1 w-full resize-none rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            )}
        </div>
    );
}

export default StockCard;
