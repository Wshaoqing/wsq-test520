// WalletContext.tsx
"use client"
import React, { useState, useEffect, createContext, ReactNode } from "react"
import { ethers } from "ethers"

interface WalletContextProps {
 connectWallet: () => Promise<void>
 disconnectWallet: () => void
 currentAccount: string | null
 currentChain: string
 isLoading: boolean
}

interface NetworkConfig {
 chainId: string
 chainName: string
 nativeCurrency: {
  name: string
  symbol: string
  decimals: number
 }
 rpcUrls: string[]
 blockExplorerUrls: string[]
}

export const WalletContext = createContext<WalletContextProps>(
 {} as WalletContextProps
)

export const WalletProvider: React.FC<{ children: ReactNode }> = ({
 children,
}) => {
 const [currentAccount, setCurrentAccount] = useState<string | null>(null)
 const [currentChain, setCurrentChain] = useState<string>("0x1")
 const [isLoading, setIsLoading] = useState<boolean>(false)
 const checkAccountConnected = async () => {
  if (window.ethereum) {
   const accounts: string[] = await window.ethereum.request({
    method: "eth_accounts",
   })
   if (accounts.length) {
    setCurrentAccount(accounts[0])
   } else {
    setCurrentAccount(null)
   }
  }
 }

 useEffect(() => {
  checkAccountConnected()
  if (window.ethereum) {
   window.ethereum.on("accountsChanged", checkAccountConnected)
   window.ethereum.on("chainChanged", (chainId: string) => {
    setCurrentChain(chainId)
   })
  }
 }, [])

 const networkConfig: NetworkConfig = {
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || "0x1",
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME || "Ethereum Mainnet",
  nativeCurrency: {
   name: process.env.NEXT_PUBLIC_NATIVE_CURRENCY_NAME || "Ether",
   symbol: process.env.NEXT_PUBLIC_NATIVE_CURRENCY_SYMBOL || "ETH",
   decimals: Number(process.env.NEXT_PUBLIC_NATIVE_CURRENCY_DECIMALS) || 18,
  },
  rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL || ""],
  blockExplorerUrls: [process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || ""],
 }

 const switchNetwork = async (networkConfig: NetworkConfig) => {
  if (window.ethereum) {
   try {
    await window.ethereum.request({
     method: "wallet_switchEthereumChain",
     params: [{ chainId: networkConfig.chainId }],
    })
   } catch (switchError: any) {
    if (switchError.code === 4902) {
     try {
      await window.ethereum.request({
       method: "wallet_addEthereumChain",
       params: [networkConfig],
      })
     } catch (addError) {
      console.error("Failed to add network:", addError)
     }
    } else {
     console.error("Failed to switch network:", switchError)
    }
   }
  }
 }

 const connectWallet = async () => {
  try {
   if (!window.ethereum) {
    return
   }
   setIsLoading(true)
   const provider = new ethers.BrowserProvider(window.ethereum)
   await provider.send("eth_requestAccounts", [])
   const signer = await provider.getSigner()
   const account = await signer.getAddress()
   setCurrentAccount(account)
   setIsLoading(false)
   switchNetwork(networkConfig)
  } catch (error: any) {
   setIsLoading(false)
   console.error("Error connecting wallet:", error)
  }
 }

 const disconnectWallet = () => {
  try {
   setCurrentAccount(null)
  } catch (error: any) {
   console.error("Error disconnecting wallet:", error)
  }
 }

 return (
  <WalletContext.Provider
   value={{
    connectWallet,
    disconnectWallet,
    currentAccount,
    currentChain,
    isLoading,
   }}
  >
   {children}
  </WalletContext.Provider>
 )
}
