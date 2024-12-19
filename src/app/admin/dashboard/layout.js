"use client";
import React from 'react';
import Content from '@/components/LayoutTools/Content/Content';
import Header from '@/components/LayoutTools/Header/Header';
import SideBar from '@/components/LayoutTools/Sidebar/SideBar';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const AdminLayout = ({ children }) => {
    return (
        <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
                <Header ruta="admin" className="flex-none" />
                <div className="flex-1 flex overflow-hidden">
                    <SideBar className="flex-none" />
                    <Content>{children}</Content>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AdminLayout;