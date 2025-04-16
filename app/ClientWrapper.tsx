"use client"
import React, { ReactNode } from "react"
import { WalletProvider } from "./contexts/WalletContext"
import { StakingProvider } from "./contexts/StakingContext"
interface ClientWrapperProps {
 children: ReactNode
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
 return (
  <WalletProvider>
   <StakingProvider>{children}</StakingProvider>
  </WalletProvider>
 )
}
export default ClientWrapper
