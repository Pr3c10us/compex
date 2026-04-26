'use client'
import { useState } from 'react'
import { useConnection } from 'wagmi'
import { WalletOptions } from './walletOptions'
import { Connection } from './connections'

export function Navbar() {
    const [open, setOpen] = useState(false)
    const { isConnected } = useConnection()

    return (
        <>
            <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <span className="text-xl font-bold tracking-tight">Compex</span>

                {isConnected ? (
                    <Connection />
                ) : (
                    <button
                        onClick={() => setOpen(true)}
                        className="bg-black cursor-pointer text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        Connect Wallet
                    </button>
                )}
            </nav>

            {open && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-[360px] shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold">Connect Wallet</h2>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <WalletOptions onConnect={() => setOpen(false)} />
                    </div>
                </div>
            )}
        </>
    )
}
