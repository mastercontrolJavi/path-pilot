"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const iconClass = "size-[18px] stroke-[1.5]"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className={`${iconClass} text-success`} />,
        info: <InfoIcon className={`${iconClass} text-ink-muted`} />,
        warning: <TriangleAlertIcon className={`${iconClass} text-ink`} />,
        error: <OctagonXIcon className={`${iconClass} text-danger`} />,
        loading: <Loader2Icon className={`${iconClass} animate-spin text-ink-muted`} />,
      }}
      style={
        {
          "--normal-bg": "var(--color-sheet)",
          "--normal-text": "var(--color-ink)",
          "--normal-border": "var(--color-contour)",
          "--border-radius": "var(--radius-panel)",
          "--font-family": "var(--font-sans)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !shadow-float !gap-3 !px-4 !py-3.5 !text-sm",
          description: "!text-ink-muted",
          actionButton: "!bg-forest !text-sheet !rounded-control",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
