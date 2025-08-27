import { toast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export const useToast = () => {
  const showToast = ({ title, description, variant = "default" }: ToastProps) => {
    const message = title || ""
    const desc = description || ""
    const fullMessage = desc ? `${message}\n${desc}` : message

    if (variant === "destructive") {
      toast.error(fullMessage)
    } else {
      toast.success(fullMessage)
    }
  }

  return {
    toast: showToast,
  }
}