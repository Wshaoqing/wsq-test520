"use client"

import React, { ReactNode, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Button from "./Button"

// Props type for the Modal component
interface ModalProps {
 isOpen: boolean // Controls the visibility of the modal
 onClose: () => void // Function to close the modal
 onConfirm: () => void // Function to confirm the action
 children: ReactNode // Modal content
 title?: string // Optional title for the modal
 confirmLabel?: string // Label for the confirm button
 closeLabel?: string // Label for the close button
 isLoading?: boolean // Loading state for the confirm button
}

// Reusable Modal Component
const Modal: React.FC<ModalProps> = ({
 isOpen,
 onClose,
 onConfirm,
 children,
 title,
 confirmLabel = "Confirm",
 closeLabel = "Close",
 isLoading = false,
}) => {
 // Close modal on `Escape` key press
 const handleKeyDown = useCallback(
  (event: KeyboardEvent) => {
   if (event.key === "Escape") {
    onClose()
   }
  },
  [onClose]
 )

 useEffect(() => {
  if (isOpen) {
   document.addEventListener("keydown", handleKeyDown)
  }
  return () => {
   document.removeEventListener("keydown", handleKeyDown)
  }
 }, [isOpen, handleKeyDown])

 return (
  <AnimatePresence>
   {isOpen && (
    <>
     {/* Backdrop with fade-in/out effect */}
     <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} // Close modal when clicking on the backdrop
     />

     {/* Modal Content */}
     <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
     >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-md">
       {/* Modal Header */}
       {title && (
        <div className="bg-gray-100 px-4 py-3 border-b">
         <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
       )}

       {/* Modal Body */}
       <div className="p-6">{children}</div>

       {/* Modal Footer */}
       <div className="px-4 py-3 flex justify-end gap-3 bg-gray-50">
        <Button onClick={onClose} variant="outline">
         {closeLabel}
        </Button>
        <Button onClick={onConfirm} variant="primary" isLoading={isLoading}>
         {confirmLabel}
        </Button>
       </div>
      </div>
     </motion.div>
    </>
   )}
  </AnimatePresence>
 )
}

export default Modal
