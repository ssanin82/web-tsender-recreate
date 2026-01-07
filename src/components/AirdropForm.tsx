"use client";

import InputField from "@/components/ui/InputField";
import { useState } from "react";
import { chainsToSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount } from "wagmi";
import { readContract } from "@wagmi/core";

export default function ExportForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();

    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if (!tSenderAddress) {
            alert("No address found, please use a supported chain");
            return 0;
        }
        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [address, tSenderAddress as `0x${string}`]
        });
        return response as number;
    }

    async function handleSubmit() {
        const tSenderAddress = chainsToSender[chainId]["tsender"];
        const approvedAmount = await getApprovedAmount(tSenderAddress);
        console.log(approvedAmount);
    }

    return(
        <div>
            <InputField
                label="Token Address"
                placeholder="0x"
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
            />
            <InputField
                label="Recipients"
                placeholder="0x1234,0x5678,0x9012"
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
            />
            <InputField
                label="Recipients"
                placeholder="100,200,300..."
                value={amounts}
                onChange={e => setAmounts(e.target.value)}
            />
            <button onClick={handleSubmit}>
                Send Tokens
            </button>
        </div>
    );
};
