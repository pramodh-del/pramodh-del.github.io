import { createContext, useContext } from 'react'

export const ToastContext = createContext<(msg: string) => void>(() => undefined)

export const useToast = () => useContext(ToastContext)
