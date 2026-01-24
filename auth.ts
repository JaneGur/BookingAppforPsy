import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserByEmailOrPhone } from '@/lib/auth/user'

export const { handlers, auth, signIn, signOut } = NextAuth({
    pages: {
        signIn: '/login',
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                identifier: { label: 'Email or phone', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.identifier || !credentials.password) {
                    return null
                }

                const identifier = credentials.identifier as string
                const password = credentials.password as string

                const user = await getUserByEmailOrPhone(identifier)

                if (!user || !user.password) {
                    return null
                }

                const passwordsMatch = await bcrypt.compare(password, user.password)

                if (!passwordsMatch) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                if (token.sub) {
                    session.user.id = token.sub
                }

                session.user.role = (token.role as 'client' | 'admin') ?? 'client'
                session.user.phone = token.phone as string | undefined
            }

            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role ?? 'client'
                token.phone = user.phone
            }

            return token
        },
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
})
