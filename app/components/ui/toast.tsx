"use client";

import * as React from "react";
import { cn } from "cn";
import { AlertTriangle, CheckCircle, Info, XCircle, Loader2 } from "lucide-react";
import { Button } from "./button";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 5000;

type ToastVariant = "default" | "destructive" | "success" | "warning" | "loading";

interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: ToastVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const iconMap: Record<ToastVariant, React.ElementType> = {
  default: Info,
  destructive: AlertTriangle,
  success: CheckCircle,
  warning: AlertTriangle,
  loading: Loader2,
};

const variantStyles: Record<ToastVariant, string> = {
  default: "border bg-background text-foreground",
  destructive: "border-destructive bg-destructive text-destructive-foreground",
  success: "border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100",
  warning: "border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-100",
  loading: "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100",
};

export function Toast({
  className,
  variant = "default",
  title,
  description,
  action,
  open = true,
  onOpenChange,
  ...props
}: ToastProps) {
  if (!open) return null;

  const Icon = iconMap[variant];

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all animate-in fade-in-80 slide-in-from-top-full sm:slide-in-from-bottom-full",
        variantStyles[variant],
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn("h-4 w-4 shrink-0", variant === "loading" && "animate-spin")}
          aria-hidden="true"
        />
        <div className="grid gap-1">
          {title && <div className="font-medium leading-none text-sm">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
      <button
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        onClick={() => onOpenChange?.(false)}
        aria-label="Close"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function ToastAction({ className, ...props }: ToastActionProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

interface ToasterProps {
  toasts: Array<ToastProps & { id: string }>;
  onDismiss: (id: string) => void;
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div className="fixed bottom-0 right-0 flex flex-col p-4 sm:bottom-4 sm:right-4 sm:flex-row sm:items-end sm:p-0 gap-2 z-50 w-full max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onOpenChange={(open) => !open && onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastState {
  toasts: Array<ToastProps & { id: string }>;
}

const initialState: ToastState = { toasts: [] };

type ToastAction =
  | { type: "ADD_TOAST"; toast: ToastProps & { id: string } }
  | { type: "DISMISS_TOAST"; id?: string }
  | { type: "REMOVE_TOAST"; id?: string };

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "ADD_TOAST":
      return { toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case "DISMISS_TOAST": {
      if (action.id) {
        return { toasts: state.toasts.map((t) => (t.id === action.id ? { ...t, open: false } : t)) };
      }
      return { toasts: state.toasts.map((t) => ({ ...t, open: false })) };
    }
    case "REMOVE_TOAST":
      if (action.id === undefined) return { toasts: [] };
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
  }
}

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = initialState;

function dispatch(action: ToastAction) {
  memoryState = toastReducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

type Toast = Omit<ToastProps, "id" | "open" | "onOpenChange">;

function toast({ ...props }: Toast) {
  const id = genId();

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
    },
  });

  setTimeout(() => {
    dispatch({ type: "REMOVE_TOAST", id });
  }, TOAST_REMOVE_DELAY);

  return { id, dismiss };
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (id?: string) => dispatch({ type: "DISMISS_TOAST", id }),
  };
}

export { toast };