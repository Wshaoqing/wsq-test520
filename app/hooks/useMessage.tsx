import { useState, useCallback } from "react"

type MessageType = "success" | "error" | "info" | "warning"

interface MessageState {
 isOpen: boolean
 message: string
 type: MessageType
}

const useMessage = (autoCloseDuration = 3000) => {
 const [messageState, setMessageState] = useState<MessageState>({
  isOpen: false,
  message: "",
  type: "info",
 })

 const showMessage = useCallback(
  (message: string, type: MessageType = "info") => {
   setMessageState({ isOpen: true, message, type })

   // Automatically close the message after the specified duration
   setTimeout(() => {
    closeMessage()
   }, autoCloseDuration)
  },
  [autoCloseDuration]
 )

 const closeMessage = useCallback(() => {
  setMessageState((prev) => ({ ...prev, isOpen: false }))
 }, [])

 return { messageState, showMessage, closeMessage }
}

export default useMessage
