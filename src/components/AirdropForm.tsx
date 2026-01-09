"use client";

import InputField from "@/components/ui/InputField";
import { useEffect, useState, useMemo } from "react";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useConnection, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { calculateTotal } from "@/utils";

export default function ExportForm() {
    const [tokenAddress, setTokenAddress] = useState<string>(() =>
        typeof window !== "undefined" ? localStorage.getItem("tokenAddress") ?? "" : ""
    );
    const [recipients, setRecipients] = useState<string>(() =>
        typeof window !== "undefined" ? localStorage.getItem("recipients") ?? "" : ""
    );
    const [amounts, setAmounts] = useState<string>(() =>
        typeof window !== "undefined" ? localStorage.getItem("amounts") ?? "" : ""
    );
    const [tokenName, setTokenName] = useState("")
    const chainId = useChainId();
    const config = useConfig();
    const { address } = useConnection();
    const total: number = useMemo(() => calculateTotal(amounts), [amounts]);
    const { data: hash, isPending, mutateAsync } = useWriteContract();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

     useEffect((): void => {
        const savedToken = localStorage.getItem("tokenAddress");
        const savedRecipients = localStorage.getItem("recipients");
        const savedAmounts = localStorage.getItem("amounts");

        if (savedToken !== null) setTokenAddress(savedToken);
        if (savedRecipients !== null) setRecipients(savedRecipients);
        if (savedAmounts !== null) setAmounts(savedAmounts);
    }, []);

    useEffect((): void => {
        localStorage.setItem("tokenAddress", tokenAddress);
    }, [tokenAddress]);

    useEffect((): void => {
        localStorage.setItem("recipients", recipients);
    }, [recipients]);

    useEffect((): void => {
        localStorage.setItem("amounts", amounts);
    }, [amounts]);

    // Fetch token name when address changes
    useEffect(() => {
        if (!tokenAddress) {
            setTokenName("");
            return;
        }
        const fetchName = async () => {
            try {
                const name = await readContract(config, {
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: "name",
                    args: [],
                });
                setTokenName(name as string);
            } catch {
                setTokenName("");
            }
        };
        fetchName();
    }, [tokenAddress, config]);
    
    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if (!tSenderAddress) {
            alert("No address found, please use a supported chain");
            return 0;
        }
        try {
            setErrorMessage(null);
            const response = await readContract(config, {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "allowance",
                args: [ address, tSenderAddress as `0x${string}`]
            });
            return response as number;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setErrorMessage(message);
        }
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
                try {
                    const approvalHash = await mutateAsync({
                        abi: erc20Abi,
                        address: tokenAddress as `0x${string}`,
                        functionName: "approve",
                        args: [tSenderAddress as `0x${string}`, BigInt(total)]
                    });
                    const approvalReceipt = await waitForTransactionReceipt(config, {
                        hash: approvalHash
                    });
                } catch (err) {
                    const message = err instanceof Error ? err.message : "Something went wrong";
                    setErrorMessage(message);
                    return;
                }
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
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
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

            {errorMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="
                    w-full max-w-sm rounded-xl p-6 shadow-2xl
                    bg-zinc-900 text-zinc-100
                    border border-zinc-800
                    ">
                    <h2 className="mb-2 text-lg font-semibold text-red-400">
                        Transaction Failed
                    </h2>
                    <p className="mb-4 text-sm text-zinc-300">
                        {errorMessage}
                    </p>
                    <button
                        onClick={() => setErrorMessage(null)}
                        className="
                        w-full rounded-lg bg-red-600 px-4 py-2
                        text-sm font-semibold text-white
                        transition hover:bg-red-700
                        focus:outline-none focus:ring-2 focus:ring-red-500
                        "
                    >
                        Close
                    </button>
                    </div>
                </div>
            )}

            {/* Token details box */}
            {tokenAddress && (
            <div className="mt-4 rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900 to-zinc-800 p-5 text-zinc-100 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 border-b border-zinc-700 pb-2">Token Details</h3>
                <div className="space-y-2">
                <p className="flex justify-between">
                    <span className="font-medium text-zinc-300">Name:</span>
                    <span className="text-zinc-100">{tokenName || "Unknown"}</span>
                </p>
                <p className="flex justify-between">
                    <span className="font-medium text-zinc-300">Amount (wei):</span>
                    <span className="text-zinc-100">{total.toString()}</span>
                </p>
                <p className="flex justify-between">
                    <span className="font-medium text-zinc-300">Amount (tokens):</span>
                    <span className="text-zinc-100">{(total / 1e18).toFixed(4)}</span>
                </p>
                </div>
            </div>
            )}

            {/* Documentation Panel */}
            {tokenAddress && (
            <div className="mt-4 rounded-xl border border-emerald-800 bg-gradient-to-br from-emerald-900 to-yellow-900 p-5 text-amber-200 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 border-b border-emerald-700 pb-2">Documentation</h3>
                <div className="space-y-2 text-sm">
                    <p>
                        This will airdrop a given token by its address to given wallet(s). Example of a token with required airdrop functionality can be found here: 
                        <a 
                            href="https://github.com/ssanin82/solidity-erc20-airdrop-sepolia-test" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline text-amber-300"
                        >
                            solidity-erc20-airdrop-sepolia-test
                        </a>. 
                        This page is made for demo purposes only. It was tested on the Sepolia blockchain. It supports only the Metamask wallet. Wagmi supports many more chains, and various types of wallets could have been used, but this is a proof-of-concept page only.
                    </p>

                </div>
            </div>
        )}
        </div>
    );
};
