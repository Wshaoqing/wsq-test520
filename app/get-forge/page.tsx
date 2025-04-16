"use client"

import React, { useState, useEffect } from "react"

const Page = () => {
 const [canClaimForge, setCanClaimForge] = useState(true)
 const [timeRemaining, setTimeRemaining] = useState(0)

 // Retrieve the last claim timestamp from localStorage
 useEffect(() => {
  const lastClaimTime = localStorage.getItem("lastClaimTime")
  if (lastClaimTime) {
   const elapsedTime = Date.now() - parseInt(lastClaimTime, 10)
   const cooldown = 6 * 60 * 60 * 1000 // 6 hours in milliseconds
   if (elapsedTime < cooldown) {
    setCanClaimForge(false)
    setTimeRemaining(cooldown - elapsedTime)
   }
  }
 }, [])

 // Countdown timer
 useEffect(() => {
  if (!canClaimForge && timeRemaining > 0) {
   const interval = setInterval(() => {
    setTimeRemaining((prev) => {
     if (prev <= 1000) {
      clearInterval(interval)
      setCanClaimForge(true)
      return 0
     }
     return prev - 1000
    })
   }, 1000)
   return () => clearInterval(interval)
  }
 }, [canClaimForge, timeRemaining])

 const handleClaimForge = () => {
  if (canClaimForge) {
   // Simulate claiming FORGE
   console.log("FORGE tokens claimed!")
   localStorage.setItem("lastClaimTime", Date.now().toString())
   setCanClaimForge(false)
   setTimeRemaining(6 * 60 * 60 * 1000) // Reset cooldown
  }
 }

 // Format the countdown timer as HH:MM:SS
 const formatTime = (ms: number) => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${hours.toString().padStart(2, "0")}:${minutes
   .toString()
   .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
 }

 return (
  <div className="space-y-8 p-4 max-w-3xl mx-auto">
   {/* Section 1: Sepolia Introduction */}
   <section className="bg-gray-100 p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold mb-4">What is Sepolia?</h2>
    <p className="text-gray-700 mb-4">
     Sepolia is an Ethereum testnet designed for developers to experiment with
     dApps and smart contracts in a safe and controlled environment.
    </p>
    <p className="text-gray-700 mb-4">
     To get started, you'll need some Sepolia tokens. These tokens are free and
     can be used to deploy and test your projects.
    </p>
    <a
     href="https://sepoliafaucet.com/"
     target="_blank"
     rel="noopener noreferrer"
     className="inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
     Get Sepolia Tokens
    </a>
   </section>

   {/* Section 2: FORGE Token Introduction */}
   <section className="bg-gray-100 p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold mb-4">Introducing FORGE Token</h2>
    <p className="text-gray-700 mb-4">
     FORGE is our platform's utility token, designed to empower users and
     facilitate interactions within the ecosystem. Claim your FORGE tokens and
     start exploring the benefits today!
    </p>
    <button
     onClick={handleClaimForge}
     disabled={!canClaimForge}
     className={`px-6 py-2 rounded ${
      canClaimForge
       ? "bg-green-500 text-white hover:bg-green-600"
       : "bg-gray-300 text-gray-500 cursor-not-allowed"
     }`}
    >
     {canClaimForge
      ? "Claim FORGE Tokens"
      : `Wait ${formatTime(timeRemaining)}`}
    </button>
    {!canClaimForge && (
     <p className="mt-2 text-gray-600">
      You can claim your next FORGE tokens in{" "}
      <span className="font-bold">{formatTime(timeRemaining)}</span>.
     </p>
    )}
   </section>
  </div>
 )
}

export default Page
