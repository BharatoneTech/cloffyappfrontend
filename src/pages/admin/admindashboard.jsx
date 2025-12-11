// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import AdmnSidebar from "../../components/admin/admnsidebar.jsx";
import {
  fetchAllOrdersAdmin,
  fetchOrderWithItems,
  updateOrderStatusAdmin,
} from "../../api/user/orders"; // reusing same API file

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeItems, setActiveItems] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [statusValue, setStatusValue] = useState("PLACED");
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAllOrdersAdmin();
        const raw = res.data;

        const data = Array.isArray(raw)
          ? raw
          : raw.orders || raw.data || [];
        setOrders(data);
      } catch (err) {
        console.error("Admin orders load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openOrderModal = async (order) => {
    try {
      setModalLoading(true);
      setModalOpen(true);
      setActiveOrder(order);
      setStatusValue(order.status || "PLACED");

      const res = await fetchOrderWithItems(order.id);
      setActiveOrder(res.data.order);
      setActiveItems(res.data.items || []);
    } catch (err) {
      console.error("Admin order detail error:", err);
      alert("Failed to load order details");
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const closeOrderModal = () => {
    setModalOpen(false);
    setActiveOrder(null);
    setActiveItems([]);
    setStatusValue("PLACED");
  };

  const handleStatusUpdate = async () => {
    if (!activeOrder) return;
    try {
      setStatusSaving(true);
      await updateOrderStatusAdmin(activeOrder.id, statusValue);

      // update local list
      setOrders((prev) =>
        prev.map((o) =>
          o.id === activeOrder.id ? { ...o, status: statusValue } : o
        )
      );
      // update modal
      setActiveOrder((prev) =>
        prev ? { ...prev, status: statusValue } : prev
      );
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status");
    } finally {
      setStatusSaving(false);
    }
  };

  const niceStatus = (status) => {
    if (!status) return "";
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar - 30% width */}
      <AdmnSidebar />

      {/* Main dashboard area - 70% */}
      <div
        style={{
          marginLeft: "30%",
          width: "70%",
          minHeight: "100vh",
          padding: "40px",
          background: "#f5f7fa",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          Admin Dashboard
        </h1>

        <p style={{ fontSize: "18px", color: "#555", marginBottom: "20px" }}>
          View and manage all customer orders.
        </p>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
              padding: "16px",
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <th style={{ padding: "8px" }}>Order Code</th>
                  <th style={{ padding: "8px" }}>User</th>
                  <th style={{ padding: "8px" }}>Amount</th>
                  <th style={{ padding: "8px" }}>Status</th>
                  <th style={{ padding: "8px" }}>Created</th>
                  <th style={{ padding: "8px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <td style={{ padding: "8px", fontWeight: 600 }}>
                      {o.unique_code || `#${o.id}`}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {o.user_name || "N/A"}
                      <br />
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        {o.user_email}
                      </span>
                    </td>
                    <td style={{ padding: "8px" }}>
                      ₹ {Number(o.final_amount || o.amount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          background:
                            o.status === "COMPLETED"
                              ? "#dcfce7"
                              : o.status === "PROCESSING"
                              ? "#ffedd5"
                              : o.status === "CANCELLED"
                              ? "#fee2e2"
                              : "#e0f2fe",
                          color:
                            o.status === "COMPLETED"
                              ? "#15803d"
                              : o.status === "PROCESSING"
                              ? "#c2410c"
                              : o.status === "CANCELLED"
                              ? "#b91c1c"
                              : "#0369a1",
                        }}
                      >
                        {niceStatus(o.status)}
                      </span>
                    </td>
                    <td style={{ padding: "8px", fontSize: "12px" }}>
                      {o.created_at
                        ? new Date(o.created_at).toLocaleString()
                        : "-"}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <button
                        onClick={() => openOrderModal(o)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "999px",
                          border: "none",
                          background: "#4b2e2a",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        View / Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL */}
        {modalOpen && activeOrder && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              padding: "16px",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "700px",
                background: "#fff",
                borderRadius: "14px",
                padding: "18px",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: 2,
                    }}
                  >
                    Order Code
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 700 }}>
                    {activeOrder.unique_code || `#${activeOrder.id}`}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginTop: "2px",
                    }}
                  >
                    User: {activeOrder.user_name || "N/A"} (
                    {activeOrder.user_email})
                  </div>
                </div>

                <button
                  onClick={closeOrderModal}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "8px",
                }}
              >
                Placed on{" "}
                {activeOrder.created_at
                  ? new Date(activeOrder.created_at).toLocaleString()
                  : "-"}
              </div>

              {/* Status select */}
              <div
                style={{
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 600 }}>
                  Status:
                </span>
                <select
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    outline: "none",
                  }}
                >
                  <option value="PLACED">PLACED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>

                <button
                  onClick={handleStatusUpdate}
                  disabled={statusSaving}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "999px",
                    border: "none",
                    background: "#4b2e2a",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "13px",
                    opacity: statusSaving ? 0.7 : 1,
                  }}
                >
                  {statusSaving ? "Saving..." : "Update"}
                </button>
              </div>

              {modalLoading ? (
                <p>Loading items...</p>
              ) : activeItems.length === 0 ? (
                <p>No items found in this order.</p>
              ) : (
                <div
                  style={{
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: "8px",
                    marginTop: "8px",
                  }}
                >
                  {activeItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        paddingBottom: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                        }}
                      >
                        <img
                          src={
                            item.product_img ||
                            "https://via.placeholder.com/80x80?text=Item"
                          }
                          alt={item.product_name}
                          style={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              marginBottom: "2px",
                            }}
                          >
                            {item.product_name}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginBottom: "4px",
                            }}
                          >
                            Qty: {item.quantity}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                            }}
                          >
                            Price: ₹ {Number(item.unit_price).toFixed(2)} x{" "}
                            {item.quantity}
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              marginTop: "4px",
                            }}
                          >
                            Line total: ₹{" "}
                            {Number(item.total_price).toFixed(2)}
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
                          <div
                            style={{
                              fontWeight: 600,
                              marginBottom: "3px",
                            }}
                          >
                            Add-ons:
                          </div>
                          {item.addons.map((ad) => (
                            <div key={ad.id}>
                              {ad.name} (+₹
                              {Number(ad.price || 0).toFixed(2)})
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
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: "8px",
                  fontSize: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <span>Amount</span>
                  <span>
                    ₹ {Number(activeOrder.amount || 0).toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <span>GST</span>
                  <span>
                    ₹ {Number(activeOrder.gst_amount || 0).toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 700,
                  }}
                >
                  <span>Total</span>
                  <span>
                    ₹ {Number(activeOrder.final_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
