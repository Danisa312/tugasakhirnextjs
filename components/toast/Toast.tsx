import { useEffect } from "react";
import { Card, Text } from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export const ToastContainer = ({ toasts, removeToast }: ToastProps) => {
  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), 3000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <Card
              css={{
                px: "$4",
                py: "$2",
                backgroundColor:
                  toast.type === "success" ? "#4ade80" : "#f87171",
                color: "#fff",
                minWidth: "200px",
                borderRadius: "$lg",
              }}
            >
              <Text>{toast.message}</Text>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
