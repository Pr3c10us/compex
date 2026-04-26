"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '../utils/config'
import { OrdersProvider } from '../context/orders'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <OrdersProvider>
                    {children}
                </OrdersProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
