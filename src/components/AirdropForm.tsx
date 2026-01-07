"use client";

import InputField from "@/components/ui/InputField";
import { useState, useMemo } from "react";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount } from "wagmi";
import { readContract } from "@wagmi/core";
import { calculateTotal } from "@/utils";

export default function ExportForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();
    const total: number = useMemo(() => calculateTotal(amounts), [amounts]);

    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if (!tSenderAddress) {
            alert("No address found, please use a supported chain");
            return 0;
        }
        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address, tSenderAddress as `0x${string}`]
        });
        return response as number;
    }

    async function handleSubmit() {
        const tSenderAddress = chainsToTSender[chainId]["tsender"];
        const approvedAmount = await getApprovedAmount(tSenderAddress);
        console.log(approvedAmount);
    }

    return(
        <div className="mx-auto flex max-w-md flex-col gap-4">
            <InputField
                label="Token Address"
                placeholder="0x"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
            />

            <InputField
                label="Recipients"
                placeholder="0x1234,0x5678,0x9012"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
            />

            <InputField
                label="Amounts"
                placeholder="100,200,300..."
                value={amounts}
                onChange={(e) => setAmounts(e.target.value)}
            />

            {/* Button spacing */}
            <div className="pt-4">
                <button
                onClick={handleSubmit}
                className="
                    w-full
                    inline-flex items-center justify-center
                    rounded-lg
                    bg-blue-600 px-6 py-3
                    text-sm font-semibold text-white
                    shadow-md
                    transition-all duration-200
                    hover:bg-blue-700 hover:shadow-lg
                    active:scale-[0.98]
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    disabled:cursor-not-allowed disabled:opacity-50
                "
                >
                Send Tokens
                </button>
            </div>
        </div>
    );
};
