import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    )
}