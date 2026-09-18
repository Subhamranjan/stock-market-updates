"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import ChartSection from "./ChartSection";

import {
    BASE_TICKER,
    BASE_LABEL,
    INDEX_GROUPS,
    INDEX_RANGES,
    INDEX_LINECOLORS,
} from "./compareChartConfig";

import { normalizeSeries } from "./ChartUtils";

/*
|--------------------------------------------------------------------------
| Compare Chart
|--------------------------------------------------------------------------
*/

function CompareChart({ onClose }) {
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [activeGroup, setActiveGroup] =
        useState("Broad Market");

    const [selected, setSelected] =
        useState([]);

    const [range, setRange] =
        useState(INDEX_RANGES[3]);

    const [seriesData, setSeriesData] =
        useState({});

    const [baseData, setBaseData] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [baseLoading, setBaseLoading] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Load Base Index
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let cancelled = false;

        async function loadBase() {
            setBaseLoading(true);

            try {
                const response =
                    await fetch(
                        `/api/index-history?ticker=${encodeURIComponent(
                            BASE_TICKER
                        )}&range=${range.value}`,
                        {
                            cache: "no-store",
                        }
                    );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load base index"
                    );
                }

                const data =
                    await response.json();

                if (!cancelled) {
                    setBaseData(
                        normalizeSeries(data)
                    );
                }
            } catch (error) {
                console.error(
                    "Base index error:",
                    error
                );

                if (!cancelled) {
                    setBaseData([]);
                }
            } finally {
                if (!cancelled) {
                    setBaseLoading(false);
                }
            }
        }

        loadBase();

        return () => {
            cancelled = true;
        };
    }, [range]);

    /*
    |--------------------------------------------------------------------------
    | Load Selected Indices
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let cancelled = false;

        async function loadSelectedIndices() {
            if (selected.length === 0) {
                setSeriesData({});
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const results =
                    await Promise.all(
                        selected.map(
                            async (ticker) => {
                                const response =
                                    await fetch(
                                        `/api/index-history?ticker=${encodeURIComponent(
                                            ticker
                                        )}&range=${range.value}`,
                                        {
                                            cache: "no-store",
                                        }
                                    );

                                if (!response.ok) {
                                    throw new Error(
                                        `Failed to load ${ticker}`
                                    );
                                }

                                const data =
                                    await response.json();

                                return {
                                    ticker,
                                    data: normalizeSeries(
                                        data
                                    ),
                                };
                            }
                        )
                    );

                if (cancelled) {
                    return;
                }

                const nextData = {};

                for (const item of results) {
                    nextData[item.ticker] =
                        item.data;
                }

                setSeriesData(nextData);
            } catch (error) {
                console.error(
                    "Selected index error:",
                    error
                );

                if (!cancelled) {
                    setSeriesData({});
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadSelectedIndices();

        return () => {
            cancelled = true;
        };
    }, [selected, range]);

    /*
    |--------------------------------------------------------------------------
    | Toggle Index
    |--------------------------------------------------------------------------
    */

    function toggleIndex(ticker) {
        // Base index cannot be selected again
        if (ticker === BASE_TICKER) {
            return;
        }

        setSelected((current) => {
            if (current.includes(ticker)) {
                return current.filter(
                    (item) =>
                        item !== ticker
                );
            }

            return [
                ...current,
                ticker,
            ];
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Clear All
    |--------------------------------------------------------------------------
    */

    function clearAll() {
        setSelected([]);
    }

    /*
    |--------------------------------------------------------------------------
    | Get Index Label
    |--------------------------------------------------------------------------
    */

    function getLabel(ticker) {
        if (ticker === BASE_TICKER) {
            return BASE_LABEL;
        }

        for (const group of Object.values(
            INDEX_GROUPS
        )) {
            const index = group.find(
                (item) =>
                    item.ticker === ticker
            );

            if (index) {
                return index.label;
            }
        }

        return ticker;
    }

    /*
    |--------------------------------------------------------------------------
    | Merge All Series
    |--------------------------------------------------------------------------
    |
    | Converts:
    |
    | baseData
    | seriesData
    |
    | into:
    |
    | [
    |   {
    |       date: "2026-01-01",
    |       "^NSEI": 25000,
    |       "^NSEBANK": 56000,
    |       "^CNXIT": 41000
    |   }
    | ]
    |
    */

    const mergedData = useMemo(() => {
        const allSeries = {
            [BASE_TICKER]:
                baseData,
            ...seriesData,
        };

        const dates = new Set();

        Object.values(
            allSeries
        ).forEach((series) => {
            if (
                !Array.isArray(
                    series
                )
            ) {
                return;
            }

            series.forEach((row) => {
                if (row.date) {
                    dates.add(
                        row.date
                    );
                }
            });
        });

        const sortedDates = [
            ...dates,
        ].sort();

        return sortedDates.map(
            (date) => {
                const point = {
                    date,
                };

                Object.entries(
                    allSeries
                ).forEach(
                    ([
                        ticker,
                        series,
                    ]) => {
                        const row =
                            series?.find(
                                (item) =>
                                    item.date ===
                                    date
                            );

                        point[
                            ticker
                        ] =
                            row?.value ??
                            null;
                    }
                );

                return point;
            }
        );
    }, [
        baseData,
        seriesData,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Chart Series
    |--------------------------------------------------------------------------
    */

    const chartSeries = useMemo(() => {
        return [
            {
                ticker:
                    BASE_TICKER,

                label:
                    BASE_LABEL,

                color:
                    INDEX_LINECOLORS[0],
            },

            ...selected.map(
                (
                    ticker,
                    index
                ) => ({
                    ticker,

                    label:
                        getLabel(
                            ticker
                        ),

                    color:
                        INDEX_LINECOLORS[
                        (index +
                            1) %
                        INDEX_LINECOLORS.length
                        ],
                })
            ),
        ];
    }, [selected]);

    /*
    |--------------------------------------------------------------------------
    | Raw Data Lookup
    |--------------------------------------------------------------------------
    |
    | Used by ChartTooltip.
    |
    */

    function getSeriesData(
        ticker,
        date
    ) {
        if (
            ticker ===
            BASE_TICKER
        ) {
            return baseData.find(
                (row) =>
                    row.date ===
                    date
            );
        }

        return seriesData[
            ticker
        ]?.find(
            (row) =>
                row.date ===
                date
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Latest Close Values
    |--------------------------------------------------------------------------
    */

    const latestValues =
        useMemo(() => {
            const result = {};

            for (const series of chartSeries) {
                const data =
                    series.ticker ===
                        BASE_TICKER
                        ? baseData
                        : seriesData[
                        series.ticker
                        ];

                if (
                    !data ||
                    data.length === 0
                ) {
                    result[
                        series.ticker
                    ] = null;

                    continue;
                }

                const validRows =
                    data.filter(
                        (row) =>
                            row.close !==
                            null &&
                            row.close !==
                            undefined &&
                            Number.isFinite(
                                Number(
                                    row.close
                                )
                            )
                    );

                result[
                    series.ticker
                ] =
                    validRows.length >
                        0
                        ? validRows[
                            validRows.length -
                            1
                        ].close
                        : null;
            }

            return result;
        }, [
            chartSeries,
            baseData,
            seriesData,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Current Group
    |--------------------------------------------------------------------------
    */

    const currentGroup =
        INDEX_GROUPS[
        activeGroup
        ] || [];

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    const isLoading =
        baseLoading ||
        loading;

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="fixed inset-0 z-50 bg-white">

            {/* ------------------------------------------------------------ */}
            {/* Header */}
            {/* ------------------------------------------------------------ */}

            <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-5">

                {/* Title */}
                <div>
                    <h1 className="text-lg font-semibold">
                        📊 Nifty 50 — Compare Chart
                    </h1>

                    <p className="text-xs text-zinc-500">
                        Compare index closing prices
                    </p>
                </div>

                {/* Header Controls */}
                <div className="flex items-center gap-2">

                    {/* Range */}
                    <div className="flex rounded-lg border border-zinc-200 p-1">

                        {INDEX_RANGES.map(
                            (item) => (
                                <button
                                    key={
                                        item.value
                                    }
                                    onClick={() =>
                                        setRange(
                                            item
                                        )
                                    }
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${range.value ===
                                        item.value
                                        ? "bg-zinc-900 text-white"
                                        : "text-zinc-500 hover:bg-zinc-100"
                                        }`}
                                >
                                    {
                                        item.label
                                    }
                                </button>
                            )
                        )}
                    </div>

                    {/* Clear */}
                    <button
                        onClick={
                            clearAll
                        }
                        className="rounded-lg border border-zinc-200 px-3 py-2 text-xs hover:bg-zinc-100"
                    >
                        Clear All
                    </button>

                    {/* Close */}
                    <button
                        onClick={
                            onClose
                        }
                        className="rounded-lg border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-100"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Main */}
            {/* ------------------------------------------------------------ */}

            <div className="flex h-[calc(100vh-64px)]">

                {/* -------------------------------------------------------- */}
                {/* Sidebar */}
                {/* -------------------------------------------------------- */}

                <aside className="w-64 shrink-0 overflow-y-auto border-r border-zinc-200">

                    {/* Base Index */}
                    <div className="border-b border-zinc-200 p-4">

                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Base Index
                        </div>

                        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">

                            <span className="text-sm font-medium">
                                {
                                    BASE_LABEL
                                }
                            </span>

                            <span className="text-xs text-zinc-500">
                                Base
                            </span>
                        </div>
                    </div>

                    {/* Groups */}
                    <div className="flex border-b border-zinc-200">

                        {Object.keys(
                            INDEX_GROUPS
                        ).map(
                            (
                                group
                            ) => (
                                <button
                                    key={
                                        group
                                    }
                                    onClick={() =>
                                        setActiveGroup(
                                            group
                                        )
                                    }
                                    className={`flex-1 px-2 py-3 text-xs font-medium ${activeGroup ===
                                        group
                                        ? "border-b-2 border-blue-600 text-blue-600"
                                        : "text-zinc-500 hover:text-zinc-700"
                                        }`}
                                >
                                    {
                                        group
                                    }
                                </button>
                            )
                        )}
                    </div>

                    {/* Index List */}
                    <div className="p-3">

                        {currentGroup.length ===
                            0 ? (
                            <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-xs text-zinc-500">
                                No indices added yet.
                            </div>
                        ) : (
                            <div className="space-y-1">

                                {currentGroup.map(
                                    (
                                        index
                                    ) => {
                                        const isBase =
                                            index.ticker ===
                                            BASE_TICKER;

                                        const isSelected =
                                            selected.includes(
                                                index.ticker
                                            );

                                        return (
                                            <button
                                                key={
                                                    index.ticker
                                                }
                                                disabled={
                                                    isBase
                                                }
                                                onClick={() =>
                                                    toggleIndex(
                                                        index.ticker
                                                    )
                                                }
                                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${isBase
                                                    ? "cursor-default border-2 border-zinc-300 text-black"
                                                    : isSelected
                                                        ? "bg-blue-50 text-blue-700"
                                                        : "hover:bg-zinc-100"
                                                    }`}
                                            >
                                                <span>
                                                    {
                                                        index.label
                                                    }
                                                </span>

                                                {isBase ? (
                                                    <span className="text-[10px]">
                                                        BASE
                                                    </span>
                                                ) : (
                                                    <span>
                                                        {isSelected
                                                            ? "✓"
                                                            : "+"}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    }
                                )}

                            </div>
                        )}
                    </div>

                    {/* Selected */}
                    <div className="border-t border-zinc-200 p-4">

                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Selected
                        </div>

                        {selected.length ===
                            0 ? (
                            <p className="text-xs text-zinc-500">
                                No additional indices selected.
                            </p>
                        ) : (
                            <div className="space-y-2">

                                {selected.map(
                                    (
                                        ticker,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                ticker
                                            }
                                            className="flex items-center justify-between text-xs"
                                        >

                                            <div className="flex items-center gap-2">

                                                <span
                                                    className="h-2 w-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            INDEX_LINECOLORS[
                                                            (index +
                                                                1) %
                                                            INDEX_LINECOLORS.length
                                                            ],
                                                    }}
                                                />

                                                <span>
                                                    {
                                                        getLabel(
                                                            ticker
                                                        )
                                                    }
                                                </span>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    toggleIndex(
                                                        ticker
                                                    )
                                                }
                                                className="text-zinc-400 hover:text-red-500"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )
                                )}

                            </div>
                        )}
                    </div>
                </aside>

                {/* -------------------------------------------------------- */}
                {/* Chart Section */}
                {/* -------------------------------------------------------- */}

                <ChartSection
                    chartSeries={
                        chartSeries
                    }
                    latestValues={
                        latestValues
                    }
                    mergedData={
                        mergedData
                    }
                    getSeriesData={
                        getSeriesData
                    }
                    isLoading={
                        isLoading
                    }
                />
            </div>
        </div>
    );
}

export default CompareChart;
