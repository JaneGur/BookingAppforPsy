import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { Path } from '@/lib/routing'

export async function middleware(request: NextRequest) {
    const session = await auth()
    const { pathname } = request.nextUrl

    // Публичные пути (гостевой доступ)
    const isPublicPath =
        pathname === Path.Main ||
        pathname.startsWith(Path.Booking) ||
        pathname.startsWith(Path.Login) ||
        pathname.startsWith(Path.Register)

    // API всегда пропускаем (обрабатывается роутами)
    if (pathname.startsWith('/api')) {
        return NextResponse.next()
    }

    if (isPublicPath) {
        return NextResponse.next()
    }

    // Админка: только для admin
    if (pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL(Path.Login, request.url))
        }

        if (session.user.role !== 'admin') {
            return NextResponse.redirect(new URL(Path.Main, request.url))
        }

        return NextResponse.next()
    }

    // Личный кабинет клиента: только для авторизованных
    if (pathname.startsWith(Path.ClientDashboard)) {
        if (!session) {
            return NextResponse.redirect(new URL(Path.Login, request.url))
        }

        return NextResponse.next()
    }

    // Остальные пути пока считаем публичными
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

