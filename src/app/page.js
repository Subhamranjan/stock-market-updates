"use client";

import { useState, useEffect, useRef } from "react";
import CompareChart from "./componements/CompareChart/CompareChart.jsx";
import StockCard from "./componements/StockCard/StockCard.jsx";
import { MARKETS, COMMODITY_PRESETS, INDEX_PRESETS, INDEX_GROUPS, REFERENCE_CLOCKS } from "./componements/StockCard/StockUtils.jsx";
import { clockForMarket } from "./componements/MarketClocks/MarketClocks.jsx";
import MarketBadge from "./componements/MarketClocks/MarketBadge.jsx"
import ClockSelector from "./componements/MarketClocks/ClockSelectors.jsx";

// ── Responsive columns ────────────────────────────────────────────────────────

function useResponsiveColumns(desktopColumns = 4) {
    const [columns, setColumns] = useState(desktopColumns);
    useEffect(() => {
        const compute = () => {
            const w = window.innerWidth;
            if (w < 640) return 1;
            if (w < 1024) return 2;
            return desktopColumns;
        };
        const onResize = () => setColumns(compute());
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [desktopColumns]);
    return columns;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const [stocks, setStocks] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedMarket, setSelectedMarket] = useState("NSE");
    const [loaded, setLoaded] = useState(false);
    const [commodityOpen, setCommodityOpen] = useState(false);
    const [indicesOpen, setIndicesOpen] = useState(false);
    const [visibleClocks, setVisibleClocks] = useState([]);
    const [allClocks, setAllClocks] = useState(REFERENCE_CLOCKS); // tracks full list from DB
    const [layout, setLayout] = useState("masonry");
    const columns = useResponsiveColumns(4);
    const updateTimers = useRef({});
    const [showCompare, setShowCompare] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const commodityBtnRef = useRef(null);
    const indicesBtnRef = useRef(null);
    const [commodityPos, setCommodityPos] = useState({ top: 0, left: 0 });
    const [indicesPos, setIndicesPos] = useState({ top: 0, left: 0 });

    // ── Drag state ────────────────────────────────────────────────────────────
    const dragIdx = useRef(null);       // index being dragged
    const dragOverIdx = useRef(null);   // index being hovered over
    const [draggingIdx, setDraggingIdx] = useState(null);
    const [dropTargetIdx, setDropTargetIdx] = useState(null);

    // ── Load watchlist ────────────────────────────────────────────────────────
    useEffect(() => {
        fetch("/api/watchlist")
            .then(r => r.json())
            .then(data => { setStocks(Array.isArray(data) ? data : []); setLoaded(true); })
            .catch(() => setLoaded(true));
    }, []);

    // ── Load clocks ───────────────────────────────────────────────────────────
    useEffect(() => {
        fetch("/api/clocks")
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // visible clocks = only those with visible: true
                    setVisibleClocks(data.filter(c => c.visible).map(c => c.label));
                    // allClocks = full list for the selector total count
                    setAllClocks(data.map(c => ({
                        ...REFERENCE_CLOCKS.find(r => r.label === c.label),
                        label: c.label,
                        visible: c.visible,
                    })).filter(Boolean));
                }
            })
            .catch(() => { });
    }, []);

    const toggleClock = async (label) => {
        const isVisible = visibleClocks.includes(label);
        setVisibleClocks(prev => isVisible ? prev.filter(l => l !== label) : [...prev, label]);
        await fetch("/api/clocks", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label, visible: !isVisible }),
        });
    };

    // ── Add stock ─────────────────────────────────────────────────────────────
    const addStock = async (overrideSymbol, overrideMarket) => {
        const sym = typeof overrideSymbol === "string" ? overrideSymbol : search;
        const mkt = overrideMarket ?? selectedMarket;
        if (!sym) return;
        const newStock = {
            symbol: overrideSymbol ? sym : sym.toUpperCase(),
            market: mkt, target: 0, stopLoss: 0,
            entryDate: "", notes: "", qty: 1, buyPrice: 0,
            side: "buy", mode: (mkt === "COMMODITY" || mkt === "INDEX") ? "watch" : "trade",
        };
        const res = await fetch("/api/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newStock),
        });
        const saved = await res.json();
        setStocks(prev => [...prev, saved]);
        setSearch("");
        setCommodityOpen(false);
        setIndicesOpen(false);
    };

    //
    //Update field ──────────────────────────────────────────────────────────
    const update = (idx, field, value) => {
        setStocks(prev => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], [field]: ["target", "stopLoss", "qty", "buyPrice"].includes(field) ? Number(value) : value };
            return copy;
        });
        clearTimeout(updateTimers.current[idx]);
        updateTimers.current[idx] = setTimeout(() => {
            setStocks(prev => {
                const stock = prev[idx];
                if (!stock?.id) return prev;
                fetch(`/api/watchlist/${stock.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(stock),
                }).catch(console.error);
                return prev;
            });
        }, 600);
    };

    // ── Remove stock ──────────────────────────────────────────────────────────
    const removeStock = async (idx) => {
        const stock = stocks[idx];
        setStocks(prev => prev.filter((_, i) => i !== idx));
        if (stock?.id) await fetch(`/api/watchlist/${stock.id}`, { method: "DELETE" });
    };

    // ── Drag handlers ─────────────────────────────────────────────────────────
    const handleDragStart = (e, idx) => {
        dragIdx.current = idx;
        setDraggingIdx(idx);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, idx) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragOverIdx.current !== idx) {
            dragOverIdx.current = idx;
            setDropTargetIdx(idx);
        }
    };

    const handleDrop = (e, idx) => {
        e.preventDefault();
        const from = dragIdx.current;
        if (from === null || from === idx) return;
        setStocks(prev => {
            const copy = [...prev];
            const [moved] = copy.splice(from, 1);
            copy.splice(idx, 0, moved);
            return copy;
        });
        dragIdx.current = null;
        dragOverIdx.current = null;
        setDraggingIdx(null);
        setDropTargetIdx(null);
    };

    const handleDragEnd = () => {
        dragIdx.current = null;
        dragOverIdx.current = null;
        setDraggingIdx(null);
        setDropTargetIdx(null);
    };

    if (!loaded) return (
        <div className="flex items-center justify-center h-40 text-sm text-gray-400">
            Loading watchlist...
        </div>
    );

    return (
        <div className="w-full px-3 sm:px-4 md:px-6 py-4 md:py-6">

            {/* Search + market selector — single row, search shrinks dynamically */}
            <div className="mb-4 flex items-center gap-2 flex-nowrap overflow-x-auto pb-1">

                <select
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                    className="flex-shrink-0 rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {Object.entries(MARKETS)
                        .filter(([k]) => k !== "COMMODITY" && k !== "INDEX")
                        .map(([key, m]) => (
                            <option key={key} value={key}>{m.label}</option>
                        ))}
                </select>

                <div className="flex-shrink-0">
                    <MarketBadge clock={clockForMarket(selectedMarket)} />
                </div>

                <div className="flex-shrink-0">
                    <ClockSelector visible={visibleClocks} onToggle={toggleClock} total={allClocks.length} />
                </div>

                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${MARKETS[selectedMarket].label} e.g. ${selectedMarket === "NSE" ? "TCS" : selectedMarket === "TSE" ? "7203" : "AAPL"}`}
                    onKeyDown={(e) => e.key === "Enter" && addStock()}
                    className="flex-1 min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    onClick={() => addStock()}
                    className="flex-shrink-0 whitespace-nowrap rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Add
                </button>

                {/* Commodities dropdown */}
                <div className="relative flex-shrink-0">
                    <button
                        ref={commodityBtnRef}
                        onClick={() => {
                            if (commodityBtnRef.current) {
                                const r = commodityBtnRef.current.getBoundingClientRect();
                                setCommodityPos({ top: r.bottom + 4, left: r.left });
                            }
                            setCommodityOpen(v => !v);
                            setIndicesOpen(false);
                        }}
                        className="whitespace-nowrap rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 flex items-center gap-1"
                    >
                        Commodities <span className="text-[10px]">{commodityOpen ? "▲" : "▼"}</span>
                    </button>
                    {commodityOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setCommodityOpen(false)} />
                            <div
                                className="fixed z-50 w-48 rounded-md border border-gray-200 bg-white shadow-lg py-1"
                                style={{ top: commodityPos.top, left: commodityPos.left }}
                            >
                                {COMMODITY_PRESETS.map((c) => (
                                    <button
                                        key={c.value}
                                        onClick={() => { addStock(c.value, "COMMODITY"); setCommodityOpen(false); }}
                                        className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Indices dropdown */}
                <div className="relative flex-shrink-0">
                    <button
                        ref={indicesBtnRef}
                        onClick={() => {
                            if (indicesBtnRef.current) {
                                const r = indicesBtnRef.current.getBoundingClientRect();
                                setIndicesPos({ top: r.bottom + 4, left: r.left });
                            }
                            setIndicesOpen(v => !v);
                            setCommodityOpen(false);
                        }}
                        className="whitespace-nowrap rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 flex items-center gap-1"
                    >
                        Indices <span className="text-[10px]">{indicesOpen ? "▲" : "▼"}</span>
                    </button>
                    {indicesOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIndicesOpen(false)} />
                            <div
                                className="fixed z-50 w-52 rounded-md border border-gray-200 bg-white shadow-lg py-1 max-h-80 overflow-y-auto"
                                style={{ top: indicesPos.top, left: indicesPos.left }}
                            >
                                {INDEX_GROUPS.map((group) => (
                                    <div key={group.label}>
                                        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                            {group.label}
                                        </p>
                                        {INDEX_PRESETS
                                            .filter(i => group.values.includes(i.value))
                                            .map((idx) => (
                                                <button
                                                    key={idx.value}
                                                    onClick={() => { addStock(idx.value, idx.market); setIndicesOpen(false); }}
                                                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                                >
                                                    {idx.label}
                                                </button>
                                            ))}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Compare button */}
                <button
                    onClick={() => setShowCompare(true)}
                    className="flex-shrink-0 whitespace-nowrap rounded-md border border-purple-300 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 flex items-center gap-1"
                >
                    📊 Compare
                </button>

            </div>

            {/* Compare chart modal */}
            {showCompare && (
                <CompareChart
                    onClose={() => setShowCompare(false)}
                    dark={false}
                />
            )}

            {/* Option Chain modal */}
            {showOptions && (
                <OptionChain onClose={() => setShowOptions(false)} />
            )}

            {/* Reference clocks */}
            {visibleClocks.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {REFERENCE_CLOCKS.filter(clock => visibleClocks.includes(clock.label)).map((clock) => (
                        <MarketBadge key={clock.label} clock={clock} />
                    ))}
                </div>
            )}

            {/* Cards with drag and drop */}
            {layout === "wide" ? (
                <div className="flex flex-wrap gap-4">
                    {stocks.map((s, idx) => (
                        <div
                            key={s.id ?? idx}
                            className={`w-80 transition-all duration-150 ${dropTargetIdx === idx && draggingIdx !== idx ? "ring-2 ring-blue-400 rounded-xl" : ""}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragEnd={handleDragEnd}
                        >
                            <StockCard
                                {...s}
                                isDragging={draggingIdx === idx}
                                onRemove={() => removeStock(idx)}
                                onUpdate={(field, val) => update(idx, field, val)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ columnCount: columns, columnGap: "1rem" }}>
                    {stocks.map((s, idx) => (
                        <div
                            key={s.id ?? idx}
                            className={`mb-4 break-inside-avoid transition-all duration-150 ${dropTargetIdx === idx && draggingIdx !== idx ? "ring-2 ring-blue-400 rounded-xl" : ""}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragEnd={handleDragEnd}
                        >
                            <StockCard
                                {...s}
                                isDragging={draggingIdx === idx}
                                onRemove={() => removeStock(idx)}
                                onUpdate={(field, val) => update(idx, field, val)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
