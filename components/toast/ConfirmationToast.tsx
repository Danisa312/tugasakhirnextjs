import React, { createContext, useContext, useState, ReactNode } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "confirm";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type ConfirmationToastContextType = {
  showToast: (
    message: string,
    type?: ToastType,
    options?: {
      confirmLabel?: string;
      cancelLabel?: string;
      onConfirm?: () => void;
      onCancel?: () => void;
    }
  ) => void;
};

const ConfirmationToastContext = createContext<
  ConfirmationToastContextType | undefined
>(undefined);

export const useConfirmationToast = () => {
  const context = useContext(ConfirmationToastContext);
  if (!context) {
    throw new Error(
      "useConfirmationToast must be used within ConfirmationToastProvider"
    );
  }
  return context;
};

export const ConfirmationToastProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { theme, resolvedTheme } = useTheme();

  // Determine if we're in dark mode
  const isDark = resolvedTheme === "dark" || theme === "dark";

  const showToast: ConfirmationToastContextType["showToast"] = (
    message,
    type = "success",
    options = {}
  ) => {
    const id = Date.now();
    const newToast: Toast = {
      id,
      message,
      type,
      ...options,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getConfirmButtonStyle = (type: ToastType) => {
    const baseStyle = {
      border: "none",
      color: "white",
      padding: "10px 20px",
      borderRadius: 6,
      cursor: "pointer",
      fontWeight: "500" as const,
      fontSize: "14px",
      transition: "all 0.2s ease",
      minWidth: "80px",
    };

    switch (type) {
      case "error":
        return {
          ...baseStyle,
          background: "#dc2626",
        };
      case "success":
        return {
          ...baseStyle,
          background: "#16a34a",
        };
      default:
        return {
          ...baseStyle,
          background: "#2563eb",
        };
    }
  };

  const getCancelButtonStyle = () => ({
    border: isDark ? "1px solid #4b5563" : "1px solid #d1d5db",
    background: isDark ? "#374151" : "white",
    color: isDark ? "#f9fafb" : "#374151",
    padding: "10px 20px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "500" as const,
    fontSize: "14px",
    transition: "all 0.2s ease",
    minWidth: "80px",
  });

  const getModalStyle = () => ({
    background: isDark ? "#1f2937" : "white",
    borderRadius: 12,
    padding: "24px",
    minWidth: "320px",
    maxWidth: "500px",
    boxShadow: isDark
      ? "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
      : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    border: isDark ? "1px solid #374151" : "none",
  });

  const getTextStyle = () => ({
    fontSize: "16px",
    color: isDark ? "#f9fafb" : "#111827",
    marginBottom: "20px",
    lineHeight: "1.5",
    textAlign: "center" as const,
  });

  const getBackdropStyle = () => ({
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  });

  const getCancelHoverStyle = () => ({
    backgroundColor: isDark ? "#4b5563" : "#f3f4f6",
  });

  return (
    <ConfirmationToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toasts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={getBackdropStyle()}
            onClick={(e: any) => {
              if (e.target === e.currentTarget) {
                // Close toast when clicking backdrop
                const latestToast = toasts[toasts.length - 1];
                if (latestToast) {
                  latestToast.onCancel?.();
                  removeToast(latestToast.id);
                }
              }
            }}
          >
            <AnimatePresence mode="wait">
              {toasts.map((toast, index) => (
                <motion.div
                  key={toast.id}
                  initial={{
                    scale: 0.8,
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    scale: 1 - index * 0.02,
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    scale: 0.8,
                    opacity: 0,
                    y: -20,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    duration: 0.3,
                  }}
                  style={{
                    ...getModalStyle(),
                    zIndex: 10000 - index,
                    position: index > 0 ? "absolute" : "relative",
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    style={getTextStyle()}
                  >
                    {toast.message}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.2 }}
                    style={{
                      display: "flex",
                      gap: "12px",
                      justifyContent: "center",
                    }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        toast.onCancel?.();
                        removeToast(toast.id);
                      }}
                      style={getCancelButtonStyle()}
                      onMouseEnter={(e: any) => {
                        const hoverStyle = getCancelHoverStyle();
                        e.currentTarget.style.backgroundColor =
                          hoverStyle.backgroundColor;
                      }}
                      onMouseLeave={(e: any) => {
                        const style = getCancelButtonStyle();
                        e.currentTarget.style.backgroundColor =
                          style.background;
                      }}
                    >
                      {toast.cancelLabel || "Batal"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        toast.onConfirm?.();
                        removeToast(toast.id);
                      }}
                      style={getConfirmButtonStyle(toast.type)}
                      onMouseEnter={(e: any) => {
                        const currentBg = e.currentTarget.style.background;
                        if (currentBg.includes("#dc2626")) {
                          e.currentTarget.style.background = "#b91c1c";
                        } else if (currentBg.includes("#16a34a")) {
                          e.currentTarget.style.background = "#15803d";
                        } else {
                          e.currentTarget.style.background = "#1d4ed8";
                        }
                      }}
                      onMouseLeave={(e: any) => {
                        const style = getConfirmButtonStyle(toast.type);
                        e.currentTarget.style.background = style.background;
                      }}
                    >
                      {toast.confirmLabel || "Ya"}
                    </motion.button>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmationToastContext.Provider>
  );
};
