import { useState, useEffect } from "react";
import { isMarketOpenForClock, secondsUntilOpenForClock, secondsUntilCloseForClock, formatSeconds } from "./MarketClocks.jsx";

export default function MarketBadge({ clock }) {
    const [open, setOpen] = useState(isMarketOpenForClock(clock));
    const [countdown, setCountdown] = useState("");

    useEffect(() => {
        const tick = () => {
            const o = isMarketOpenForClock(clock);
            setOpen(o);
            setCountdown(o
                ? formatSeconds(secondsUntilCloseForClock(clock))
                : formatSeconds(secondsUntilOpenForClock(clock))
            );
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [clock]);

    return (
        <div className="flex flex-col items-center min-w-[110px] rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-center">
            <span className={`text-[10px] font-medium ${open ? "text-green-500" : "text-red-400"}`}>
                {open ? `● ${clock.label} open` : `● ${clock.label} closed`}
            </span>
            <span className="text-sm font-mono font-semibold text-blue-600">{countdown}</span>
            <span className="text-[10px] text-gray-400">{open ? "closes in" : "opens in"}</span>
        </div>
    );
}

