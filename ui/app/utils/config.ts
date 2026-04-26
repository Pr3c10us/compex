import { http, fallback, createConfig } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID!

export const config = createConfig({
    chains: [mainnet, base],
    connectors: [
        injected(),
        walletConnect({ projectId }),
        metaMask({
            dapp: {
                name: 'Compex',
                url: typeof window !== 'undefined'
                    ? window.location.origin
                    : 'http://localhost:3000',
            },
        }),
        safe(),
    ],
    transports: {
        [mainnet.id]: fallback([
            http('https://eth.llamarpc.com'),
            http('https://rpc.ankr.com/eth'),
            http(),
        ]),
        [base.id]: fallback([
            http('https://mainnet.base.org'),
            http('https://base.llamarpc.com'),
            http(),
        ]),
    },
})