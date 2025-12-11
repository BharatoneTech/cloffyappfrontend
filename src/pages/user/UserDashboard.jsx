// src/pages/user/UserDashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import confetti from "canvas-confetti"; // ⭐ for celebration

axios.defaults.headers.common["Authorization"] =
  `Bearer ${localStorage.getItem("token")}`;

import { AuthContext } from "../../context/AuthContext.jsx";
import { CartContext } from "../../context/CartContext.jsx";
import { fetchProducts } from "../../api/user/products";
import { fetchCategories } from "../../api/user/categories";
import { fetchAdditionalIngredients } from "../../api/user/additionalIngredients";
import {
  fetchMyOrders,
  fetchOrderWithItems,
} from "../../api/user/orders";
import ProfileIcon from "../../components/ProfileIcon.jsx";
import ProfileMenu from "../../components/ProfileMenu.jsx";
import CategoryCircle from "../../components/CategoryCircle.jsx";
import { fetchUserStars, fetchUserRewards } from "../../api/user/stars";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { addToCart, items: cartItems, updateQuantity } =
    useContext(CartContext);

  // IMAGE PATHS
  const heroImage = "/images/hero.png";
  const bowlImg = "/images/bowl.png";
  const goldImg = "/images/gold.png";

  // STATE
  const [showMenu, setShowMenu] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [latestOrder, setLatestOrder] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addonsByProduct, setAddonsByProduct] = useState({});
  const [addonsByCategory, setAddonsByCategory] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});
  const [loading, setLoading] = useState(true);
  const [userStars, setUserStars] = useState(0);
  const [userRewards, setUserRewards] = useState(0);
  const LAST_STARS_KEY = "last_seen_stars";

  // ⭐ order detail modal
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderModalLoading, setOrderModalLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeOrderItems, setActiveOrderItems] = useState([]);

  // ⭐ Animation states
  const [showStarPopup, setShowStarPopup] = useState(false);
  const prevStarsRef = React.useRef(0);
  const [animatedStars, setAnimatedStars] = useState(0);

  // ⭐ Must be above effects
  const isLoggedIn =
    !!localStorage.getItem("token") && !!localStorage.getItem("user");

  const isTrue = (v) => v === 1 || v === "1" || v === true || v === "true";

  const isBowlMember = isTrue(user?.bowl_membership);
  const isGoldenMember = isTrue(user?.golden_membership);

  // ⭐ Animate number smoothly
  const animateNumber = (from, to, setter) => {
    let start = from;
    const step = (to - from) / 20;

    const timer = setInterval(() => {
      start += step;
      if ((step > 0 && start >= to) || (step < 0 && start <= to)) {
        start = to;
        clearInterval(timer);
      }
      setter(Math.round(start));
    }, 40);
  };

  // ⭐ FETCH STARS + REWARDS (with localStorage memory)
  useEffect(() => {
    if (!isLoggedIn) return;

    fetchUserStars()
      .then((res) => {
        const stars = res.data.stars ?? 0;

        const lastSeen = Number(localStorage.getItem(LAST_STARS_KEY) || 0);

        // Show popup only when stars increased AFTER last visit
        if (stars > lastSeen) {
          setShowStarPopup(true);
          setTimeout(() => setShowStarPopup(false), 2000);

          confetti({
            particleCount: 70,
            spread: 90,
            origin: { y: 0.6 },
          });
        }

        // Animate counter
        animateNumber(lastSeen, stars, setAnimatedStars);

        localStorage.setItem(LAST_STARS_KEY, stars);

        prevStarsRef.current = stars;
        setUserStars(stars);
      })
      .catch(() => setUserStars(0));

    fetchUserRewards()
      .then((res) => setUserRewards(res.data.rewards?.length ?? 0))
      .catch(() => setUserRewards(0));
  }, [isLoggedIn, latestOrder]);

  /* LOAD EVERYTHING (products, categories, addons) */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, catRes, addonRes] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchAdditionalIngredients(),
        ]);

        const prodData = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data?.data || [];

        const catData = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data?.data || [];

        setProducts(prodData);
        setCategories(catData);

        const addonRaw = addonRes.data;
        const addons =
          Array.isArray(addonRaw) ||
          Array.isArray(addonRaw?.data) ||
          Array.isArray(addonRaw?.additional_ingredients)
            ? addonRaw.data ||
              addonRaw.additional_ingredients ||
              addonRaw
            : [];

        const byProduct = {};
        const byCategory = {};

        addons.forEach((a) => {
          if (a.product_id != null) {
            if (!byProduct[a.product_id]) byProduct[a.product_id] = [];
            byProduct[a.product_id].push(a);
          }
          if (a.category_id != null) {
            if (!byCategory[a.category_id]) byCategory[a.category_id] = [];
            byCategory[a.category_id].push(a);
          }
        });

        setAddonsByProduct(byProduct);
        setAddonsByCategory(byCategory);
      } catch (e) {
        console.error("ERROR loading dashboard:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* LOAD USER ORDERS */
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadOrders = async () => {
      try {
        const res = await fetchMyOrders();
        const raw = res.data;

        const orders = Array.isArray(raw)
          ? raw
          : raw?.orders || raw?.data || [];

        setUserOrders(orders);

        if (orders.length > 0) {
          setLatestOrder(orders[0]);
        }
      } catch (e) {
        console.error("Order fetch error:", e);
      }
    };

    loadOrders();
  }, [isLoggedIn]);

  // 👉 only not completed & not cancelled
  const ongoingOrders = userOrders.filter(
    (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED"
  );

  /* PRICE LOGIC */
  const getEffectivePrice = (p) => {
    if (p.final_price != null) return Number(p.final_price);
    const selling = Number(p.selling_price || p.net_price || 0);
    const bowlPrice = Number(p.bowlmem_sellingprice || 0);
    const goldenPrice = Number(p.goldenmem_sellingprice || 0);

    if (isGoldenMember && goldenPrice > 0) return goldenPrice;
    if (isBowlMember && bowlPrice > 0) return bowlPrice;
    return selling;
  };

  /* SEARCH FILTER */
  const isSearching = searchTerm.trim() !== "";
  const searchLower = searchTerm.toLowerCase().trim();

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategoryId === "all" ||
      Number(p.category_id) === Number(selectedCategoryId);

    const matchSearch =
      searchLower === "" ||
      p.product_name?.toLowerCase().includes(searchLower);

    return matchCategory && matchSearch;
  });

  /* ADDONS CHECKBOX */
  const toggleAddon = (productId, addonId) => {
    setSelectedAddons((prev) => {
      const existing = prev[productId] || [];
      if (existing.includes(addonId)) {
        return {
          ...prev,
          [productId]: existing.filter((x) => x !== addonId),
        };
      }
      return { ...prev, [productId]: [...existing, addonId] };
    });
  };

  /* CART LOGIC */
  const getQty = (id) =>
    cartItems.find((i) => i.product.id === id)?.qty || 0;

  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const price = getEffectivePrice(product);
    addToCart({
      ...product,
      final_price: price,
      selectedAddons: selectedAddons[product.id] || [],
    });
  };

  const cartCount = cartItems.reduce((a, b) => a + b.qty, 0);

  /* ORDER MODAL OPEN */
  const openOrderModal = async (order) => {
    try {
      setOrderModalLoading(true);
      setActiveOrder(order);
      setOrderModalOpen(true);

      const res = await fetchOrderWithItems(order.id);
      setActiveOrder(res.data.order);
      setActiveOrderItems(res.data.items || []);
    } catch (err) {
      console.error("Failed to load order details:", err);
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

  /* PRODUCT CARD */
  const renderProductCard = (p) => {
    const qty = getQty(p.id);
    const price = getEffectivePrice(p);
    const addons =
      addonsByProduct[p.id] || addonsByCategory[p.category_id] || [];

    return (
      <div
        key={p.id}
        style={{
          background: "#fff",
          padding: "10px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <img
          src={p.product_img}
          alt={p.product_name}
          style={{
            width: "100%",
            height: "140px",
            borderRadius: "10px",
            objectFit: "cover",
          }}
        />

        <h3 style={{ fontSize: "15px", fontWeight: 600 }}>
          {p.product_name}
        </h3>

        <p style={{ fontSize: "12px", color: "#666" }}>
          {p.tagline || "Fresh & tasty"}
        </p>

        <p style={{ fontSize: "16px", fontWeight: 700 }}>₹ {price}</p>

        {/* ADDONS */}
        {addons.length > 0 && (
          <div style={{ marginBottom: "8px" }}>
            <p style={{ fontSize: "12px", marginBottom: "4px" }}>
              Additional Ingredients
            </p>
            {addons.map((addon) => (
              <label
                key={addon.id}
                style={{
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    (selectedAddons[p.id] || []).includes(addon.id)
                  }
                  onChange={() => toggleAddon(p.id, addon.id)}
                />
                {addon.ingredients} (+₹{addon.price})
              </label>
            ))}
          </div>
        )}

        {/* CART BUTTON */}
        {qty === 0 ? (
          <button
            onClick={() => handleAddToCart(p)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "999px",
              background: "#401A13",
              color: "#fff",
              border: "none",
              fontWeight: 600,
            }}
          >
            Add to Cart
          </button>
        ) : (
          <div
            style={{
              marginTop: "6px",
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 10px",
              borderRadius: "999px",
              background: "#eee",
            }}
          >
            <button
              onClick={() =>
                !isLoggedIn
                  ? navigate("/login")
                  : updateQuantity(p.id, qty - 1)
              }
              style={{
                border: "none",
                background: "#ddd",
                padding: "4px 10px",
                borderRadius: "999px",
              }}
            >
              -
            </button>

            <strong>{qty}</strong>

            <button
              onClick={() =>
                !isLoggedIn
                  ? navigate("/login")
                  : updateQuantity(p.id, qty + 1)
              }
              style={{
                border: "none",
                background: "#ddd",
                padding: "4px 10px",
                borderRadius: "999px",
              }}
            >
              +
            </button>
          </div>
        )}
      </div>
    );
  };

  const niceStatus = (status) => {
    if (!status) return "";
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        paddingBottom: "90px",
        overflowX: "hidden",
      }}
    >
      {/* ⭐ STAR POPUP */}
      {showStarPopup && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#ffdd57",
            color: "#000",
            padding: "12px 20px",
            borderRadius: "999px",
            fontWeight: "bold",
            zIndex: 99999,
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            animation: "fadeInOut 2s ease",
          }}
        >
          ⭐ You earned a star!
        </div>
      )}

      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
            15% { opacity: 1; transform: translateX(-50%) translateY(0); }
            85% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          }

          input::placeholder {
            color: #888 !important;
            opacity: 1;
          }
        `}
      </style>

      {/* HERO */}
      <div
        style={{
          width: "100%",
          height: "220px",
          backgroundImage: `url('${heroImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "0 0 22px 22px",
          padding: "16px",
          color: "#fff",
          position: "relative",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
          }}
        />

        <div style={{ position: "relative", zIndex: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                flex: 1,
                background: "#fff",
                borderRadius: "999px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                marginRight: "12px",
              }}
            >
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search 'items'"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  marginLeft: "8px",
                  flex: 1,
                  fontSize: "14px",
                  color: "#000",
                  background: "transparent",
                }}
              />
            </div>

            <ProfileIcon user={user} onClick={() => setShowMenu(!showMenu)} />
          </div>

          <h3 style={{ margin: 0, fontSize: "18px" }}>
            {user?.name ? `Hi ${user.name}` : "Welcome"}
          </h3>

          <p style={{ margin: 0, fontSize: "12px" }}>
            {isLoggedIn
              ? isGoldenMember
                ? "Golden Member"
                : isBowlMember
                ? "Bowl Member"
                : "Normal User"
              : ""}
          </p>

          {/* ⭐ STARS BOX */}
          {isLoggedIn && !isSearching && (
            <div
              style={{
                marginTop: "60px",
                background: "rgba(255,255,255,0.85)",
                padding: "10px",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#000",
              }}
            >
              <div>✨ Stars: {animatedStars}/10</div>
              <div>🎁 Rewards: {userRewards}</div>
              <div>{10 - animatedStars} stars away</div>
            </div>
          )}
        </div>
      </div>

      {/* PROFILE MENU */}
      {showMenu && (
        <div
          style={{
            position: "fixed",
            top: "85px",
            right: "20px",
            zIndex: 9999,
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            width: "180px",
            padding: "10px 0",
          }}
        >
          <ProfileMenu
            onClose={() => setShowMenu(false)}
            onHistory={() => {
              setShowMenu(false);
              navigate("/user/orders");
            }}
            onRewards={() => {
              setShowMenu(false);
              navigate("/user/rewards");
            }}
            onLogout={() => {
              logout();
              navigate("/login");
            }}
          />
        </div>
      )}

      {/* 🟢 ACTIVE ORDERS STRIP (only if not completed) */}
      {!isSearching && isLoggedIn && ongoingOrders.length > 0 && (
        <div
          style={{
            margin: "0 16px 12px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "6px",
            }}
          >
            Your active orders
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              paddingBottom: "4px",
            }}
          >
            {ongoingOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => openOrderModal(order)}
                style={{
                  minWidth: "180px",
                  padding: "10px",
                  borderRadius: "10px",
                  background: "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  cursor: "pointer",
                  border:
                    order.id === latestOrder?.id
                      ? "1px solid #4b2e2a"
                      : "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginBottom: "2px",
                  }}
                >
                  Order Code
                </div>
                <div style={{ fontWeight: 700, fontSize: "13px" }}>
                  {order.unique_code || `#${order.id}`}
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "11px",
                    color: "#6b7280",
                  }}
                >
                  Status
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color:
                      order.status === "COMPLETED"
                        ? "#16a34a"
                        : order.status === "PROCESSING"
                        ? "#f97316"
                        : "#0ea5e9",
                  }}
                >
                  {niceStatus(order.status)}
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "11px",
                    color: "#6b7280",
                  }}
                >
                  Amount
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>
                  ₹ {Number(order.final_amount || order.amount || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBSCRIPTIONS */}
      {!isSearching && isLoggedIn && !isGoldenMember && (
        <div
          style={{
            margin: "0 16px 16px",
            display: "flex",
            gap: "12px",
          }}
        >
          {!isBowlMember && (
            <div
              onClick={() => navigate("/user/subscribe/bowl")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "12px",
                background: "#ffe4e6",
                display: "flex",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <img src={bowlImg} style={{ width: "40px", height: "40px" }} />
              <div>
                <strong style={{ fontSize: "13px" }}>
                  Bowl Subscription
                </strong>
                <p style={{ fontSize: "10px", margin: 0 }}>
                  Unlock bowl benefits
                </p>
              </div>
            </div>
          )}

          <div
            onClick={() => navigate("/user/subscribe/golden")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "12px",
              background: "#fef3c7",
              display: "flex",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <img src={goldImg} style={{ width: "40px", height: "40px" }} />
            <div>
              <strong style={{ fontSize: "13px" }}>Golden Membership</strong>
              <p style={{ fontSize: "10px", margin: 0 }}>
                Upgrade to premium perks
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES */}
      {!isSearching && (
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "14px",
            padding: "0 16px",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={() => setSelectedCategoryId("all")}
            style={{
              background:
                selectedCategoryId === "all" ? "#4b2e2a" : "#e5e7eb",
              color: selectedCategoryId === "all" ? "#fff" : "#333",
              padding: "10px 16px",
              borderRadius: "999px",
              border: "none",
              flexShrink: 0,
              fontWeight: 600,
            }}
          >
            All
          </button>

          {categories.map((cat) => (
            <CategoryCircle
              key={cat.id}
              category={cat}
              selected={Number(selectedCategoryId) === Number(cat.id)}
              onClick={() => setSelectedCategoryId(Number(cat.id))}
            />
          ))}
        </div>
      )}

      {/* PRODUCT LIST */}
      <div
        style={{
          padding: "0 16px",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
        }}
      >
        {loading ? (
          <p>Loading...</p>
        ) : filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          filteredProducts.map((p) => renderProductCard(p))
        )}
      </div>

      {/* BOTTOM BAR */}
      {!isSearching && isLoggedIn && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#fff",
            borderTop: "1px solid #eee",
            padding: "10px 20px",
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            onClick={() => navigate("/user/checkout")}
            style={{
              flex: 1,
              background: "#401A13",
              color: "#fff",
              padding: "10px",
              borderRadius: "999px",
              border: "none",
              fontWeight: 700,
            }}
          >
            🛒 Order Now ({cartCount})
          </button>

          <button
            onClick={() => navigate("/user/orders")}
            style={{
              flex: 1,
              background: "#e5e7eb",
              padding: "10px",
              borderRadius: "999px",
              border: "none",
              fontWeight: 600,
            }}
          >
            📜 History
          </button>
        </div>
      )}

      {/* 🧾 ORDER DETAIL MODAL */}
      {orderModalOpen && activeOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99998,
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "#fff",
              borderRadius: "14px",
              padding: "16px",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{ fontSize: "12px", color: "#6b7280", marginBottom: 2 }}
                >
                  Order Code
                </div>
                <div style={{ fontWeight: 700, fontSize: "15px" }}>
                  {activeOrder.unique_code || `#${activeOrder.id}`}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "2px",
                  }}
                >
                  Status:{" "}
                  <span
                    style={{
                      fontWeight: 600,
                      color:
                        activeOrder.status === "COMPLETED"
                          ? "#16a34a"
                          : activeOrder.status === "PROCESSING"
                          ? "#f97316"
                          : "#0ea5e9",
                    }}
                  >
                    {niceStatus(activeOrder.status)}
                  </span>
                </div>
              </div>

              <button
                onClick={closeOrderModal}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginBottom: "6px",
              }}
            >
              Placed on{" "}
              {activeOrder.created_at
                ? new Date(activeOrder.created_at).toLocaleString()
                : "-"}
            </div>

            {orderModalLoading ? (
              <p>Loading items...</p>
            ) : activeOrderItems.length === 0 ? (
              <p>No items found in this order.</p>
            ) : (
              <div>
                {activeOrderItems.map((item) => (
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
                          marginTop: "6px",
                          marginLeft: "80px",
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
                            {ad.name} (+₹{Number(ad.price).toFixed(2)})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

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
  );
}
