// src/pages/user/CheckoutPage.jsx
import React, {
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import { fetchAdditionalIngredients } from "../../api/user/additionalIngredients";
import { placeOrder } from "../../api/user/orders";

export default function CheckoutPage() {
  const { items, updateQuantity, removeFromCart, clearCart } =
    useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const isTrue = (v) =>
    v === 1 || v === "1" || v === true || v === "true";

  // membership flags
  const isBowlMember = isTrue(user?.bowl_membership);
  const isGoldenMember = isTrue(user?.golden_membership);

  const [addonsByProduct, setAddonsByProduct] = useState({});
  const [addonsByCategory, setAddonsByCategory] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});

  // helper: effective price based on membership/cart
  const getEffectivePrice = (product) => {
    // ✅ If product already has final_price → use that
    if (product.final_price != null)
      return Number(product.final_price);

    const baseSellingPrice = Number(product.selling_price || 0);
    const netPrice = Number(product.net_price || baseSellingPrice);

    const bowlPrice =
      product.bowlmem_sellingprice &&
      Number(product.bowlmem_sellingprice) > 0
        ? Number(product.bowlmem_sellingprice)
        : null;

    const goldenPrice =
      product.goldenmem_sellingprice &&
      Number(product.goldenmem_sellingprice) > 0
        ? Number(product.goldenmem_sellingprice)
        : null;

    if (isGoldenMember && goldenPrice) return goldenPrice;
    if (isBowlMember && bowlPrice) return bowlPrice;
    return netPrice;
  };

  // Load all additional ingredients once from DB
  useEffect(() => {
    const loadAddons = async () => {
      try {
        const res = await fetchAdditionalIngredients();
        const raw = res.data;

        let data = [];
        if (Array.isArray(raw)) data = raw;
        else if (Array.isArray(raw.additional_ingredients))
          data = raw.additional_ingredients;
        else if (Array.isArray(raw.additionalIngredients))
          data = raw.additionalIngredients;
        else if (Array.isArray(raw.data)) data = raw.data;

        const byProduct = {};
        const byCategory = {};

        data.forEach((addon) => {
          const pid = addon.product_id;
          const cid = addon.category_id;

          if (pid != null) {
            if (!byProduct[pid]) byProduct[pid] = [];
            byProduct[pid].push(addon);
          }

          if (cid != null) {
            if (!byCategory[cid]) byCategory[cid] = [];
            byCategory[cid].push(addon);
          }
        });

        setAddonsByProduct(byProduct);
        setAddonsByCategory(byCategory);
      } catch (err) {
        console.error("Error loading additional ingredients:", err);
      }
    };

    loadAddons();
  }, []);

  // 🔁 Seed selectedAddons from cart (addons chosen in dashboard)
