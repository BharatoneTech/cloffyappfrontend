// src/pages/user/OrderHistoryPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyOrders } from "../../api/user/orders";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetchMyOrders();
        const data = res.data;

        const list =
          Array.isArray(data.orders) ? data.orders :
          Array.isArray(data.data) ? data.data :
          [];

        setOrders(list);
      } catch (err) {
        console.error("Error loading orders:", err);
        setErrorMsg("Failed to load your orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const formatDateTime = (val) => {
    try {
      const d = new Date(val);
      return d.toLocaleString();
    } catch {
      return val || "";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        padding: "16px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
          gap: "8px",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, fontSize: "22px" }}>Order History</h2>
      </div>

      {loading ? (
        <p style={{ fontSize: "16px", color: "#555" }}>
          Loading your orders...
        </p>
      ) : errorMsg ? (
        <p style={{ fontSize: "16px", color: "red" }}>{errorMsg}</p>
      ) : orders.length === 0 ? (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <p
            style={{
              fontSize: "16px",
              color: "#555",
              marginBottom: "10px",
            }}
          >
            You don't have any past orders yet.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 18px",
              borderRadius: "999px",
              border: "none",
              background: "#401A13",
              color: "#ffffff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Browse items
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {orders.map((order) => {
            const items = order.items || [];
            const firstItem = items[0];

            const moreCount = items.length > 1 ? items.length - 1 : 0;

            const amount = Number(order.final_amount || 0).toFixed(2);

            return (
              <div
                key={order.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "12px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                {/* Order ID + Amount + Status */}
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
                        fontSize: "13px",
                        color: "#6b7280",
                        marginBottom: "2px",
                      }}
                    >
                      Order ID: <strong>#{order.id}</strong>
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        marginBottom: "2px",
                      }}
                    >
                      Amount: ₹ {amount}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {formatDateTime(order.created_at)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      background:
                        order.status === "PAID" || order.status === "SUCCESS"
                          ? "#dcfce7"
                          : order.status === "PENDING"
                          ? "#fef3c7"
                          : "#fee2e2",
                      color:
                        order.status === "PAID" || order.status === "SUCCESS"
                          ? "#166534"
                          : order.status === "PENDING"
                          ? "#92400e"
                          : "#991b1b",
                      fontWeight: 600,
                    }}
                  >
                    {order.status}
                  </div>
                </div>

                {/* Main item preview */}
                {firstItem && (
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: moreCount > 0 ? "4px" : "0",
                    }}
                  >
                    <img
                      src={
                        firstItem.product_img ||
                        firstItem.product?.product_img ||
                        "https://via.placeholder.com/70"
                      }
                      alt={
                        firstItem.product_name ||
                        firstItem.product?.product_name ||
                        "Item"
                      }
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "10px",
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
                        {(firstItem.product_name ||
                          firstItem.product?.product_name ||
                          "Item") +
                          " × " +
                          (firstItem.quantity || 1)}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginBottom: "2px",
                        }}
                      >
                        {firstItem.tagline ||
                          firstItem.product?.tagline ||
                          "Delicious item"}
                      </div>
                      {firstItem.addons && firstItem.addons.length > 0 && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#4b5563",
                            marginTop: "2px",
                          }}
                        >
                          Add-ons:{" "}
                          {firstItem.addons
                            .map(
                              (a) =>
                                `${a.ingredients} (+₹${Number(
                                  a.price || 0
                                ).toFixed(2)})`
                            )
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {moreCount > 0 && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginTop: "4px",
                    }}
                  >
                    + {moreCount} more item{moreCount > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
