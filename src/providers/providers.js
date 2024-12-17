'use client';
import { AuthProvider } from '@/contexts/AuthContext';

function Providers({ children }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}

export default Providers;