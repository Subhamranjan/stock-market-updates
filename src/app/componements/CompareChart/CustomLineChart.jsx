import { useEffect, useRef, useState } from "react";
import ChartTooltip from "./ChartTooltip";
import { formatNumber, formatDate } from "./ChartUtils";

function CustomLineChart({
    data,
    series,
    getSeriesData,
}) {
    const containerRef = useRef(null);

    const [dimensions, setDimensions] = useState({
        width: 900,
        height: 500,
    });

    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const observer = new ResizeObserver(
            (entries) => {
                const rect =
                    entries[0].contentRect;

                setDimensions({
                    width: rect.width,
                    height: rect.height,
                });
            }
        );

        observer.observe(containerRef.current);

        return () =>
            observer.disconnect();
    }, []);

    const width = dimensions.width;
    const height = dimensions.height;

    const margin = {
        top: 20,
        right: 25,
        bottom: 45,
        left: 75,
    };

    const chartWidth =
        width -
        margin.left -
        margin.right;

    const chartHeight =
        height -
        margin.top -
        margin.bottom;

    const values = [];

    data.forEach((row) => {
        series.forEach((item) => {
            const value = row[item.ticker];

            if (
                value !== null &&
                value !== undefined &&
                Number.isFinite(Number(value))
            ) {
                values.push(Number(value));
            }
        });
    });

    let minValue =
        values.length > 0
            ? Math.min(...values)
            : 0;

    let maxValue =
        values.length > 0
            ? Math.max(...values)
            : 1;

    const range =
        maxValue - minValue;

    const padding =
        range > 0
            ? range * 0.08
            : Math.max(
                Math.abs(maxValue) * 0.05,
                1
            );

    minValue -= padding;
    maxValue += padding;

    function getX(index) {
        if (data.length <= 1) {
            return (
                margin.left +
                chartWidth / 2
            );
        }

        return (
            margin.left +
            (index /
                (data.length - 1)) *
            chartWidth
        );
    }

    function getY(value) {
        return (
            margin.top +
            ((maxValue - value) /
                (maxValue - minValue)) *
            chartHeight
        );
    }

    function buildPath(ticker) {
        const points = [];

        data.forEach((row, index) => {
            const value = row[ticker];

            if (
                value === null ||
                value === undefined ||
                !Number.isFinite(Number(value))
            ) {
                return;
            }

            points.push({
                x: getX(index),
                y: getY(Number(value)),
            });
        });

        if (points.length === 0) {
            return "";
        }

        return points
            .map(
                (point, index) =>
                    `${index === 0
                        ? "M"
                        : "L"
                    } ${point.x} ${point.y}`
            )
            .join(" ");
    }

    const tickCount = 6;

    const yTicks = Array.from(
        {
            length: tickCount,
        },
        (_, index) =>
            minValue +
            ((maxValue - minValue) /
                (tickCount - 1)) *
            index
    );

    const xTickCount = Math.min(
        7,
        data.length
    );

    const xTicks = Array.from(
        {
            length: xTickCount,
        },
        (_, index) => {
            if (xTickCount === 1) {
                return 0;
            }

            return Math.round(
                (index /
                    (xTickCount - 1)) *
                (data.length - 1)
            );
        }
    );

    function handleMouseMove(event) {
        const rect =
            event.currentTarget.getBoundingClientRect();

        const mouseX =
            event.clientX - rect.left;

        const relativeX =
            mouseX - margin.left;

        const ratio =
            relativeX / chartWidth;

        let index = Math.round(
            ratio *
            (data.length - 1)
        );

        index = Math.max(
            0,
            Math.min(
                data.length - 1,
                index
            )
        );

        setHovered(index);
    }

    function handleMouseLeave() {
        setHovered(null);
    }

    const hoveredRow =
        hovered !== null
            ? data[hovered]
            : null;

    return (
        <div
            ref={containerRef}
            className="relative h-full w-full"
        >
            <svg
                width="100%"
                height="100%"
                onMouseMove={
                    handleMouseMove
                }
                onMouseLeave={
                    handleMouseLeave
                }
                className="select-none"
            >
                {/* Y Grid */}
                {yTicks.map(
                    (tick, index) => {
                        const y = getY(tick);

                        return (
                            <g
                                key={`y-${index}`}
                            >
                                <line
                                    x1={
                                        margin.left
                                    }
                                    y1={y}
                                    x2={
                                        width -
                                        margin.right
                                    }
                                    y2={y}
                                    stroke="currentColor"
                                    className="text-zinc-200"
                                    strokeDasharray="4 4"
                                />

                                <text
                                    x={
                                        margin.left -
                                        10
                                    }
                                    y={
                                        y + 4
                                    }
                                    textAnchor="end"
                                    className="fill-zinc-500 text-[11px]"
                                >
                                    {formatNumber(
                                        tick
                                    )}
                                </text>
                            </g>
                        );
                    }
                )}

                {/* X Labels */}
                {xTicks.map((index) => {
                    const x = getX(index);
                    const date =
                        data[index]?.date;

                    return (
                        <text
                            key={`x-${index}`}
                            x={x}
                            y={
                                height -
                                15
                            }
                            textAnchor="middle"
                            className="fill-zinc-500 text-[11px]"
                        >
                            {formatDate(date)}
                        </text>
                    );
                })}

                {/* Lines */}
                {series.map((item) => (
                    <path
                        key={item.ticker}
                        d={buildPath(
                            item.ticker
                        )}
                        fill="none"
                        stroke={item.color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                ))}

                {/* Hover */}
                {hovered !== null && (
                    <>
                        <line
                            x1={getX(hovered)}
                            y1={margin.top}
                            x2={getX(hovered)}
                            y2={
                                height -
                                margin.bottom
                            }
                            stroke="currentColor"
                            className="text-zinc-400"
                            strokeDasharray="4 4"
                        />

                        {series.map((item) => {
                            const value =
                                data[hovered]?.[
                                item.ticker
                                ];

                            if (
                                value === null ||
                                value === undefined
                            ) {
                                return null;
                            }

                            return (
                                <circle
                                    key={
                                        item.ticker
                                    }
                                    cx={getX(
                                        hovered
                                    )}
                                    cy={getY(
                                        Number(
                                            value
                                        )
                                    )}
                                    r="4"
                                    fill={
                                        item.color
                                    }
                                    stroke="white"
                                    strokeWidth="2"
                                />
                            );
                        })}
                    </>
                )}
            </svg>

            {/* Tooltip */}
            {hoveredRow && (
                <ChartTooltip
                    row={hoveredRow}
                    series={series}
                    data={data}
                    getSeriesData={
                        getSeriesData
                    }
                    width={width}
                    height={height}
                    x={getX(hovered)}
                />
            )}
        </div>
    );
}

export default CustomLineChart;
