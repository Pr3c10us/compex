"use client";

import { useRef, useState } from "react";
import { useOrders, Order } from "../context/orders";

type Tab = "browse" | "my-orders";

const STATUS_LABEL: Record<Order["status"], string> = {
  open: "Open",
  pending: "Receipt Submitted",
  confirmed: "Fulfilled",
};

const STATUS_COLOR: Record<Order["status"], string> = {
  open: "bg-blue-50 text-blue-700",
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-green-50 text-green-700",
};

const STEPS = [
  { key: "open",      label: "Order Found" },
  { key: "pending",   label: "Receipt Submitted" },
  { key: "confirmed", label: "Fulfilled" },
] as const;

function ProgressBar({ status }: { status: Order["status"] }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done ? "bg-black text-white" : "bg-gray-100 text-gray-400 border border-gray-300"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-xs whitespace-nowrap ${done ? "text-black font-medium" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${i < currentIndex ? "bg-black" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderDetail({
  order,
  onBack,
}: {
  order: Order;
  onBack: () => void;
}) {
  const { orders, submitReceipt } = useOrders();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const live = orders.find((o) => o.id === order.id) ?? order;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      submitReceipt(live.id, file);
      setUploading(false);
    }, 800);
  }

  return (
    <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-black mb-5"
      >
        ← Back
      </button>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">Order Details</h2>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[live.status]}`}>
          {STATUS_LABEL[live.status]}
        </span>
      </div>

      <ProgressBar status={live.status} />

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

      {live.status === "open" && (
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Upload Payment Receipt
            </label>
            <div
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-black transition-colors"
            >
              {file ? (
                <p className="text-sm text-gray-800 font-medium">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm text-gray-500">Click to select a file</p>
                  <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10 MB</p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Submitting…" : "Submit Receipt"}
          </button>
        </form>
      )}

      {live.status === "pending" && (
        <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 text-sm text-yellow-800">
          <p className="font-medium mb-0.5">Waiting for seller confirmation</p>
          <p className="text-yellow-700">Receipt: {live.receiptName}</p>
        </div>
      )}

      {live.status === "confirmed" && (
        <div className="p-4 rounded-lg border border-green-200 bg-green-50 text-sm text-green-800 font-medium">
          Order fulfilled — seller has confirmed your payment.
        </div>
      )}
    </div>
  );
}

export default function Buyer() {
  const { orders } = useOrders();
  const [tab, setTab] = useState<Tab>("browse");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const openOrders = orders.filter((o) => o.status === "open");
  const myOrders = orders.filter((o) => o.status !== "open");

  if (selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  return (
    <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {([["browse", "Browse Orders"], ["my-orders", "My Orders"]] as [Tab, string][]).map(([t, label]) => {
          const count = t === "my-orders" ? myOrders.length : null;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              {label}{count ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>

      {tab === "browse" && (
        <>
          {openOrders.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No open orders at the moment.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {openOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium">{order.usdcAmount} USDC</p>
                    <p className="text-xs text-gray-500 mt-0.5">Rate: {order.rate}</p>
                  </div>
                  <span className="text-xs text-gray-400">View →</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "my-orders" && (
        <>
          {myOrders.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No orders in progress yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {myOrders.map((order) => (
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
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
