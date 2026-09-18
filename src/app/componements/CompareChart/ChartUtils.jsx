export function normalizeSeries(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return [];
    }

    return data.map((row) => ({
        date: row.date,
        ticker: row.ticker,

        open:
            row.open !== null &&
                row.open !== undefined
                ? Number(row.open)
                : null,

        high:
            row.high !== null &&
                row.high !== undefined
                ? Number(row.high)
                : null,

        low:
            row.low !== null &&
                row.low !== undefined
                ? Number(row.low)
                : null,

        close:
            row.close !== null &&
                row.close !== undefined
                ? Number(row.close)
                : null,

        sharesTraded:
            row.sharesTraded !== null &&
                row.sharesTraded !== undefined
                ? Number(row.sharesTraded)
                : null,

        turnover:
            row.turnover !== null &&
                row.turnover !== undefined
                ? Number(row.turnover)
                : null,

        value:
            row.close !== null &&
                row.close !== undefined
                ? Number(row.close)
                : null,
    }));
}

export function formatNumber(value) {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "—";
    }

    return Number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    });
}

export function formatDate(date) {
    if (!date) {
        return "";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
    });
}

export function formatFullDate(date) {
    if (!date) {
        return "";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}
