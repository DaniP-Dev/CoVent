const DashboardContainer = ({ children, tiendaId }) => {
    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            <div className="flex-none h-24">
                <StatsRow tiendaId={tiendaId} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 h-[calc(100%-7rem)] overflow-hidden">
                {children}
            </div>
        </div>
    );
}; 