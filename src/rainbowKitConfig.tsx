"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, zksync, mainnet } from "wagmi/chains";

export default getDefaultConfig({
    appName: "TSender",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [sepolia, zksync, mainnet],
    ssr: false
});
