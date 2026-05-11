// components/ui/sonner.tsx
"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-primary/20 group-[.toaster]:shadow-soft group-[.toaster]:rounded-[2rem] group-[.toaster]:p-6 group-[.toaster]:font-bold",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:font-semibold",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-full",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-full",
          success: "group-[.toast]:text-emerald-600 group-[.toast]:bg-emerald-50/50",
          error: "group-[.toast]:text-rose-600 group-[.toast]:bg-rose-50/50",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
