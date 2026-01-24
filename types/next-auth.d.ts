import NextAuth, { type DefaultSession } from 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            role: 'client' | 'admin'
            phone?: string
        } & DefaultSession['user']
    }

    interface User {
        id: string
        role?: 'client' | 'admin'
        phone?: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role?: 'client' | 'admin'
        phone?: string
    }
}
