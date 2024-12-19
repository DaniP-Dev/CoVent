const ChartContainer = ({ children, title, stats }) => {
    return (
        <div className="bg-white rounded-lg shadow flex flex-col h-full overflow-hidden max-h-[500px]">
            {/* Header */}
            <div className="flex-none p-3 border-b">
                <h3 className="font-semibold text-gray-700">{title}</h3>
            </div>
            
            {/* Chart area */}
            <div className="flex-1 min-h-0 p-4 overflow-hidden">
                {children}
            </div>
            
            {/* Stats footer */}
            {stats && (
                <div className="flex-none p-3 border-t bg-gray-50">
                    {stats}
                </div>
            )}
        </div>
    );
};

export default ChartContainer; 