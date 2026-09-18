export const REFRESH_INTERVAL = 300000;

export const MARKETS = {
    NSE: { suffix: ".NS", currency: "INR", symbol: "₹", label: "NSE", tz: "Asia/Kolkata", open: [9, 15], close: [15, 30] },
    BSE: { suffix: ".BO", currency: "INR", symbol: "₹", label: "BSE", tz: "Asia/Kolkata", open: [9, 15], close: [15, 30] },
    NASDAQ: { suffix: "", currency: "USD", symbol: "$", label: "NASDAQ", tz: "America/New_York", open: [9, 30], close: [16, 0] },
    NYSE: { suffix: "", currency: "USD", symbol: "$", label: "NYSE", tz: "America/New_York", open: [9, 30], close: [16, 0] },
    TSE: { suffix: ".T", currency: "JPY", symbol: "¥", label: "Tokyo", tz: "Asia/Tokyo", open: [9, 0], close: [15, 0] },
    LSE: { suffix: ".L", currency: "GBP", symbol: "£", label: "LSE", tz: "Europe/London", open: [8, 0], close: [16, 30] },
    HKEX: { suffix: ".HK", currency: "HKD", symbol: "HK$", label: "HKEX", tz: "Asia/Hong_Kong", open: [9, 30], close: [16, 0] },
    SSE: { suffix: ".SS", currency: "CNY", symbol: "¥", label: "Shanghai", tz: "Asia/Shanghai", open: [9, 30], close: [15, 0] },
    SGX: { suffix: ".SI", currency: "SGD", symbol: "S$", label: "SGX", tz: "Asia/Singapore", open: [9, 0], close: [17, 0] },
    ASX: { suffix: ".AX", currency: "AUD", symbol: "A$", label: "ASX", tz: "Australia/Sydney", open: [10, 0], close: [16, 0] },
    KRX: { suffix: ".KS", currency: "KRW", symbol: "₩", label: "KRX", tz: "Asia/Seoul", open: [9, 0], close: [15, 30] },
    TWSE: { suffix: ".TW", currency: "TWD", symbol: "NT$", label: "TWSE", tz: "Asia/Taipei", open: [9, 0], close: [13, 30] },
    JSE: { suffix: ".JO", currency: "ZAR", symbol: "R", label: "JSE", tz: "Africa/Johannesburg", open: [9, 0], close: [17, 0] },
    TADAWUL: { suffix: ".SR", currency: "SAR", symbol: "﷼", label: "Tadawul", tz: "Asia/Riyadh", open: [10, 0], close: [15, 0] },
    B3: { suffix: ".SA", currency: "BRL", symbol: "R$", label: "B3", tz: "America/Sao_Paulo", open: [10, 0], close: [18, 0] },
    TSX: { suffix: ".TO", currency: "CAD", symbol: "C$", label: "TSX", tz: "America/Toronto", open: [9, 30], close: [16, 0] },
    COMMODITY: { suffix: "", currency: "USD", symbol: "$", label: "Commodity", tz: "America/New_York", open: [18, 0], close: [17, 0] },
    INDEX: { suffix: "", currency: "", symbol: "", label: "Index", tz: "Asia/Kolkata", open: [9, 0], close: [16, 0] },
};

export const COMMODITY_PRESETS = [
    { label: "Gold", value: "GC=F" },
    { label: "Silver", value: "SI=F" },
    { label: "Crude Oil", value: "CL=F" },
    { label: "Brent Crude", value: "BZ=F" },
    { label: "Natural Gas", value: "NG=F" },
    { label: "Copper", value: "HG=F" },
    { label: "Platinum", value: "PL=F" },
    { label: "Corn", value: "ZC=F" },
    { label: "Wheat", value: "ZW=F" },
    { label: "Soybean", value: "ZS=F" },
    { label: "Cotton", value: "CT=F" },
    { label: "Coffee", value: "KC=F" },
];

