'use client'
import * as React from 'react'
import Image from 'next/image'
import { Connector, useConnect, useConnectors } from 'wagmi'

export function WalletOptions({ onConnect }: { onConnect?: () => void }) {
    const { mutate: connect } = useConnect()
    const connectors = useConnectors()

    return (
        <div className="flex flex-col gap-2">
            {connectors.map((connector) => (
                <WalletOption
                    key={connector.uid}
                    connector={connector}
                    onClick={() => connect({ connector }, { onSuccess: onConnect })}
                />
            ))}
        </div>
    )
}

function WalletOption({
    connector,
    onClick,
}: {
    connector: Connector
    onClick: () => void
}) {
    const [ready, setReady] = React.useState<boolean | null>(null)

    React.useEffect(() => {
        connector.getProvider()
            .then(p => setReady(!!p))
            .catch(() => setReady(false))
    }, [connector])

    // WalletConnect and MetaMask handle unavailable state themselves (QR modal / install prompt)
    const alwaysEnabled = connector.type === 'walletConnect' || connector.type === 'metaMask'
    const enabled = alwaysEnabled || ready === true

    return (
        <button
            disabled={!enabled}
            onClick={onClick}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
        >
            {connector.icon ? (
                <Image src={connector.icon} alt="" width={32} height={32} unoptimized className="rounded-lg object-contain" />
            ) : (
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                    {connector.name[0]}
                </div>
            )}
            <span className="font-medium text-sm">{connector.name}</span>
            {ready === null && !alwaysEnabled && (
                <span className="ml-auto text-xs text-gray-400">Checking...</span>
            )}
        </button>
    )
}
