"use client"

import { useState } from "react"
import { Dialog, Tab } from "@headlessui/react"

function classNames(...classes: string[]) {
 return classes.filter(Boolean).join(" ")
}

export default function Page() {
 const [supplyModalOpen, setSupplyModalOpen] = useState(false)
 const [borrowModalOpen, setBorrowModalOpen] = useState(false)
 const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
 const [amount, setAmount] = useState("")

 const assetsToSupply = [
  { name: "ETH", apy: "2.04%", collateral: true, balance: "0.0371004" },
  { name: "WETH", apy: "2.04%", collateral: true, balance: "0" },
  { name: "USDT", apy: "8.65%", collateral: false, balance: "0" },
 ]

 const assetsToBorrow = [
  { name: "GHO", apy: "6.59% - 9.42%", available: "0" },
  { name: "ETH", apy: "2.71%", available: "0" },
  { name: "USDT", apy: "10.48%", available: "0" },
 ]

 return (
  <div className="max-w-7xl mx-auto px-4 py-6">
   {/* Header */}
   <div className="text-center mb-8">
    <h1 className="text-2xl font-bold">Dashboard</h1>
    <p className="text-gray-500">Net worth: $0 | Net APY: --</p>
   </div>

   {/* Tabs for Mobile */}
   <div className="sm:hidden">
    <Tab.Group>
     <Tab.List className="flex justify-center mb-6 space-x-2 bg-gray-100 p-2 rounded-md">
      <Tab
       className={({ selected }) =>
        classNames(
         "w-1/2 py-2 text-center rounded-md font-medium transition",
         selected
          ? "bg-primary text-white"
          : "bg-white text-gray-500 hover:bg-gray-200"
        )
       }
      >
       Supply
      </Tab>
      <Tab
       className={({ selected }) =>
        classNames(
         "w-1/2 py-2 text-center rounded-md font-medium transition",
         selected
          ? "bg-primary text-white"
          : "bg-white text-gray-500 hover:bg-gray-200"
        )
       }
      >
       Borrow
      </Tab>
     </Tab.List>

     <Tab.Panels>
      {/* Supply Section */}
      <Tab.Panel>
       <h2 className="text-lg font-bold">Assets to Supply</h2>
       <div className="mt-4 space-y-4">
        {assetsToSupply.map((asset) => (
         <div
          key={asset.name}
          className="flex items-center justify-between bg-gray-100 p-4 rounded-md shadow-sm h-20"
         >
          <div>
           <h3 className="text-sm font-medium">{asset.name}</h3>
           <p className="text-xs text-gray-500">APY: {asset.apy}</p>
           <p className="text-xs text-gray-500">Balance: {asset.balance}</p>
          </div>
          <button
           className="px-4 py-2 bg-primary text-white text-sm rounded-md"
           onClick={() => {
            setSelectedAsset(asset.name)
            setSupplyModalOpen(true)
           }}
          >
           Supply
          </button>
         </div>
        ))}
       </div>
      </Tab.Panel>

      {/* Borrow Section */}
      <Tab.Panel>
       <h2 className="text-lg font-bold">Assets to Borrow</h2>
       <div className="mt-4 space-y-4">
        {assetsToBorrow.map((asset) => (
         <div
          key={asset.name}
          className="flex items-center justify-between bg-gray-100 p-4 rounded-md shadow-sm h-20"
         >
          <div>
           <h3 className="text-sm font-medium">{asset.name}</h3>
           <p className="text-xs text-gray-500">APY: {asset.apy}</p>
          </div>
          <button
           className="px-4 py-2 bg-primary text-white text-sm rounded-md"
           onClick={() => {
            setSelectedAsset(asset.name)
            setBorrowModalOpen(true)
           }}
          >
           Borrow
          </button>
         </div>
        ))}
       </div>
      </Tab.Panel>
     </Tab.Panels>
    </Tab.Group>
   </div>

   {/* PC Layout */}
   <div className="hidden sm:grid sm:grid-cols-2 sm:gap-6">
    {/* Supply Section */}
    <div className="sm:col-span-1">
     <h2 className="text-lg font-bold">Assets to Supply</h2>
     <div className="mt-4 space-y-4">
      {assetsToSupply.map((asset) => (
       <div
        key={asset.name}
        className="flex items-center justify-between bg-gray-100 p-4 rounded-md shadow-sm h-20"
       >
        <div>
         <h3 className="text-sm font-medium">{asset.name}</h3>
         <p className="text-xs text-gray-500">APY: {asset.apy}</p>
         <p className="text-xs text-gray-500">Balance: {asset.balance}</p>
        </div>
        <button
         className="px-4 py-2 bg-primary text-white text-sm rounded-md"
         onClick={() => {
          setSelectedAsset(asset.name)
          setSupplyModalOpen(true)
         }}
        >
         Supply
        </button>
       </div>
      ))}
     </div>
    </div>

    {/* Borrow Section */}
    <div className="sm:col-span-1">
     <h2 className="text-lg font-bold">Assets to Borrow</h2>
     <div className="mt-4 space-y-4">
      {assetsToBorrow.map((asset) => (
       <div
        key={asset.name}
        className="flex items-center justify-between bg-gray-100 p-4 rounded-md shadow-sm h-20"
       >
        <div>
         <h3 className="text-sm font-medium">{asset.name}</h3>
         <p className="text-xs text-gray-500">APY: {asset.apy}</p>
        </div>
        <button
         className="px-4 py-2 bg-primary text-white text-sm rounded-md"
         onClick={() => {
          setSelectedAsset(asset.name)
          setBorrowModalOpen(true)
         }}
        >
         Borrow
        </button>
       </div>
      ))}
     </div>
    </div>
   </div>

   {/* Modals */}
   <Dialog
    open={supplyModalOpen}
    onClose={() => setSupplyModalOpen(false)}
    className="relative z-50"
   >
    <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center">
     <Dialog.Panel className="bg-white rounded-lg shadow-xl w-11/12 max-w-md transform transition-all p-6">
      <h3 className="text-lg font-bold mb-4">Supply {selectedAsset}</h3>
      <div className="space-y-4">
       <div>
        <label className="block text-sm font-medium">Amount</label>
        <input
         type="number"
         className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
         placeholder="Enter amount"
         value={amount}
         onChange={(e) => setAmount(e.target.value)}
        />
       </div>
       <p className="text-xs text-gray-500">Supply APY: 2.04%</p>
      </div>
      <div className="mt-6 flex justify-end space-x-4">
       <button
        className="px-4 py-2 bg-gray-200 rounded-md"
        onClick={() => setSupplyModalOpen(false)}
       >
        Cancel
       </button>
       <button className="px-4 py-2 bg-primary text-white rounded-md">
        Confirm
       </button>
      </div>
     </Dialog.Panel>
    </div>
   </Dialog>

   <Dialog
    open={borrowModalOpen}
    onClose={() => setBorrowModalOpen(false)}
    className="relative z-50"
   >
    <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center">
     <Dialog.Panel className="bg-white rounded-lg shadow-xl w-11/12 max-w-md transform transition-all p-6">
      <h3 className="text-lg font-bold mb-4">Borrow {selectedAsset}</h3>
      <div className="space-y-4">
       <div>
        <label className="block text-sm font-medium">Amount</label>
        <input
         type="number"
         className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
         placeholder="Enter amount"
         value={amount}
         onChange={(e) => setAmount(e.target.value)}
        />
       </div>
       <p className="text-xs text-gray-500">Borrow APY: 6.59% - 9.42%</p>
      </div>
      <div className="mt-6 flex justify-end space-x-4">
       <button
        className="px-4 py-2 bg-gray-200 rounded-md"
        onClick={() => setBorrowModalOpen(false)}
       >
        Cancel
       </button>
       <button className="px-4 py-2 bg-primary text-white rounded-md">
        Confirm
       </button>
      </div>
     </Dialog.Panel>
    </div>
   </Dialog>
  </div>
 )
}
