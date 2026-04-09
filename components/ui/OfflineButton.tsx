"use client";
// Botón que se bloquea automáticamente cuando no hay conexión
import { ButtonHTMLAttributes, forwardRef } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

interface OfflineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Si true, el botón siempre funciona aunque no haya conexión */
  allowOffline?: boolean;
  /** Tooltip personalizado cuando está offline */
  offlineMessage?: string;
}

export const OfflineButton = forwardRef<HTMLButtonElement, OfflineButtonProps>(
  (
    {
      children,
      disabled,
      allowOffline = false,
      offlineMessage = "Requiere conexión a Internet",
      className = "",
      onClick,
      ...props
    },
    ref
  ) => {
    const online = useOnlineStatus();
    const isDisabled = disabled || (!allowOffline && !online);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!allowOffline && !online) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        className={`${className} ${
          !allowOffline && !online
            ? "cursor-not-allowed opacity-50 relative"
            : ""
        }`}
        title={!allowOffline && !online ? offlineMessage : undefined}
        {...props}
      >
        {!allowOffline && !online && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/5 rounded-inherit">
            <WifiOff size={16} className="text-gray-500" />
          </div>
        )}
        {children}
      </button>
    );
  }
);

OfflineButton.displayName = "OfflineButton";
