import { toast } from "sonner";

interface ToastOptions {
  description?: string;
  duration?: number;
}

export function useToast() {
  const showSuccess = (message: string, options?: ToastOptions) => {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration || 3000,
    });
  };

  const showError = (message: string, options?: ToastOptions) => {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000,
    });
  };

  const showInfo = (message: string, options?: ToastOptions) => {
    toast.info(message, {
      description: options?.description,
      duration: options?.duration || 3000,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    toast,
  };
}
