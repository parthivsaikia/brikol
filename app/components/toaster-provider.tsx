"use client";

import { Toaster, useToast } from "~/components/ui/toast";

export function ToasterProvider() {
  const { toasts, dismiss } = useToast();

  return <Toaster toasts={toasts} onDismiss={dismiss} />;
}