export const INDEX_PRESETS = [
    { label: "Nifty 50", value: "^NSEI", market: "INDEX" },
    { label: "Sensex", value: "^BSESN", market: "INDEX" },
    { label: "Nifty Bank", value: "^NSEBANK", market: "INDEX" },
    { label: "Nifty IT", value: "^CNXIT", market: "INDEX" },
    { label: "Nifty Midcap 50", value: "^NSEMDCP50", market: "INDEX" },
    { label: "Nifty Next 50", value: "^NSMIDCP", market: "INDEX" },
    { label: "Nifty Auto", value: "^CNXAUTO", market: "INDEX" },
    { label: "Nifty Pharma", value: "^CNXPHARMA", market: "INDEX" },
    { label: "Nifty FMCG", value: "^CNXFMCG", market: "INDEX" },
    { label: "Nifty Metal", value: "^CNXMETAL", market: "INDEX" },
    { label: "Nifty Energy", value: "^CNXENERGY", market: "INDEX" },
    { label: "Nifty Realty", value: "^CNXREALTY", market: "INDEX" },
    { label: "Nifty Infra", value: "^CNXINFRA", market: "INDEX" },
    { label: "Nifty PSU Bank", value: "^CNXPSUBANK", market: "INDEX" },
    { label: "India VIX", value: "^INDIAVIX", market: "INDEX" },
    { label: "S&P 500", value: "^GSPC", market: "INDEX" },
    { label: "Nasdaq 100", value: "^NDX", market: "INDEX" },
    { label: "Dow Jones", value: "^DJI", market: "INDEX" },
    { label: "Russell 2000", value: "^RUT", market: "INDEX" },
    { label: "S&P 400 Mid", value: "^MID", market: "INDEX" },
    { label: "NYSE Composite", value: "^NYA", market: "INDEX" },
    { label: "VIX", value: "^VIX", market: "INDEX" },
    { label: "FTSE 100", value: "^FTSE", market: "INDEX" },
    { label: "DAX", value: "^GDAXI", market: "INDEX" },
    { label: "CAC 40", value: "^FCHI", market: "INDEX" },
    { label: "Euro Stoxx 50", value: "^STOXX50E", market: "INDEX" },
    { label: "IBEX 35", value: "^IBEX", market: "INDEX" },
    { label: "AEX (Amsterdam)", value: "^AEX", market: "INDEX" },
    { label: "SMI (Swiss)", value: "^SSMI", market: "INDEX" },
    { label: "OMX (Stockholm)", value: "^OMX", market: "INDEX" },
    { label: "ATX (Austria)", value: "^ATX", market: "INDEX" },
    { label: "BEL 20", value: "^BFX", market: "INDEX" },
    { label: "FTSE MIB Italy", value: "FTSEMIB.MI", market: "INDEX" },
    { label: "Nikkei 225", value: "^N225", market: "INDEX" },
    { label: "Topix", value: "^TOPX", market: "INDEX" },
    { label: "Hang Seng", value: "^HSI", market: "INDEX" },
    { label: "Shanghai", value: "000001.SS", market: "INDEX" },
    { label: "Shenzhen", value: "399001.SZ", market: "INDEX" },
    { label: "CSI 300", value: "000300.SS", market: "INDEX" },
    { label: "Kospi", value: "^KS11", market: "INDEX" },
    { label: "Kosdaq", value: "^KQ11", market: "INDEX" },
    { label: "Taiwan TWSE", value: "^TWII", market: "INDEX" },
    { label: "ASX 200", value: "^AXJO", market: "INDEX" },
    { label: "Straits Times", value: "^STI", market: "INDEX" },
    { label: "Jakarta (IDX)", value: "^JKSE", market: "INDEX" },
    { label: "SET (Thailand)", value: "^SET.BK", market: "INDEX" },
    { label: "KLCI (Malaysia)", value: "^KLSE", market: "INDEX" },
    { label: "PSEi (Philippines)", value: "PSEi.PS", market: "INDEX" },
    { label: "Tadawul (Saudi)", value: "^TASI.SR", market: "INDEX" },
    { label: "DFM (Dubai)", value: "^DFMGI", market: "INDEX" },
    { label: "ADX (Abu Dhabi)", value: "^FTFADGI", market: "INDEX" },
    { label: "EGX 30 (Egypt)", value: "^CASE30", market: "INDEX" },
    { label: "JSE (S.Africa)", value: "^J203.JO", market: "INDEX" },
    { label: "NSE 20 (Kenya)", value: "^NSE20", market: "INDEX" },
    { label: "TSX (Canada)", value: "^GSPTSE", market: "INDEX" },
    { label: "Bovespa (Brazil)", value: "^BVSP", market: "INDEX" },
    { label: "IPC (Mexico)", value: "^MXX", market: "INDEX" },
    { label: "Merval (Argentina)", value: "^MERV", market: "INDEX" },
    { label: "IPSA (Chile)", value: "^IPSA", market: "INDEX" },
];

