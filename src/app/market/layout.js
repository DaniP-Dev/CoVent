import React from 'react';
import Content from '@/components/LayoutTools/Content/Content';
import Header from '@/components/LayoutTools/Header/Header';

const MarketLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden">
            <div className="flex-none w-full">
                <Header ruta="market" />
            </div>
            <div className="flex-1">
                <Content>
                    {children}
                </Content>
            </div>
        </div>
    );
};

export default MarketLayout;