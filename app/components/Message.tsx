"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"

// Props for the Message component
interface MessageProps {
 message: string
 type?: "success" | "error" | "info" | "warning"
 onClose: () => void
}

// Message Component with animations
const Message: React.FC<MessageProps> = ({
 message,
 type = "info",
 onClose,
}) => {
 const backgroundColor = {
  success: "bg-accent-success text-white",
  error: "bg-accent-error text-white",
  warning: "bg-accent-warning text-white",
  info: "bg-primary text-white",
 }[type]

 return (
  <motion.div
   initial={{ opacity: 0, y: -10 }}
   animate={{ opacity: 1, y: 0 }}
   exit={{ opacity: 0, y: -10 }}
   transition={{ duration: 0.3 }}
   className={`
        fixed z-50 max-w-sm w-full px-4 py-3 rounded-md shadow-md 
        ${backgroundColor} text-white
        sm:top-5 sm:left-1/2 sm:transform sm:-translate-x-1/2
        md:bottom-5 md:left-5 md:top-auto md:transform-none
      `}
  >
   <div className="flex justify-between items-center">
    <span className="text-sm font-medium">{message}</span>
    <button
     onClick={onClose}
     aria-label="Close"
     className="ml-4 text-white opacity-75 hover:opacity-100 transition-opacity"
    >
     &times;
    </button>
   </div>
  </motion.div>
 )
}

export default Message
