"use client"

import { useEffect } from "react"
import { Toaster } from "@/components/ui/sonner"

export function NotificationToaster() {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        window.dispatchEvent(new CustomEvent("sonner:pause"))
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  return <Toaster position="bottom-right" richColors />
}
