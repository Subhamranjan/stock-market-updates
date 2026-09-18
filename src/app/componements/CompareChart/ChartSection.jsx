import CustomLineChart from "./CustomLineChart";
import { formatNumber } from "./ChartUtils";

function ChartSection({
    chartSeries,
    latestValues,
    mergedData,
    getSeriesData,
    isLoading,
}) {
    return (
        <main className="min-w-0 flex-1 p-5">

            {/* Legend */}
            <div className="mb-4 flex flex-wrap items-center gap-4">
                {chartSeries.map((series) => (
                    <div
                        key={series.ticker}
                        className="flex items-center gap-2 text-xs"
                    >
                        <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                                backgroundColor:
                                    series.color,
                            }}
                        />

                        <span>
                            {series.label}
                        </span>

                        {latestValues[
                            series.ticker
                        ] !== null &&
                            latestValues[
                            series.ticker
                            ] !== undefined && (
                                <span className="text-zinc-500">
                                    {formatNumber(
                                        latestValues[
                                        series.ticker
                                        ]
                                    )}
                                </span>
                            )}
                    </div>
                ))}
            </div>

            {/* Chart Container */}
            <div className="relative h-[calc(100%-40px)] min-h-[400px] rounded-xl border border-zinc-200 bg-white p-4">

                {isLoading && (
                    <div className="absolute right-4 top-4 z-10 rounded-md bg-white px-3 py-1.5 text-xs text-zinc-500 shadow">
                        Loading...
                    </div>
                )}

                {mergedData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                        No data available.
                    </div>
                ) : (
                    <CustomLineChart
                        data={mergedData}
                        series={chartSeries}
                        getSeriesData={getSeriesData}
                    />
                )}
            </div>
        </main>
    );
}

export default ChartSection;
