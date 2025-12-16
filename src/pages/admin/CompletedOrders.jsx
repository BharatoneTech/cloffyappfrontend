// src/pages/admin/CompletedOrders.jsx

import React, { useEffect, useState } from "react";
import AdmnSidebar from "../../components/admin/admnsidebar.jsx";
import {
  fetchAllOrdersAdmin,
  fetchOrderWithItems,
} from "../../api/user/orders";

export default function CompletedOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeItems, setActiveItems] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadCompletedOrders();
  }, []);

  const loadCompletedOrders = async () => {
    try {
      const res = await fetchAllOrdersAdmin();
      const raw = res.data.orders || [];

      const completed = raw.filter((o) => o.status === "COMPLETED");
      setOrders(completed);
    } catch (err) {
      console.error("Completed orders fetch error:", err);
      alert("Failed to load data");
    }
  };

  // 🔥 OPEN MODAL WITH FULL ORDER DETAILS
  const openOrderModal = async (order) => {
    try {
      setModalOpen(true);
      setModalLoading(true);

      const res = await fetchOrderWithItems(order.id);
      setActiveOrder(res.data.order);
      setActiveItems(res.data.items);
    } catch (err) {
      console.error("Modal load error:", err);
      alert("Unable to load order details");
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveOrder(null);
    setActiveItems([]);
  };

  // 🔍 Filtering
  const filtered = orders.filter((o) => {
    const matchSearch =
      o.unique_code?.toLowerCase().includes(search.toLowerCase()) ||
      o.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user_contact?.toLowerCase().includes(search.toLowerCase());

    const dt = new Date(o.created_at);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const matchDate =
      (!from || dt >= from) && (!to || dt <= to);

    return matchSearch && matchDate;
  });

  return (
    <div style={{ display: "flex" }}>
      <AdmnSidebar />

      {/* MAIN CONTENT */}
      <div
        style={{
          marginLeft: "30%",
          width: "70%",
          padding: "40px",
          background: "#f5f7fa",
          minHeight: "100vh",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: 700 }}>
          Completed Orders
        </h1>

        {/* FILTERS */}
        <div style={{ margin: "20px 0", display: "flex", gap: "10px" }}>
          <input
            placeholder="Search order, user or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "260px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* TABLE */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#f3f4f6",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <th style={{ padding: "12px" }}>Order Code</th>
                <th style={{ padding: "12px" }}>User</th>
                <th style={{ padding: "12px" }}>Amount</th>
                <th style={{ padding: "12px" }}>Date</th>
                <th style={{ padding: "12px" }}>View</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  style={{
                    borderBottom: "1px solid #eee",
                    textAlign: "center",
                  }}
                >
                  <td style={{ padding: "10px", fontWeight: 600 }}>
                    {o.unique_code}
                  </td>

                  <td style={{ padding: "10px" }}>
                    {o.user_name}
                    <br />
                    <small style={{ color: "#666" }}>
                      {o.user_contact}
                    </small>
                  </td>

                  <td style={{ padding: "10px" }}>
                    ₹ {Number(o.final_amount).toFixed(2)}
                  </td>

                  <td style={{ padding: "10px" }}>
                    {new Date(o.created_at).toLocaleString()}
                  </td>

                  <td>
                    <button
                      onClick={() => openOrderModal(o)}
                      style={{
                        padding: "6px 12px",
                        background: "#4b2e2a",
                        color: "white",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: "20px", color: "#999" }}>
                    No completed orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL — SAME STYLE AS DASHBOARD */}
        {modalOpen && activeOrder && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "700px",
                background: "#fff",
                borderRadius: "14px",
                padding: "20px",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", color: "#777" }}>
                    Order Code
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 700 }}>
                    {activeOrder.unique_code}
                  </div>
                  <div
                    style={{ fontSize: "12px", marginTop: "4px", color: "#666" }}
                  >
                    User: {activeOrder.user_name} ({activeOrder.user_contact})
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                Placed on{" "}
                {new Date(activeOrder.created_at).toLocaleString()}
              </div>

              {/* Items */}
              {modalLoading ? (
                <p>Loading...</p>
              ) : (
                <div style={{ marginTop: "16px" }}>
                  {activeItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        borderBottom: "1px solid #eee",
                        paddingBottom: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "10px" }}>
                        <img
                          src={
                            item.product_img ||
                            "https://via.placeholder.com/80"
                          }
                          style={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        />

                        <div>
                          <div
                            style={{ fontSize: "15px", fontWeight: 600 }}
                          >
                            {item.product_name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            Qty: {item.quantity}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            Price: ₹ {item.unit_price} × {item.quantity}
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              marginTop: "4px",
                            }}
                          >
                            Line total: ₹ {item.total_price}
                          </div>
                        </div>
                      </div>

                      {item.addons && item.addons.length > 0 && (
                        <div
                          style={{
                            marginLeft: "80px",
                            marginTop: "6px",
                            fontSize: "12px",
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>Add-ons:</div>
                          {item.addons.map((ad) => (
                            <div key={ad.id}>
                              {ad.name} (+₹ {ad.price})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div
                style={{
                  marginTop: "10px",
                  borderTop: "1px solid #eee",
                  paddingTop: "10px",
                  fontSize: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>Subtotal</span>
                  <span>₹ {activeOrder.amount}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>GST</span>
                  <span>₹ {activeOrder.gst_amount}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 700,
                    marginTop: "6px",
                  }}
                >
                  <span>Total</span>
                  <span>₹ {activeOrder.final_amount}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