useEffect(() => {
  const initial = {};
  items.forEach((item) => {
    const product = item.product;
    const productId = product.id ?? product.product_id;

    if (
      Array.isArray(product.selectedAddons) &&
      product.selectedAddons.length > 0
    ) {
      initial[productId] = product.selectedAddons;
    }
  });

  if (Object.keys(initial).length > 0) {
    setSelectedAddons((prev) => ({ ...prev, ...initial }));
  }
}, [items]);


  const toggleAddon = (productId, addonId) => {
    setSelectedAddons((prev) => {
      const current = prev[productId] || [];
      const exists = current.includes(addonId);

      const nextList = exists
        ? current.filter((id) => id !== addonId)
        : [...current, addonId];

      return {
        ...prev,
        [productId]: nextList,
      };
    });
  };

  // Totals: base items + selected addons
  const totals = useMemo(() => {
    const baseSubtotal = items.reduce((sum, item) => {
      const price = getEffectivePrice(item.product);
      return sum + price * item.qty;
    }, 0);

    const addonsSubtotal = items.reduce((sum, item) => {
      const productId = item.product.id ?? item.product.product_id;
      const categoryId = item.product.category_id;
      const selected = selectedAddons[productId] || [];

      const addonsList =
        addonsByProduct[productId] || addonsByCategory[categoryId] || [];

      const extraForThisProduct = selected.reduce((sub, addonId) => {
        const addon = addonsList.find((a) => a.id === addonId);
        if (!addon) return sub;
        const price = Number(addon.price || 0);
        return sub + price * item.qty;
      }, 0);

      return sum + extraForThisProduct;
    }, 0);

    const subtotal = baseSubtotal + addonsSubtotal;
    const gst = Math.round(subtotal * 0.05); // 5%
    const total = subtotal + gst;

    return { subtotal, gst, total };
  }, [
    items,
    selectedAddons,
    addonsByProduct,
    addonsByCategory,
    isBowlMember,
    isGoldenMember,
  ]);

  // if (items.length === 0) {
  //   return (
  //     <div
  //       style={{
  //         minHeight: "100vh",
  //         background: "#f5f7fa",
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         flexDirection: "column",
  //         padding: "20px",
  //       }}
  //     >
  //       <h2 style={{ marginBottom: "10px" }}>Your cart is empty</h2>
  //       <button
  //         onClick={() => navigate("/")}
  //         style={{
  //           padding: "10px 18px",
  //           borderRadius: "999px",
  //           border: "none",
  //           background: "#4f46e5",
  //           color: "white",
  //           fontWeight: "600",
  //           cursor: "pointer",
  //         }}
  //       >
  //         Go to Dashboard
  //       </button>
  //     </div>
  //   );
  // }

  
  const handleDecrease = (productId, currentQty) => {
    if (currentQty <= 1) {
      removeFromCart(productId);
    navigate("/user/dashboard", { replace: true });
    } else {
      updateQuantity(productId, currentQty - 1);
    }
  };

  const handleIncrease = (productId, currentQty) => {
    updateQuantity(productId, currentQty + 1);
  };

  const handlePlaceOrder = async () => {
    try {
      const orderItems = items.map((item) => {
        const { product, qty } = item;
        const productId = product.id ?? product.product_id;
        const categoryId = product.category_id;

        const basePrice = getEffectivePrice(product);

        const addonsList =
          addonsByProduct[productId] ||
          addonsByCategory[categoryId] ||
          [];

        const selected = selectedAddons[productId] || [];

        const addonsPayload = selected
          .map((addonId) => {
            const addon = addonsList.find((a) => a.id === addonId);
            if (!addon) return null;
            return {
              ingredient_id: addon.id,
              price: Number(addon.price || 0),
            };
          })
          .filter(Boolean);

        return {
          product_id: productId,
          quantity: qty,
          unit_price: basePrice,
          addons: addonsPayload,
        };
      });

      const payload = {
        amount: totals.subtotal,
        gst_amount: totals.gst,
        final_amount: totals.total,
        transactionId: `TXN-${Date.now()}`,
        items: orderItems,
      };

      console.log("👉 Sending order payload:", payload);

      const res = await placeOrder(payload);
      console.log("✅ Order placed response:", res.data);

      alert("Order placed successfully!");
      clearCart();
      navigate("/user/orders");
    } catch (err) {
      console.error(
        "Failed to place order:",
        err.response?.data || err.message
      );
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          JSON.stringify(err.response?.data || {}) ||
          "Failed to place order. Please try again."
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.12)",
          padding: "20px",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <button
         onClick={() => navigate("/user/dashboard")}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ← Back
          </button>
          <h2 style={{ margin: 0, fontSize: "22px" }}>Checkout</h2>
        </div>

        {/* Items List */}
        <div
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            marginBottom: "16px",
          }}
        >
          {items.map((item) => {
            const { product, qty } = item;

            const productId = product.id ?? product.product_id;
            const categoryId = product.category_id;

            const price = getEffectivePrice(product);
            const baseLineTotal = price * qty;

            const addons =
              addonsByProduct[productId] ||
              addonsByCategory[categoryId] ||
              [];
            const selected = selectedAddons[productId] || [];

            const addonsExtra = selected.reduce((sub, addonId) => {
              const addon = addons.find((a) => a.id === addonId);
              if (!addon) return sub;
              const addonPrice = Number(addon.price || 0);
              return sub + addonPrice * qty;
            }, 0);

            const lineTotal = baseLineTotal + addonsExtra;

            const baseSellingPrice = Number(product.selling_price || 0);
            const netPrice = Number(
              product.net_price || baseSellingPrice
            );
            const bowlPrice =
              product.bowlmem_sellingprice &&
              Number(product.bowlmem_sellingprice) > 0
                ? Number(product.bowlmem_sellingprice)
                : null;
            const goldenPrice =
              product.goldenmem_sellingprice &&
              Number(product.goldenmem_sellingprice) > 0
                ? Number(product.goldenmem_sellingprice)
                : null;

            return (
              <div
                key={productId}
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "12px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    marginBottom: "8px",
                  }}
                >
                  <img
                    src={
                      product.product_img ||
                      "https://via.placeholder.com/100"
                    }
                    alt={product.product_name}
                    style={{
                      width: "90px",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "18px",
                      }}
                    >
                      {product.product_name}
                    </h3>
                    <p
                      style={{
                        margin: "0 0 6px 0",
                        color: "#777",
                        fontSize: "13px",
                      }}
                    >
                      {product.tagline || "Fresh & tasty item"}
                    </p>

                    <p
                      style={{
                        margin: "0 0 2px 0",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      ₹ {price.toFixed(2)}
                    </p>

                    <p
                      style={{
                        margin: "0 0 2px 0",
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      Base Net Price: ₹ {netPrice.toFixed(2)}
                    </p>

                    {isBowlMember && bowlPrice && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "#2563eb",
                          fontWeight: 600,
                        }}
                      >
                        Bowl member price: ₹ {bowlPrice.toFixed(2)}
                      </p>
                    )}

                    {isGoldenMember && goldenPrice && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "#b45309",
                          fontWeight: 600,
                        }}
                      >
                        Golden member price: ₹{" "}
                        {goldenPrice.toFixed(2)}
                      </p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        marginTop: "6px",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: "999px",
                          border: "1px solid #d1d5db",
                          overflow: "hidden",
                        }}
                      >
                        <button
                          onClick={() =>
                            handleDecrease(productId, qty)
                          }
                          style={{
                            padding: "4px 10px",
                            border: "none",
                            background: "#e5e7eb",
                            cursor: "pointer",
                            fontSize: "18px",
                          }}
                        >
                          -
                        </button>
                        <span
                          style={{
                            padding: "4px 14px",
                            minWidth: "32px",
                            textAlign: "center",
                            fontWeight: "500",
                          }}
                        >
                          {qty}
                        </span>
                        <button
                          onClick={() =>
                            handleIncrease(productId, qty)
                          }
                          style={{
                            padding: "4px 10px",
                            border: "none",
                            background: "#e5e7eb",
                            cursor: "pointer",
                            fontSize: "18px",
                          }}
                        >
                          +
                        </button>
                      </div>

                      <div
                        style={{
                          fontWeight: "600",
                          fontSize: "15px",
                        }}
                      >
                        ₹ {lineTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {addons.length > 0 && (
                  <div
                    style={{
                      marginLeft: "106px",
                      marginTop: "6px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        marginBottom: "4px",
                      }}
                    >
                      Additional Ingredients
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px 16px",
                      }}
                    >
                      {addons.map((addon) => {
                        const checked = selected.includes(addon.id);
                        return (
                          <label
                            key={addon.id}
                            style={{
                              fontSize: "13px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleAddon(productId, addon.id)
                              }
                            />
                            <span>
                              {addon.ingredients} (+₹
                              {Number(addon.price || 0).toFixed(2)})
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bill Details */}
        <div
          style={{
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "16px",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ marginBottom: "10px", fontSize: "18px" }}>
            Bill Details
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span>Item Total</span>
            <span>₹ {totals.subtotal.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span>GST (5%)</span>
            <span>₹ {totals.gst.toFixed(2)}</span>
          </div>
        </div>

        {/* Total + Place Order Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              To Pay
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "700",
              }}
            >
              ₹ {totals.total.toFixed(2)}
            </div>
          </div>

          <button
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "999px",
              border: "none",
              background: "#22c55e",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
            onClick={handlePlaceOrder}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
