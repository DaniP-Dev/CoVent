"use client";
import React from 'react';
import Content from '@/components/LayoutTools/Content/Content';
import Header from '@/components/LayoutTools/Header/Header';

const MarketLayout = ({ children }) => {
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <div className="flex-none">
                <Header ruta="market" />
            </div>
            <div className="flex-1 overflow-hidden">
                <Content>
                    {children}
                </Content>
            </div>
        </div>
    );
};

export default MarketLayout;