"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import config from "@/rainbowKitConfig";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

export function Providers(props: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient);
    return (
        <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>
                <RainbowKitProvider>
                    {props.children}
                </RainbowKitProvider>
            </WagmiProvider>
        </QueryClientProvider>
    );
}
