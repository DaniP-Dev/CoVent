"use client";
import React from 'react';
import Content from '@/components/LayoutTools/Content/Content';
import Header from '@/components/LayoutTools/Header/Header';
import SideBar from '@/components/LayoutTools/Sidebar/SideBar';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const AdminLayout = ({ children }) => {
    return (
        <ProtectedRoute>
            <div className="min-h-screen flex flex-col overflow-x-hidden">
                <div className="flex-none w-full">
                    <Header ruta="admin" />
                </div>
                <div className="flex-1 flex">
                    <div className="flex-none">
                        <SideBar />
                    </div>
                    <div className="flex-1">
                        <Content>
                            {children}
                        </Content>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AdminLayout;