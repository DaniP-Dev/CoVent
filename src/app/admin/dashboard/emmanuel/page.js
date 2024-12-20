'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Emmanuel from '@/components/Emmanuel/Emmanuel';
import AuthService from '@/services/AuthService';

const EmmanuelPage = () => {
    const router = useRouter();
    const [tiendaId, setTiendaId] = useState(null);
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/admin/auth/login');
            return;
        }
        
        setTiendaId(user.uid);
    }, [user, loading, router]);

    if (loading || !tiendaId) {
        return <div className="loading">Cargando...</div>;
    }

    return <Emmanuel tiendaId={tiendaId} />;
};

export default EmmanuelPage;
