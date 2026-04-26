"use client";

import { useState } from "react";
import { useOrders, Order } from "../context/orders";

interface SellerForm {
  usdcAmount: string;
  rate: string;
  bankName: string;
  accountNumber: string;
  fullName: string;
}

const INITIAL: SellerForm = {
  usdcAmount: "",
  rate: "",
  bankName: "",
  accountNumber: "",
  fullName: "",
};

const STATUS_LABEL: Record<Order["status"], string> = {
  open: "Open",
  pending: "Receipt Submitted",
  confirmed: "Confirmed",
};

const STATUS_COLOR: Record<Order["status"], string> = {
  open: "bg-blue-50 text-blue-700",
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-green-50 text-green-700",
};

type Tab = "create" | "orders";

export default function Seller() {
  const { orders, addOrder, confirmOrder } = useOrders();
  const [tab, setTab] = useState<Tab>("create");
  const [form, setForm] = useState<SellerForm>(INITIAL);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addOrder(form);
    setForm(INITIAL);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  function handleConfirm(orderId: string) {
    confirmOrder(orderId);
    setSelectedOrder((prev) => prev ? { ...prev, status: "confirmed" } : prev);
  }

  if (selectedOrder) {
    const live = orders.find((o) => o.id === selectedOrder.id) ?? selectedOrder;
    return (
      <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <button
          onClick={() => setSelectedOrder(null)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-black mb-5"
        >
          ← Back to orders
        </button>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Order Details</h2>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[live.status]}`}>
            {STATUS_LABEL[live.status]}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-6">
          <dt className="text-gray-500">USDC Amount</dt>
          <dd className="font-medium">{live.usdcAmount} USDC</dd>
          <dt className="text-gray-500">Rate</dt>
          <dd className="font-medium">{live.rate}</dd>
          <dt className="text-gray-500">Bank</dt>
          <dd className="font-medium">{live.bankName}</dd>
          <dt className="text-gray-500">Account Number</dt>
          <dd className="font-medium">{live.accountNumber}</dd>
          <dt className="text-gray-500">Account Name</dt>
          <dd className="font-medium">{live.fullName}</dd>
        </dl>

        {live.status === "pending" && (
          <div className="mb-6 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
            <p className="text-sm font-medium text-yellow-800 mb-1">Receipt submitted by buyer</p>
            <p className="text-sm text-yellow-700 truncate">{live.receiptName}</p>
            {live.receiptUrl && (
              <a
                href={live.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-yellow-800 underline mt-1 inline-block"
              >
                View receipt
              </a>
            )}
          </div>
        )}

        {live.status === "confirmed" && (
          <div className="p-4 rounded-lg border border-green-200 bg-green-50 text-sm text-green-800 font-medium">
            Order confirmed.
          </div>
        )}

        {live.status === "pending" && (
          <button
            onClick={() => handleConfirm(live.id)}
            className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Confirm Order
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(["create", "orders"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            {t === "create" ? "Create Order" : `My Orders${orders.length ? ` (${orders.length})` : ""}`}
          </button>
        ))}
      </div>

      {tab === "create" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-4">
            <legend className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
              Order Details
            </legend>

            <div className="flex flex-col gap-1">
              <label htmlFor="usdcAmount" className="text-sm font-medium text-gray-700">
                USDC Amount
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black">
                <input
                  id="usdcAmount"
                  name="usdcAmount"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={form.usdcAmount}
                  onChange={handleChange}
                  required
                  className="flex-1 px-3 py-2 text-sm outline-none bg-white"
                />
                <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border-l border-gray-300">
                  USDC
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="rate" className="text-sm font-medium text-gray-700">
                Rate <span className="text-gray-400 font-normal">(local currency per USDC)</span>
              </label>
              <input
                id="rate"
                name="rate"
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={form.rate}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
              Bank Details
            </legend>

            <div className="flex flex-col gap-1">
              <label htmlFor="bankName" className="text-sm font-medium text-gray-700">
                Bank Name
              </label>
              <input
                id="bankName"
                name="bankName"
                type="text"
                placeholder="e.g. First Bank"
                value={form.bankName}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
                Account Number
              </label>
              <input
                id="accountNumber"
                name="accountNumber"
                type="text"
                inputMode="numeric"
                placeholder="0123456789"
                value={form.accountNumber}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name on Account
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </fieldset>

          {submitted && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              Order listed successfully.
            </p>
          )}

          <button
            type="submit"
            className="mt-1 w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            List Order
          </button>
        </form>
      )}

      {tab === "orders" && (
        <div className="flex flex-col gap-3">
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium">{order.usdcAmount} USDC</p>
                  <p className="text-xs text-gray-500 mt-0.5">Rate: {order.rate}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status]}`}>
                  {STATUS_LABEL[order.status]}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
