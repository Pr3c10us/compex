'use client'
import Image from 'next/image'
import { useConnection, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'

export function Connection() {
    const { address } = useConnection()
    const { disconnect } = useDisconnect()
    const { data: ensName } = useEnsName({ address })
    const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

    const display = ensName ?? (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '')

    return (
        <div className="flex items-center gap-3">
            {ensAvatar && (
                <Image src={ensAvatar} alt="avatar" width={32} height={32} className="rounded-full" />
            )}
            <span className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg">
                {display}
            </span>
            <button
                onClick={() => disconnect()}
                className="text-sm text-red-500 hover:text-red-600 transition-colors"
            >
                Disconnect
            </button>
        </div>
    )
}
