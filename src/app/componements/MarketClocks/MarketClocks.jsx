import { REFERENCE_CLOCKS, MARKETS } from "../StockCard/StockUtils";

export function getLocalTime(tz) {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: tz }));
}

export function isMarketOpenForClock(clock) {
    if (clock.alwaysOpen) return true;
    const local = getLocalTime(clock.tz);
    const day = local.getDay();
    if (day === 0 || day === 6) return false;
    const total = local.getHours() * 60 + local.getMinutes();
    const openMin = clock.open[0] * 60 + clock.open[1];
    const closeMin = clock.close[0] * 60 + clock.close[1];
    return total >= openMin && total < closeMin;
}

export function secondsUntilOpenForClock(clock) {
    const local = getLocalTime(clock.tz);
    const day = local.getDay();
    const open = new Date(local);
    open.setHours(clock.open[0], clock.open[1], 0, 0);
    if (day === 0) open.setDate(open.getDate() + 1);
    else if (day === 6) open.setDate(open.getDate() + 2);
    else if (local >= open) open.setDate(open.getDate() + (day === 5 ? 3 : 1));
    return Math.max(0, Math.floor((open - local) / 1000));
}

export function secondsUntilCloseForClock(clock) {
    const local = getLocalTime(clock.tz);
    const close = new Date(local);
    close.setHours(clock.close[0], clock.close[1], 0, 0);
    return Math.max(0, Math.floor((close - local) / 1000));
}

export function formatSeconds(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

export function clockForMarket(marketKey) {
    const found = REFERENCE_CLOCKS.find(c => c.label === MARKETS[marketKey]?.label);
    if (found) return found;
    const m = MARKETS[marketKey] || MARKETS.NSE;
    return { label: m.label, tz: m.tz, open: m.open, close: m.close, alwaysOpen: false };
}
