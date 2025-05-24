"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const isInformative = props.variant === "informative";

        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3 ">
              <div className="grid gap-1">
                {title && (
                  <ToastTitle>
                    <div className="flex items-center gap-2">
                      {isInformative && (
                        <Info className="h-5 w-5 text-wari-black mt-0.5" />
                      )}
                      <span>{title}</span>
                    </div>
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}

      <ToastViewport />
    </ToastProvider>
  );
}
