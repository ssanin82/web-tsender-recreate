"use client";

import Header from "@/components/Header";
import HomeContent from "@/components/HomeContent";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  return (
    <div>
      {!isConnected ? (
        <div>
          Please connect a wallet...
        </div>
      ) : (
        <div>
          <HomeContent />
        </div>
      )}
    </div>
  );
}
