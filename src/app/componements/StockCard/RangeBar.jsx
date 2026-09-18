function RangeBar({ price, low52, high52, market, fmtMoney }) {
    if (
        price === null ||
        low52 === null ||
        high52 === null ||
        high52 <= low52
    ) {
        return null;
    }

    const percentage = Math.min(
        100,
        Math.max(
            0,
            ((price - low52) / (high52 - low52)) * 100
        )
    );

    return (
        <div className="mt-1">
            <div className="mb-1 flex items-center justify-between text-[10px] text-gray-400">
                <span>{fmtMoney(low52, market)}</span>
                <span>52W Range</span>
                <span>{fmtMoney(high52, market)}</span>
            </div>

            <div className="relative h-1.5 rounded-full bg-gray-200">
                <div
                    className="h-1.5 rounded-full bg-blue-400"
                    style={{ width: `${percentage}%` }}
                />

                <div
                    className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 shadow"
                    style={{
                        left: `${percentage}%`,
                        transform: "translate(-50%, -50%)",
                    }}
                />
            </div>
        </div>
    );
}

export default RangeBar;
