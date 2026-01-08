"use client";

import InputField from "@/components/ui/InputField";
import { useState, useMemo } from "react";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useConnection, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { calculateTotal } from "@/utils";

export default function ExportForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");
    const chainId = useChainId();
    const config = useConfig();
    const { address } = useConnection();
    const total: number = useMemo(() => calculateTotal(amounts), [amounts]);
    const { data: hash, isPending, mutateAsync } = useWriteContract();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if (!tSenderAddress) {
            alert("No address found, please use a supported chain");
            return 0;
        }
        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [ address, tSenderAddress as `0x${string}`]
        });
        return response as number;
    }

    async function airdrop(tSenderAddress: string): Promise<void> {
        await mutateAsync({
            abi: tsenderAbi,
            address: tSenderAddress as `0x${string}`,
            functionName: "airdropERC20",
            args: [
                tokenAddress,
                // Comma or new line separated
                recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                BigInt(total),
            ],
        });
    }

    async function handleSubmit() {
        try {
            setIsSubmitting(true);
            const tSenderAddress = chainsToTSender[chainId]["tsender"];
            const approvedAmount = await getApprovedAmount(tSenderAddress);
            if (approvedAmount < total) {
                const approvalHash = await mutateAsync({
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: "approve",
                    args: [tSenderAddress as `0x${string}`, BigInt(total)]
                });
                const approvalReceipt = await waitForTransactionReceipt(config, {
                    hash: approvalHash
                });
                if (approvalReceipt && approvalReceipt.status === "success") {
                    console.log("Approval confirmed:", approvalReceipt);
                    await airdrop(tSenderAddress);
                } else {
                    console.log("Approval failed or not confirmed:", approvalReceipt);
                    return;
                }
            } else {
                await airdrop(tSenderAddress);
            }
        } finally {
            setIsSubmitting(false);
        }
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
                label="Recipients (comma or new line separated)"
                placeholder="0x1234,0x5678,0x9012"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
            />

            <InputField
                label="Amounts (wei; comma or new line separated)"
                placeholder="100,200,300..."
                value={amounts}
                onChange={(e) => setAmounts(e.target.value)}
            />

            {/* Button spacing */}
            <div className="pt-4">
                <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="
                    w-full
                    inline-flex items-center justify-center gap-2
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
                {isSubmitting && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {isSubmitting ? "Processing…" : "Send Tokens"}
                </button>
            </div>
        </div>
    );
};