export const INDEX_GROUPS = [
    {
        label: "India",
        values: ["^NSEI", "^BSESN", "^NSEBANK", "^CNXIT", "^NSEMDCP50",
            "^NSMIDCP", "^CNXAUTO", "^CNXPHARMA", "^CNXFMCG",
            "^CNXMETAL", "^CNXENERGY", "^CNXREALTY", "^CNXINFRA",
            "^CNXPSUBANK", "^INDIAVIX"],
    },
    {
        label: "USA",
        values: ["^GSPC", "^NDX", "^DJI", "^RUT", "^MID", "^NYA", "^VIX"],
    },
    {
        label: "Europe",
        values: ["^FTSE", "^GDAXI", "^FCHI", "^STOXX50E", "^IBEX",
            "^AEX", "^SSMI", "^OMX", "^ATX", "^BFX", "FTSEMIB.MI"],
    },
    {
        label: "Asia",
        values: ["^N225", "^TOPX", "^HSI", "000001.SS", "399001.SZ",
            "000300.SS", "^KS11", "^KQ11", "^TWII", "^AXJO",
            "^STI", "^JKSE", "^SET.BK", "^KLSE", "PSEi.PS"],
    },
    {
        label: "Middle East & Africa",
        values: ["^TASI.SR", "^DFMGI", "^FTFADGI", "^CASE30", "^J203.JO", "^NSE20"],
    },
    {
        label: "Americas",
        values: ["^GSPTSE", "^BVSP", "^MXX", "^MERV", "^IPSA"],
    },
];

export const REFERENCE_CLOCKS = [
    { label: "NSE", tz: "Asia/Kolkata", open: [9, 15], close: [15, 30], alwaysOpen: false },
    { label: "BSE", tz: "Asia/Kolkata", open: [9, 15], close: [15, 30], alwaysOpen: false },
    { label: "NASDAQ", tz: "America/New_York", open: [9, 30], close: [16, 0], alwaysOpen: false },
    { label: "NYSE", tz: "America/New_York", open: [9, 30], close: [16, 0], alwaysOpen: false },
    { label: "Tokyo", tz: "Asia/Tokyo", open: [9, 0], close: [15, 0], alwaysOpen: false },
    { label: "London", tz: "Europe/London", open: [8, 0], close: [16, 30], alwaysOpen: false },
    { label: "SGX", tz: "Asia/Singapore", open: [9, 0], close: [17, 0], alwaysOpen: false },
    { label: "ASX", tz: "Australia/Sydney", open: [10, 0], close: [16, 0], alwaysOpen: false },
    { label: "KRX", tz: "Asia/Seoul", open: [9, 0], close: [15, 30], alwaysOpen: false },
    { label: "JSE", tz: "Africa/Johannesburg", open: [9, 0], close: [17, 0], alwaysOpen: false },
    { label: "Tadawul", tz: "Asia/Riyadh", open: [10, 0], close: [15, 0], alwaysOpen: false },
    { label: "B3", tz: "America/Sao_Paulo", open: [10, 0], close: [18, 0], alwaysOpen: false },
    { label: "TSX", tz: "America/Toronto", open: [9, 30], close: [16, 0], alwaysOpen: false },
    { label: "FX", tz: "Asia/Kolkata", open: [0, 0], close: [23, 59], alwaysOpen: true },
    { label: "Commodities", tz: "America/New_York", open: [18, 0], close: [17, 0], alwaysOpen: true },
];

/* -------------------------------------------------- */
/* Days since entry date                              */
/* -------------------------------------------------- */

export function daysSince(date) {
    if (!date) {
        return null;
    }

    const start = new Date(date);

    if (Number.isNaN(start.getTime())) {
        return null;
    }

    const today = new Date();

    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diff =
        today.getTime() - start.getTime();

    return Math.max(
        0,
        Math.floor(
            diff / (1000 * 60 * 60 * 24)
        )
    );
}

/* -------------------------------------------------- */
/* Risk / Reward                                      */
/* -------------------------------------------------- */

export function calcRR(
    buyPrice,
    target,
    stopLoss,
    side
) {
    const entry = Number(buyPrice);
    const targetPrice = Number(target);
    const stop = Number(stopLoss);

    if (
        !Number.isFinite(entry) ||
        !Number.isFinite(targetPrice) ||
        !Number.isFinite(stop) ||
        entry <= 0
    ) {
        return null;
    }

    let reward;
    let risk;

    if (side === "sell") {
        reward = entry - targetPrice;
        risk = stop - entry;
    } else {
        reward = targetPrice - entry;
        risk = entry - stop;
    }

    if (
        !Number.isFinite(reward) ||
        !Number.isFinite(risk) ||
        risk <= 0 ||
        reward <= 0
    ) {
        return null;
    }

    return Number(
        (reward / risk).toFixed(2)
    );
}

/* -------------------------------------------------- */
/* Money formatting                                   */
/* -------------------------------------------------- */

export function fmtMoney(
    value,
    market = "NSE"
) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "-";
    }

    const currency =
        market === "NASDAQ" ||
            market === "NYSE"
            ? "USD"
            : "INR";

    return new Intl.NumberFormat(
        currency === "INR"
            ? "en-IN"
            : "en-US",
        {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }
    ).format(number);
}
