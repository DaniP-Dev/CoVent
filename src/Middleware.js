import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase/firebaseConfig';
import AuthService from '@/services/AuthService';

export async function middleware(request) {
    const path = request.nextUrl.pathname;
    
    if (path.startsWith('/admin') && !path.includes('/admin/auth')) {
        try {
            const token = request.cookies.get('auth_token');
            if (!token) {
                return NextResponse.redirect(new URL('/admin/auth/login', request.url));
            }

            // Verificar token con Firebase
            const decodedToken = await auth.verifyIdToken(token.value);
            
            // Verificar si tiene tienda asociada
            if (!await AuthService.verificarTiendaExistente(decodedToken.uid)) {
                return NextResponse.redirect(new URL('/admin/auth/register', request.url));
            }

        } catch (error) {
            return NextResponse.redirect(new URL('/admin/auth/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*'
};