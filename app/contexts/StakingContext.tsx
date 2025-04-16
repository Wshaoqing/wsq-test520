"use client"

import React, { useState, useEffect, createContext, useContext } from "react"
import { ethers, Contract } from "ethers"
import STAKING_ABI from "../../public/abi/Staking.json"
import TOKEN_ABI from "../../public/abi/IERC20Mock.json"
import { WalletContext } from "./WalletContext"
// Define the types for the Staking Context
interface StakingContextType {
 stakeTokens: (amount: string, option: number) => Promise<boolean>
 withdrawTokens: (index: number) => Promise<boolean>
 getUserStakedInfo: () => Promise<void>
 rewardsRemaining: () => Promise<void>
 userStakedAmount: string
 rewardsAvailable: string
 loading: boolean
}

// Create the Staking Context
export const StakingContext = createContext<StakingContextType | undefined>(
 undefined
)

// Props type for the provider
interface StakingProviderProps {
 children: React.ReactNode
}

// Function to initialize a contract instance
const getEthereumContract = async (
 contractAddress: string,
 contractABI: any
): Promise<Contract> => {
 if (!window.ethereum) {
  throw new Error("Ethereum provider not found")
 }
 const provider = new ethers.BrowserProvider(window.ethereum)
 const signer = await provider.getSigner()
 return new ethers.Contract(contractAddress, contractABI, signer)
}

// The StakingProvider component
export const StakingProvider: React.FC<StakingProviderProps> = ({
 children,
}) => {
 const { currentAccount } = useContext(WalletContext) // Wallet context for current connected account
 const [userStakedAmount, setUserStakedAmount] = useState<string>("0") // User's staked amount
 const [rewardsAvailable, setRewardsAvailable] = useState<string>("0") // Total rewards available
 const [loading, setLoading] = useState<boolean>(false) // Loading state

 // Utility function to fetch Staking Contract instance
 const getStakingContract = async (): Promise<Contract> => {
  const stakingAddress = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS!

  return getEthereumContract(stakingAddress, STAKING_ABI.abi)
 }

 // Utility function to fetch ERC20 Token Contract instance
 const getTokenContract = async (): Promise<Contract> => {
  const tokenAddress = process.env.NEXT_PUBLIC_STAKING_TOKEN_ADDRESS!

  return getEthereumContract(tokenAddress, TOKEN_ABI.abi)
 }

 /**
  * Stake tokens in the staking contract
  * @param amount - Amount of tokens to stake
  * @param option - Staking option (e.g., different APY durations)
  */
 const stakeTokens = async (amount: string, option: number) => {
  try {
   setLoading(true)
   const stakingContract = await getStakingContract()

   // Convert ETH amount to wei
   const valueInWei = ethers.parseUnits(amount, "ether")

   // Call the deposit function with ETH
   const tx = await stakingContract.deposit(option, {
    value: valueInWei,
   })
   await tx.wait()
   console.log("ETH staked successfully.")
   return true
  } catch (error) {
   console.error("Failed to stake tokens:", error)
   return false
  } finally {
   setLoading(false)
  }
 }

 /**
  * Withdraw staked tokens
  * @param index - Index of the staking entry to withdraw
  */
 const withdrawTokens = async (index: number) => {
  try {
   setLoading(true)
   const stakingContract = await getStakingContract()
   const tx = await stakingContract.withdraw(index)
   await tx.wait()
   console.log("Tokens withdrawn successfully.")
   return true
  } catch (error) {
   console.error("Failed to withdraw tokens:", error)
  } finally {
   setLoading(false)
   return false
  }
 }

 /**
  * Fetch user's total staked amount from the contract
  */
 const getUserStakedInfo = async () => {
  try {
   setLoading(true)
   const stakingContract = await getStakingContract()
   const amount = await stakingContract.getStakedTokens(currentAccount)

   setUserStakedAmount(ethers.formatUnits(amount, 18))
  } catch (error) {
   console.error("Failed to fetch staked information:", error)
  } finally {
   setLoading(false)
  }
 }

 /**
  * Fetch remaining rewards in the staking contract
  */
 const rewardsRemaining = async () => {
  try {
   const stakingContract = await getStakingContract()
   const rewards = await stakingContract.rewardsRemaining()
   setRewardsAvailable(ethers.formatUnits(rewards, 18))
  } catch (error) {
   console.error("Failed to fetch rewards information:", error)
  }
 }

 // Fetch data when the current account changes
 useEffect(() => {
  if (currentAccount) {
   getUserStakedInfo()
   rewardsRemaining()
  }
 }, [currentAccount])

 return (
  <StakingContext.Provider
   value={{
    stakeTokens,
    withdrawTokens,
    getUserStakedInfo,
    rewardsRemaining,
    userStakedAmount,
    rewardsAvailable,
    loading,
   }}
  >
   {children}
  </StakingContext.Provider>
 )
}

// Custom hook for using the Staking Context
export const useStaking = () => {
 const context = useContext(StakingContext)
 if (!context) {
  throw new Error("useStaking must be used within StakingProvider")
 }
 return context
}
