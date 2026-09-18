import { useState, useRef } from "react";
import { REFERENCE_CLOCKS } from "../StockCard/StockUtils.jsx"

export default function ClockSelector({ visible, onToggle, total }) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const [pos, setPos] = useState({ top: 0, left: 0 });

    const handleOpen = () => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setPos({ top: rect.bottom + 4, left: rect.left });
        }
        setOpen(v => !v);
    };

    return (
        <div className="relative flex-shrink-0">
            <button
                ref={btnRef}
                onClick={handleOpen}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 whitespace-nowrap"
            >
                Clocks
                <span className="text-[10px] text-gray-400">
                    ({visible.length}/{total ?? REFERENCE_CLOCKS.length})
                </span>
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div
                        className="fixed z-50 w-44 rounded-md border border-gray-200 bg-white shadow-lg py-1 max-h-72 overflow-y-auto"
                        style={{ top: pos.top, left: pos.left }}
                    >
                        {REFERENCE_CLOCKS.map((clock) => (
                            <label
                                key={clock.label}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={visible.includes(clock.label)}
                                    onChange={() => onToggle(clock.label)}
                                    className="accent-blue-500"
                                />
                                {clock.label}
                            </label>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
};

