export const BASE_TICKER = "^NSEI";
export const BASE_LABEL = "Nifty 50";

export const INDEX_GROUPS = {
    Sectoral: [
        { label: "Nifty Auto", ticker: "^CNXAUTO" },
        { label: "Nifty IT", ticker: "^CNXIT" },
        { label: "Nifty Bank", ticker: "^NSEBANK" },
        { label: "Nifty Pharma", ticker: "^CNXPHARMA" },
        { label: "Nifty FMCG", ticker: "^CNXFMCG" },
        { label: "Nifty Metal", ticker: "^CNXMETAL" },
        { label: "Nifty Energy", ticker: "^CNXENERGY" },
        { label: "Nifty Realty", ticker: "^CNXREALTY" },
        { label: "Nifty Infra", ticker: "^CNXINFRA" },
        { label: "Nifty PSU Bank", ticker: "^CNXPSUBANK" },
        { label: "Nifty Media", ticker: "^CNXMEDIA" },
        { label: "Nifty Finance", ticker: "^CNXFINANCE" },
    ],

    Thematic: [
        { label: "Nifty MNC", ticker: "^CNXMNC" },
        { label: "Nifty PSE", ticker: "^CNXPSE" },
        { label: "Nifty CPSE", ticker: "^CNXCPSE" },
        { label: "Nifty Services", ticker: "^CNXSERVICE" },
        { label: "Nifty Consumption", ticker: "^CNXCONSUMPTION" },
        { label: "Nifty Mfg", ticker: "^CNXMFG" },
    ],

    "Broad Market": [
        { label: "Sensex", ticker: "^BSESN" },
        { label: "Nifty 100", ticker: "^CNX100" },
        { label: "Nifty 500", ticker: "^CNX500" },
        { label: "Nifty Midcap 50", ticker: "^NSEMDCP50" },
        { label: "Nifty Next 50", ticker: "^NSMIDCP" },
        { label: "Nifty Smallcap", ticker: "^CNXSC" },
        { label: "India VIX", ticker: "^INDIAVIX" },
    ],
};

export const INDEX_RANGES = [
    { label: "1M", value: "1mo" },
    { label: "3M", value: "3mo" },
    { label: "6M", value: "6mo" },
    { label: "1Y", value: "1y" },
    { label: "2Y", value: "2y" },
    { label: "5Y", value: "5y" },
    { label: "10Y", value: "10y" },
];

export const INDEX_LINECOLORS = [
    "#2563eb",
    "#dc2626",
    "#16a34a",
    "#9333ea",
    "#ea580c",
    "#0891b2",
    "#db2777",
    "#65a30d",
];
