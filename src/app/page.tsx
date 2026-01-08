"use client";

import { useConnection } from "wagmi";
import HomeContent from "@/components/HomeContent";
import { useEffect, useState } from "react";

export default function Home() {
    const { address } = useConnection();
    const [mounted, setMounted] = useState(false);

    // ensure client-only rendering
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null; // nothing rendered on server

    return (
        <div>
            {!address ? (
                <div>Please connect a wallet...</div>
            ) : (
                <div>
                  <HomeContent />
                </div>
            )}
        </div>
    );
}