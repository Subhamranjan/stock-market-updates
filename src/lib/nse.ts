import { chromium } from "playwright";

let browserInstance: any = null;

async function getBrowser() {
    if (!browserInstance || !browserInstance.isConnected()) {
        browserInstance = await chromium.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
            ],
        });
    }
    return browserInstance;
}

export async function fetchNSEOptionChain(symbol: string): Promise<any> {
    const browser = await getBrowser();
    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        viewport: { width: 1280, height: 720 },
        locale: "en-IN",
        timezoneId: "Asia/Kolkata",
    });

    const page = await context.newPage();

    // Remove automation signals
    await page.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    try {
        // Step 1 — visit NSE homepage to get cookies
        await page.goto("https://www.nseindia.com", {
            waitUntil: "domcontentloaded",
            timeout: 15000,
        });
        await page.waitForTimeout(2000);

        // Step 2 — visit option chain page
        await page.goto("https://www.nseindia.com/option-chain", {
            waitUntil: "domcontentloaded",
            timeout: 15000,
        });
        await page.waitForTimeout(2000);

        // Step 3 — fetch API using browser's cookies
        const isIndex = ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY", "NIFTYNXT50"].includes(symbol);
        const apiUrl = isIndex
            ? `https://www.nseindia.com/api/option-chain-indices?symbol=${symbol}`
            : `https://www.nseindia.com/api/option-chain-equities?symbol=${symbol}`;

        const response = await page.evaluate(async (url) => {
            const res = await fetch(url, {
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "include",
            });
            if (!res.ok) return { error: true, status: res.status };
            return await res.json();
        }, apiUrl);

        await context.close();
        return response;

    } catch (err: any) {
        await context.close();
        throw new Error(err.message);
    }
}
