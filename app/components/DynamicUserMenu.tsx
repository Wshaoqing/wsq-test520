"use client"
import { WalletContext } from "../contexts/WalletContext"
import { useContext } from "react"
import Button from "./Button"
import { useTranslations } from "next-intl"
const shortWalletAddress = (address: string) => {
 return `${address.slice(0, 6)}...${address.slice(-4)}`
}
export const DynamicUserMenu = () => {
 const { connectWallet, isLoading, disconnectWallet, currentAccount } =
  useContext(WalletContext)
 const t = useTranslations()
 if (!connectWallet) {
  console.error("connectWallet is not provided by WalletContext")
 }
 return (
  <div>
   {currentAccount ? (
    <Button size="small" variant="primary" onClick={disconnectWallet}>
     {shortWalletAddress(currentAccount)}
    </Button>
   ) : (
    <Button
     isLoading={isLoading}
     size="small"
     variant="primary"
     onClick={connectWallet}
    >
     {t("connect")}
    </Button>
   )}
  </div>
 )
}
