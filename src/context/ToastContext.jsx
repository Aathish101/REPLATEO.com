import { createContext, useContext, useState } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Create a toast
  const addToast = (message, type = "success") => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    // Start exit after 2.5s
    setTimeout(() => startExit(id), 2500);
  };

  // Trigger exit animation
  const startExit = (id) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, exiting: true } : toast
      )
    );

    // Remove fully after animation ends
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast Render Container */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={toast.exiting ? "animate-toast-out" : "animate-toast-in"}
          >
            <Toast message={toast.message} type={toast.type} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
