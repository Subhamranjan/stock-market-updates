
// ---- Option Chain ------------------------------------------------------------

function OptionChain({ onClose }) {
    const [symbol, setSymbol] = useState("NIFTY");
    const [expiry, setExpiry] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [spotPrice, setSpotPrice] = useState(null);
    const [filter, setFilter] = useState(10); // show ±10 strikes from ATM
    //  const [expiryTimestamps, setExpiryTimestamps] = useState([]);
    const [source, setSource] = useState("auto"); // "auto" | "nse" | "yahoo"
    const [expiryDatesRaw, setExpiryDatesRaw] = useState([]);  // ← add here

    const fetchData = async (sym, selectedExpiry = "") => {
        setLoading(true);
        setError(null);
        try {
            // selectedExpiry is "28 Aug 2026" format
            // find matching raw date "2026-08-28"
            const rawDate = expiryDatesRaw.find((raw) => {
                const fmt = new Date(raw).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric"
                });
                return fmt === selectedExpiry;
            }) ?? "";

            const url = `/api/options?symbol=${sym}${rawDate ? `&date=${rawDate}` : ""}`;
            const res = await fetch(url);
            const json = await res.json();

            if (json.error) {
                setError(json.message ?? "Failed to fetch");
                setLoading(false);
                return;
            }

            const records = json?.records;
            setSpotPrice(records?.underlyingValue ?? null);
            setExpiryDatesRaw(records?.expiryDatesRaw ?? []);

            const expiries = records?.expiryDates ?? [];
            setExpiry(selectedExpiry || expiries[0] || "");
            setData(json);
        } catch (e) {
            setError("Network error: " + e.message);
        }
        setLoading(false);
    };

    // Initial load
    useEffect(() => { fetchData(symbol); }, [symbol]);

    // Filter data for selected expiry
    const rows = useMemo(() => {
        if (!data || !expiry) return [];
        const records = data?.records?.data ?? [];
        return records.filter(r => r.expiryDate === expiry);
    }, [data, expiry]);

    // Find ATM strike
    const atm = useMemo(() => {
        if (!spotPrice || !rows.length) return null;
        return rows.reduce((prev, curr) =>
            Math.abs(curr.strikePrice - spotPrice) < Math.abs(prev.strikePrice - spotPrice) ? curr : prev
        ).strikePrice;
    }, [rows, spotPrice]);

    // Filter rows around ATM
    const filteredRows = useMemo(() => {
        if (!atm) return rows;
        const strikes = [...new Set(rows.map(r => r.strikePrice))].sort((a, b) => a - b);
        const atmIdx = strikes.indexOf(atm);
        const visible = strikes.slice(Math.max(0, atmIdx - filter), atmIdx + filter + 1);
        return rows.filter(r => visible.includes(r.strikePrice));
    }, [rows, atm, filter]);

    const expiries = data?.records?.expiryDates ?? [];

    // Max OI for bar scaling
    const maxCEOI = Math.max(...filteredRows.map(r => r.CE?.openInterest ?? 0), 1);
    const maxPEOI = Math.max(...filteredRows.map(r => r.PE?.openInterest ?? 0), 1);

    const fmt = (n) => n == null ? "-" : n >= 1e7 ? (n / 1e7).toFixed(2) + "Cr" : n >= 1e5 ? (n / 1e5).toFixed(1) + "L" : n.toLocaleString("en-IN");
    const fmtChg = (n) => n == null ? "-" : (n >= 0 ? "+" : "") + n.toFixed(2);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="rounded-2xl shadow-2xl flex flex-col bg-white border border-gray-200 w-[98vw] h-[94vh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-gray-900">📋 Option Chain</span>

                        {/* Symbol selector */}
                        <div className="flex rounded-md overflow-hidden border border-gray-300 text-xs font-medium">
                            {OPTION_SYMBOLS.map(s => (
                                <button key={s} onClick={() => setSymbol(s)}
                                    className={`px-2.5 py-1.5 transition-colors ${symbol === s ? "bg-blue-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Source toggle */}
                        <div className="flex rounded-md overflow-hidden border border-gray-300 text-xs font-medium">
                            {["auto", "yahoo", "nse"].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSource(s)}
                                    className={`px-2.5 py-1.5 uppercase transition-colors ${source === s
                                        ? "bg-gray-800 text-white"
                                        : "bg-white text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {s === "nse" ? "🇮🇳 NSE" : s === "yahoo" ? "📈 Yahoo" : "⚡ Auto"}
                                </button>
                            ))}
                        </div>

                        {/* Expiry selector */}
                        {expiries.length > 0 && (
                            <select
                                value={expiry}
                                onChange={e => fetchData(symbol, e.target.value)}
                                className="rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {expiries.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        )}

                        {/* Strike filter */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span>±</span>
                            <select value={filter} onChange={e => setFilter(Number(e.target.value))}
                                className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none">
                                {[5, 10, 15, 20, 30].map(n => <option key={n} value={n}>{n} strikes</option>)}
                            </select>
                        </div>

                        {/* Spot price */}
                        {spotPrice && (
                            <span className="text-sm font-bold text-gray-700">
                                Spot: <span className="text-blue-600">₹{spotPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </span>
                        )}

                        <button
                            onClick={() => fetchData(symbol, expiry)}
                            className="px-3 py-1.5 rounded-md border border-gray-300 text-xs text-gray-600 hover:bg-gray-50"
                        >
                            🔄 Refresh
                        </button>
                    </div>

                    <button onClick={onClose}
                        className="w-7 h-7 rounded-md border border-gray-300 text-gray-400 hover:text-red-500 flex items-center justify-center text-lg flex-shrink-0">
                        ×
                    </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    {loading && (
                        <div className="flex items-center justify-center h-full text-sm text-gray-400">
                            Loading option chain...
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center justify-center h-full text-sm text-red-500">
                            {error}
                        </div>
                    )}
                    {!loading && !error && filteredRows.length > 0 && (
                        <table className="w-full text-xs border-collapse">
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    <th colSpan={7} className="bg-green-100 text-green-800 px-2 py-2 text-center font-bold border-b border-green-200">CALLS</th>
                                    <th className="bg-gray-800 text-white px-3 py-2 text-center font-bold border-b border-gray-700 min-w-[80px]">STRIKE</th>
                                    <th colSpan={7} className="bg-red-100 text-red-800 px-2 py-2 text-center font-bold border-b border-red-200">PUTS</th>
                                </tr>
                                <tr>
                                    <th className="bg-green-50 text-green-700 px-2 py-1.5 text-right text-xs font-semibold border-b border-green-100">OI</th>
                                    <th className="bg-green-50 text-green-700 px-2 py-1.5 text-right text-xs font-semibold border-b border-green-100">Chg OI</th>
                                    <th className="bg-green-50 text-green-700 px-2 py-1.5 text-right text-xs font-semibold border-b border-green-100">Vol</th>
                                    <th className="bg-green-50 text-green-700 px-2 py-1.5 text-right text-xs font-semibold border-b border-green-100">IV</th>
                                    <th className="bg-green-50 text-green-700 px-2 py-1.5 text-right text-xs font-semibold border-b border-green-100">LTP</th>
                                    <th className="bg-green-50 text-green-700 px-2 py-1.5 text-right text-xs font-semibold border-b border-green-100">Chg</th>
                                    <th className="bg-green-50 text-green-700 px-2 py-1.5 text-right text-xs font-semibold border-b border-green-100">Bid</th>
                                    <th className="bg-gray-800 text-white px-3 py-1.5 text-center text-xs font-bold border-b border-gray-700"></th>
                                    <th className="bg-red-50 text-red-700 px-2 py-1.5 text-left text-xs font-semibold border-b border-red-100">Ask</th>
                                    <th className="bg-red-50 text-red-700 px-2 py-1.5 text-left text-xs font-semibold border-b border-red-100">Chg</th>
                                    <th className="bg-red-50 text-red-700 px-2 py-1.5 text-left text-xs font-semibold border-b border-red-100">LTP</th>
                                    <th className="bg-red-50 text-red-700 px-2 py-1.5 text-left text-xs font-semibold border-b border-red-100">IV</th>
                                    <th className="bg-red-50 text-red-700 px-2 py-1.5 text-left text-xs font-semibold border-b border-red-100">Vol</th>
                                    <th className="bg-red-50 text-red-700 px-2 py-1.5 text-left text-xs font-semibold border-b border-red-100">Chg OI</th>
                                    <th className="bg-red-50 text-red-700 px-2 py-1.5 text-left text-xs font-semibold border-b border-red-100">OI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map((row) => {
                                    const ce = row.CE;
                                    const pe = row.PE;
                                    const strike = row.strikePrice;
                                    const isATM = strike === atm;
                                    const isITM_CE = spotPrice && strike < spotPrice;
                                    const isITM_PE = spotPrice && strike > spotPrice;

                                    const ceOIPct = ce ? (ce.openInterest / maxCEOI) * 100 : 0;
                                    const peOIPct = pe ? (pe.openInterest / maxPEOI) * 100 : 0;

                                    return (
                                        <tr key={strike}
                                            className={`border-b transition-colors ${isATM
                                                ? "bg-yellow-50 border-yellow-200"
                                                : "border-gray-100 hover:bg-gray-50"
                                                }`}>
                                            {/* CE side */}
                                            <td className={`px-2 py-1.5 text-right relative ${isITM_CE ? "bg-green-50" : ""}`}>
                                                <div className="absolute inset-y-0 right-0 bg-green-200 opacity-30 rounded-l"
                                                    style={{ width: `${ceOIPct}%` }} />
                                                <span className="relative font-medium text-gray-700">{fmt(ce?.openInterest)}</span>
                                            </td>
                                            <td className={`px-2 py-1.5 text-right ${isITM_CE ? "bg-green-50" : ""}`}>
                                                <span className={ce?.changeinOpenInterest > 0 ? "text-green-600" : ce?.changeinOpenInterest < 0 ? "text-red-500" : "text-gray-500"}>
                                                    {fmt(ce?.changeinOpenInterest)}
                                                </span>
                                            </td>
                                            <td className={`px-2 py-1.5 text-right text-gray-600 ${isITM_CE ? "bg-green-50" : ""}`}>{fmt(ce?.totalTradedVolume)}</td>
                                            <td className={`px-2 py-1.5 text-right text-gray-600 ${isITM_CE ? "bg-green-50" : ""}`}>{ce?.impliedVolatility?.toFixed(1) ?? "-"}</td>
                                            <td className={`px-2 py-1.5 text-right font-semibold ${isITM_CE ? "bg-green-50" : ""}`}>{ce?.lastPrice?.toFixed(2) ?? "-"}</td>
                                            <td className={`px-2 py-1.5 text-right ${isITM_CE ? "bg-green-50" : ""}`}>
                                                <span className={ce?.change > 0 ? "text-green-600" : ce?.change < 0 ? "text-red-500" : "text-gray-500"}>
                                                    {fmtChg(ce?.change)}
                                                </span>
                                            </td>
                                            <td className={`px-2 py-1.5 text-right text-gray-500 ${isITM_CE ? "bg-green-50" : ""}`}>{ce?.bidprice?.toFixed(2) ?? "-"}</td>
                                            {/* Strike */}
                                            <td className={`px-3 py-1.5 text-center font-bold text-sm ${isATM
                                                ? "bg-yellow-400 text-yellow-900"
                                                : "bg-gray-800 text-white"
                                                }`}>{strike.toLocaleString("en-IN")}</td>
                                            {/* PE side */}
                                           // <td className={`px-2 py-1.5 text-left text-gray-500 ${isITM_PE ? "bg-red-50" : ""}`}>{pe?.bidprice?.toFixed(2) ?? "-"}</td>
                                           // <td className={`px-2 py-1.5 text-left ${isITM_PE ? "bg-red-50" : ""}`}>
                                                <span className={pe?.change > 0 ? "text-green-600" : pe?.change < 0 ? "text-red-500" : "text-gray-500"}>
                                                    {fmtChg(pe?.change)}
                                                </span>
                                            </td>
                                            <td className={`px-2 py-1.5 text-left font-semibold ${isITM_PE ? "bg-red-50" : ""}`}>{pe?.lastPrice?.toFixed(2) ?? "-"}</td>
                                            <td className={`px-2 py-1.5 text-left text-gray-600 ${isITM_PE ? "bg-red-50" : ""}`}>{pe?.impliedVolatility?.toFixed(1) ?? "-"}</td>
                                            <td className={`px-2 py-1.5 text-left text-gray-600 ${isITM_PE ? "bg-red-50" : ""}`}>{fmt(pe?.totalTradedVolume)}</td>
                                            <td className={`px-2 py-1.5 text-left ${isITM_PE ? "bg-red-50" : ""}`}>
                                                <span className={pe?.changeinOpenInterest > 0 ? "text-green-600" : pe?.changeinOpenInterest < 0 ? "text-red-500" : "text-gray-500"}>
                                                    {fmt(pe?.changeinOpenInterest)}
                                                </span>
                                            </td>
                                            <td className={`px-2 py-1.5 text-left relative ${isITM_PE ? "bg-red-50" : ""}`}>
                                                <div className="absolute inset-y-0 left-0 bg-red-200 opacity-30 rounded-r"
                                                    style={{ width: `${peOIPct}%` }} />
                                                <span className="relative font-medium text-gray-700">{fmt(pe?.openInterest)}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                            {error && (
                                <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <p className="text-sm text-red-500">{error}</p>
                                    <p className="text-xs text-gray-400 max-w-md text-center">
                                        NSE blocks automated requests. This works best during market hours (9:15 AM – 3:30 PM IST, Mon–Fri).
                                        Try refreshing or wait a few seconds.
                                    </p>
                                    <button onClick={() => fetchData(symbol, expiry)}
                                        className="px-4 py-2 rounded-md bg-blue-500 text-white text-sm hover:bg-blue-600">
                                        🔄 Try Again
                                    </button>
                                </div>
                            )}

                            {/* Footer — PCR and total OI */}
                            {(() => {
                                const totalCEOI = filteredRows.reduce((s, r) => s + (r.CE?.openInterest ?? 0), 0);
                                const totalPEOI = filteredRows.reduce((s, r) => s + (r.PE?.openInterest ?? 0), 0);
                                const pcr = totalCEOI > 0 ? (totalPEOI / totalCEOI).toFixed(2) : "-";
                                return (
                                    <tfoot>
                                        <tr className="bg-gray-100 font-semibold text-xs border-t border-gray-300">
                                            <td colSpan={2} className="px-3 py-2 text-right text-green-700">
                                                Total CE OI: {fmt(totalCEOI)}
                                            </td>
                                            <td colSpan={5} />
                                            <td className="px-3 py-2 text-center text-gray-700">
                                                PCR: <span className={Number(pcr) >= 1 ? "text-green-600" : "text-red-500"}>{pcr}</span>
                                            </td>
                                            <td className="px-3 py-2 text-center bg-gray-800 text-white text-xs">
                                                PCR {pcr}
                                            </td>
                                            <td />
                                            <td colSpan={5} />
                                            <td colSpan={2} className="px-3 py-2 text-left text-red-700">
                                                Total PE OI: {fmt(totalPEOI)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                );
                            })()}
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
