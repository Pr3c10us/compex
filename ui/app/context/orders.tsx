"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Order {
  id: string;
  usdcAmount: string;
  rate: string;
  bankName: string;
  accountNumber: string;
  fullName: string;
  status: "open" | "pending" | "confirmed";
  receiptUrl?: string;
  receiptName?: string;
}

interface OrdersContextValue {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "status">) => void;
  submitReceipt: (orderId: string, file: File) => void;
  confirmOrder: (orderId: string) => void;
}

const STORAGE_KEY = "compex_orders";

function load(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function save(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setOrders(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) save(orders);
  }, [orders, hydrated]);

  function addOrder(data: Omit<Order, "id" | "status">) {
    setOrders((prev) => [
      ...prev,
      { ...data, id: crypto.randomUUID(), status: "open" },
    ]);
  }

  async function submitReceipt(orderId: string, file: File) {
    const dataUrl = await fileToDataUrl(file);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "pending", receiptUrl: dataUrl, receiptName: file.name }
          : o
      )
    );
  }

  function confirmOrder(orderId: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "confirmed" } : o
      )
    );
  }

  return (
    <OrdersContext.Provider value={{ orders, addOrder, submitReceipt, confirmOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside OrdersProvider");
  return ctx;
}
