import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchMyOrders,
  fetchOrderWithItems,
} from "../../api/user/orders";

/* ---------- STATUS UI HELPERS ---------- */
const getOrderStatusUI = (status) => {
  switch (status) {
    case "COMPLETED":
      return { text: "Completed", bg: "#dcfce7", color: "#166534" };
    case "PROCESSING":
      return { text: "Processing", bg: "#e0f2fe", color: "#075985" };
    default:
      return { text: "Placed", bg: "#fef3c7", color: "#92400e" };
  }
};

const getPaymentStatusUI = (status) => {
  switch (status) {
    case "PAID":
    case "SUCCESS":
      return { text: "Paid", bg: "#dcfce7", color: "#166534" };
    case "FAILED":
      return { text: "Failed", bg: "#fee2e2", color: "#991b1b" };
    default:
      return { text: "Pending", bg: "#fef3c7", color: "#92400e" };
  }
};

export default function OrderHistoryPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Modal state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderModalLoading, setOrderModalLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeOrderItems, setActiveOrderItems] = useState([]);

  /* ---------- LOAD ORDERS ---------- */
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetchMyOrders();
        const raw = res.data;
        const list =
          Array.isArray(raw) ? raw : raw.orders || raw.data || [];
        setOrders(list);
      } catch {
        setErrorMsg("Failed to load your orders.");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  /* ---------- MODAL HANDLERS ---------- */
  const openOrderModal = async (order) => {
    try {
      setOrderModalLoading(true);
      setActiveOrder(order);
      setOrderModalOpen(true);

      const res = await fetchOrderWithItems(order.id);
      setActiveOrderItems(res.data.items || []);
    } catch {
      alert("Failed to load order details");
      setOrderModalOpen(false);
    } finally {
      setOrderModalLoading(false);
    }
  };

  const closeOrderModal = () => {
    setOrderModalOpen(false);
    setActiveOrder(null);
    setActiveOrderItems([]);
  };

  const formatDate = (val) => {
    try {
      return new Date(val).toLocaleString();
    } catch {
      return val || "";
    }
  };

  /* ---------- UI ---------- */
  return (
    <div style={ui.page}>
      {/* HEADER */}
      <div style={ui.header}>
        <button
          style={ui.backBtn}
          onClick={() => navigate("/user/dashboard")}
        >
          ←
        </button>
        <h2 style={ui.headerTitle}>Your Orders</h2>
      </div>

      {/* STATES */}
      {loading ? (
        <div style={ui.centerText}>Loading your orders… ☕</div>
      ) : errorMsg ? (
        <div style={{ ...ui.centerText, color: "#dc2626" }}>
          {errorMsg}
        </div>
      ) : orders.length === 0 ? (
        <div style={ui.empty}>
          <p style={ui.emptyText}>No orders yet</p>
          <button
            style={ui.primaryBtn}
            onClick={() => navigate("/user/dashboard")}
          >
            Start Ordering
          </button>
        </div>
      ) : (
        <div style={ui.list}>
          {orders.map((order) => {
            const orderUI = getOrderStatusUI(order.status);
            const paymentUI = getPaymentStatusUI(order.payment_status);

            return (
              <div
                key={order.id}
                style={ui.card}
                onClick={() => openOrderModal(order)}
              >
                {/* TOP */}
                <div style={ui.cardTop}>
                  <div>
                    <div style={ui.orderId}>
                      ORDER #{order.unique_code || order.id}
                    </div>
                    <div style={ui.amount}>
                      ₹{" "}
                      {Number(
                        order.final_amount || order.amount || 0
                      ).toFixed(2)}
                    </div>
                    <div style={ui.date}>
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                </div>

                {/* STATUS ROW */}
                <div style={ui.statusRow}>
                  <div style={ui.statusBlock}>
                    <span style={ui.statusLabel}>🛒 Order</span>
                    <span
                      style={{
                        ...ui.statusPill,
                        background: orderUI.bg,
                        color: orderUI.color,
                      }}
                    >
                      {orderUI.text}
                    </span>
                  </div>

                  <div style={ui.statusBlock}>
                    <span style={ui.statusLabel}>💳 Payment</span>
                    <span
                      style={{
                        ...ui.statusPill,
                        background: paymentUI.bg,
                        color: paymentUI.color,
                      }}
                    >
                      {paymentUI.text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ORDER DETAIL MODAL */}
      {orderModalOpen && activeOrder && (
        <div style={ui.modalBackdrop}>
          <div style={ui.modalCard}>
            <div style={ui.modalHeader}>
              <div>
                <div style={ui.modalTitle}>
                  Order #{activeOrder.unique_code || activeOrder.id}
                </div>
                <div style={ui.modalSub}>
                  {formatDate(activeOrder.created_at)}
                </div>
              </div>
              <button onClick={closeOrderModal} style={ui.modalClose}>
                ✕
              </button>
            </div>

            {orderModalLoading ? (
              <p>Loading items…</p>
            ) : (
              activeOrderItems.map((item) => (
                <div key={item.id} style={ui.modalItem}>
                  <div style={{ fontWeight: 600 }}>
                    {item.product_name} × {item.quantity}
                  </div>
                  <div style={{ fontSize: 13 }}>
                    ₹ {Number(item.total_price || 0).toFixed(2)}
                  </div>

                  {item.addons?.length > 0 && (
                    <div style={ui.addons}>
                      {item.addons.map((a) => (
                        <div key={a.id}>
                          {a.ingredients} (+₹{a.price})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}

            <div style={ui.modalTotal}>
              <div>
                Amount: ₹ {Number(activeOrder.amount || 0).toFixed(2)}
              </div>
              <div>
                GST: ₹ {Number(activeOrder.gst_amount || 0).toFixed(2)}
              </div>
              <div style={{ fontWeight: 700 }}>
                Total: ₹{" "}
                {Number(activeOrder.final_amount || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- STYLES ---------- */
const ui = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#fff7ed,#f7f7f7)",
  },

  header: {
    padding: "16px",
    display: "flex",
    gap: 12,
    alignItems: "center",
    background: "linear-gradient(135deg,#401A13,#6b2a1f)",
    color: "#fff",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
  },

  headerTitle: { margin: 0, fontSize: 22 },

  centerText: {
    padding: 40,
    textAlign: "center",
    color: "#6b7280",
  },

  empty: { padding: 60, textAlign: "center" },
  emptyText: { fontSize: 18, marginBottom: 12 },

  primaryBtn: {
    padding: "14px 26px",
    borderRadius: 999,
    border: "none",
    background: "#401A13",
    color: "#fff",
    fontWeight: 700,
  },

  list: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  card: {
    background: "#fff",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    cursor: "pointer",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
  },

  orderId: { fontSize: 12, color: "#6b7280" },
  amount: { fontSize: 22, fontWeight: 800 },
  date: { fontSize: 12, color: "#6b7280" },

  statusRow: {
    marginTop: 12,
    display: "flex",
    justifyContent: "space-between",
  },

  statusBlock: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  statusLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 600,
  },

  statusPill: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },

  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.3)",
    backdropFilter: "blur(2px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
    padding: 16,
  },

  modalCard: {
    width: "100%",
    maxWidth: 500,
    background: "#fff",
    borderRadius: 14,
    padding: 16,
    maxHeight: "85vh",
    overflowY: "auto",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  modalTitle: { fontSize: 16, fontWeight: 700 },
  modalSub: { fontSize: 12, color: "#6b7280" },

  modalClose: {
    border: "none",
    background: "transparent",
    fontSize: 18,
    cursor: "pointer",
  },

  modalItem: {
    borderBottom: "1px solid #e5e7eb",
    padding: "8px 0",
  },

  addons: {
    fontSize: 12,
    marginTop: 4,
    color: "#374151",
  },

  modalTotal: {
    marginTop: 10,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 8,
    fontSize: 14,
  },
};
