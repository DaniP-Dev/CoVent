'use client';
import React from 'react';
import StatsRow from '../KPIs/StatsRow';

const DashboardContainer = ({ children, tiendaId }) => {
    return (
        <div className="h-full flex flex-col gap-4">
            {/* KPIs row - altura fija */}
            <div className="flex-none h-24">
                <StatsRow tiendaId={tiendaId} />
            </div>
            
            {/* Charts grid - altura dinámica */}
            <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
                {children}
            </div>
        </div>
    );
};

export default DashboardContainer; 