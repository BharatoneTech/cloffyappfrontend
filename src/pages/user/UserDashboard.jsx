// src/pages/user/UserDashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import confetti from "canvas-confetti";

axios.defaults.headers.common["Authorization"] =
  `Bearer ${localStorage.getItem("token")}`;

import { AuthContext } from "../../context/AuthContext.jsx";
import { CartContext } from "../../context/CartContext.jsx";
import { fetchProducts } from "../../api/user/products";
import { fetchCategories } from "../../api/user/categories";
import { fetchAdditionalIngredients } from "../../api/user/additionalIngredients";
import { FiSearch } from "react-icons/fi";

import {
  fetchMyOrders,
  fetchOrderWithItems,
} from "../../api/user/orders";
import ProfileIcon from "../../components/ProfileIcon.jsx";
import ProfileMenu from "../../components/ProfileMenu.jsx";
import CategoryCircle from "../../components/CategoryCircle.jsx";
import { fetchUserStars, fetchUserRewards } from "../../api/user/stars";
import BottomAddonsDrawer from "../../components/BottomAddonsDrawer.jsx";

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

  // Drawer states (NEW)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProduct, setDrawerProduct] = useState(null);
  const [drawerAddons, setDrawerAddons] = useState([]);
  const [drawerSelected, setDrawerSelected] = useState([]);

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
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [isSearchFixed, setIsSearchFixed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);



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
      setter(Math.round(start))
    }, 40);
  };
  useEffect(() => {
  const onScroll = () => {
    setIsScrolled(window.scrollY > 10);
  };

  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);


  useEffect(() => {
  const onScroll = () => {
    setIsSearchFixed(window.scrollY > 40);
  };

  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);

  //FUNCTION TO OPEN VIEW MODAL
  const openViewModal = (product) => {
    setViewProduct(product);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setViewProduct(null);
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

const filteredProducts = products
  .filter((p) => {
    const matchCategory =
      selectedCategoryId === "all" ||
      Number(p.category_id) === Number(selectedCategoryId);

    const matchSearch =
      searchLower === "" ||
      p.product_name?.toLowerCase().includes(searchLower);

    return matchCategory && matchSearch;
  })
  .sort((a, b) => {
    const aHasTagline = a.tagline && a.tagline.trim() !== "";
    const bHasTagline = b.tagline && b.tagline.trim() !== "";

    // Products WITH tagline come first
    if (aHasTagline && !bHasTagline) return -1;
    if (!aHasTagline && bHasTagline) return 1;
    return 0; // keep original order otherwise
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

  // Now opens drawer to pick addons before adding
  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const price = getEffectivePrice(product);
    const addons =
      addonsByProduct[product.id] || addonsByCategory[product.category_id] || [];

    // Open drawer with product and its addons
    setDrawerProduct(product);
    setDrawerAddons(addons);
    setDrawerSelected([]); // reset selections
    setDrawerOpen(true);
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

  /* Drawer addon toggle (NEW) */
  const toggleDrawerAddon = (addonId) => {
    setDrawerSelected((prev) =>
      prev.includes(addonId) ? prev.filter((x) => x !== addonId) : [...prev, addonId]
    );
  };

  /* Confirm add from drawer (NEW) */
  const confirmAddItem = () => {
    if (!drawerProduct) return;

    const price = getEffectivePrice(drawerProduct);

    addToCart({
      ...drawerProduct,
      final_price: price,
      selectedAddons: drawerSelected,
    });

    // close drawer
    setDrawerOpen(false);
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
{/* ⭐ PRODUCT DESCRIPTION ONLY MODAL */}
{viewModalOpen && viewProduct && (
<div
  style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.25)", // 👈 lighter transparency
    backdropFilter: "blur(2px)",      // 👈 soft blur
    WebkitBackdropFilter: "blur(2px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
    padding: "20px",
  }}
>

    <div
      style={{
        width: "100%",
        maxWidth: "360px",
        background: "#fff",
        padding: "16px",
        borderRadius: "14px",
        position: "relative",
      }}
    >
      {/* ❌ CLOSE BUTTON */}
      <button
        onClick={closeViewModal}
        style={{
          position: "absolute",
          top: "8px",
          right: "10px",
          background: "transparent",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        ✖
      </button>

      {/* 📄 ONLY DESCRIPTION TEXT */}
      <p
        style={{
          fontSize: "18px",        // 🔥 BIG TEXT
          lineHeight: "1.7",       // 🔥 READABLE
          color: "#333",
          maxHeight: "280px",      // 🔥 MODAL HEIGHT SAME
          overflowY: "auto",       // 🔥 SCROLL IF LONG
          whiteSpace: "pre-line", // 🔥 FULL TEXT FORMAT
          marginTop: "20px",
        }}
      >
        {viewProduct.info || "No description available."}
      </p>
    </div>
  </div>
)}


        {p.tagline && (
          <div
            style={{
              
              background: "#4b2e2aff",
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#e5e7eb",
              width: "fit-content",
              marginBottom: "6px",
            }}
          >
            {p.tagline}
          </div>
        )}

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

        <h3 style={{ fontSize: "15px", fontWeight: 600, marginTop: "6px" }}>
          {p.product_name}
        </h3>
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "6px",
    marginBottom: "6px",
  }}
>
  <span
    onClick={() => openViewModal(p)}
    style={{
      fontSize: "13px",
      color: "#4b2e2a",
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    View Info
  </span>

  <span
    style={{
      fontSize: "16px",
      fontWeight: 700,
      color: "#111",
    }}
  >
    ₹ {price}
  </span>
</div>


        {/* CART SECTION */}
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
              onClick={() => {
                if (qty <= 1) {
                  updateQuantity(p.id, 0); // REMOVE FROM CART
                  return;
                }
                updateQuantity(p.id, qty - 1);
              }}
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
              onClick={() => updateQuantity(p.id, qty + 1)}
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



 {/* 🔍 SEARCH BAR */}
<div
  style={{
    position: isSearchFixed ? "fixed" : "absolute",
    top: isSearchFixed ? "8px" : "16px",
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: "0 16px",
  }}
>
  {/* ROW */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
    }}
  >
    {/* SEARCH INPUT */}
    <div
      style={{
        flex: 1,
        background: "#fff",
        borderRadius: "999px",
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        marginRight: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      }}
    >
      <FiSearch size={18} color="#6b7280" />

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
          background: "transparent",
        }}
      />
    </div>

    {/* PROFILE ICON */}
    <ProfileIcon
      user={user}
      onClick={() => setShowMenu(!showMenu)}
    />
  </div>
</div>


{/* HERO */}
      <div
        style={{
          height: 220,
          backgroundImage: `url('${heroImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "0 0 22px 22px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,.45)",
          }}
        />

        <div style={{ position: "relative", padding: 16, paddingTop: 64 }}>
          <h3 style={{ margin: 0, color: "#fff" }}>
            {user?.name ? `Hi ${user.name}` : "Welcome"}
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: "#e5e7eb" }}>
            {isGoldenMember
              ? "Golden Member"
              : isBowlMember
              ? "Bowl Member"
              : "Normal User"}
          </p>

          {!isSearching && (
            <div
              style={{
                marginTop: 60,
                background: "rgba(255,255,255,.9)",
                padding: 10,
                borderRadius: 10,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
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
            top: "60px",
            right: "10px",
            zIndex: 9999,
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            width: "160px",
            padding: "5px 0",
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
  <div style={{ margin: "0 16px 12px" }}>
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
            minWidth: "240px",
            padding: "12px",
            borderRadius: "12px",
            background: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            cursor: "pointer",
            border:
              order.id === latestOrder?.id
                ? "1px solid #4b2e2a"
                : "1px solid #e5e7eb",
          }}
        >
          {/* 🔹 ONE ROW: CODE | STATUS | AMOUNT */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            {/* ORDER CODE */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "10px",
                  color: "#6b7280",
                  marginBottom: "2px",
                }}
              >
                Order
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {order.unique_code || `#${order.id}`}
              </div>
            </div>

            {/* STATUS */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontSize: "10px",
                  color: "#6b7280",
                  marginBottom: "2px",
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
            </div>

            {/* AMOUNT */}
            <div style={{ flex: 1, textAlign: "right" }}>
              <div
                style={{
                  fontSize: "10px",
                  color: "#6b7280",
                  marginBottom: "2px",
                }}
              >
                Amount
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                ₹{" "}
                {Number(
                  order.final_amount || order.amount || 0
                ).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      {/* SUBSCRIPTIONS */}
      {!isSearching && isLoggedIn && !isGoldenMember && (
        <div style={{ margin: "0 16px 16px", display: "flex", gap: "12px" }}>
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
                <strong style={{ fontSize: "13px" }}>Bowl Subscription</strong>
                <p style={{ fontSize: "10px", margin: 0 }}>Unlock bowl benefits</p>
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
              <p style={{ fontSize: "10px", margin: 0 }}>Upgrade to premium perks</p>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES */}
      {!isSearching && (
        <div style={{ display: "flex", overflowX: "auto", gap: "14px", padding: "0 16px", marginBottom: "16px" }}>
          <button
            onClick={() => setSelectedCategoryId("all")}
            style={{
              background: selectedCategoryId === "all" ? "#4b2e2a" : "#e5e7eb",
              color: selectedCategoryId === "all" ? "#fff" : "#333",
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              border: "none",
              flexShrink: 0,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
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
      <div style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
        {loading ? <p>Loading...</p> : filteredProducts.length === 0 ? <p>No products found.</p> : filteredProducts.map((p) => renderProductCard(p))}
      </div>

      {/* BOTTOM BAR */}
      {!isSearching && isLoggedIn && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "10px 20px", display: "flex", gap: "10px", zIndex: 9999 }}>
          <button
            onClick={() => {
              if (cartCount === 0) {
                alert("Your cart is empty!");
                return;
              }
              navigate("/user/checkout");
            }}
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
        </div>
      )}

      {/* 🧾 ORDER DETAIL MODAL */}
      {orderModalOpen && activeOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99998, padding: "16px" }}>
          <div style={{ width: "100%", maxWidth: "500px", background: "#fff", borderRadius: "14px", padding: "16px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: 2 }}>Order Code</div>
                <div style={{ fontWeight: 700, fontSize: "15px" }}>{activeOrder.unique_code || `#${activeOrder.id}`}</div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                  Status: <span style={{ fontWeight: 600, color: activeOrder.status === "COMPLETED" ? "#16a34a" : activeOrder.status === "PROCESSING" ? "#f97316" : "#0ea5e9" }}>{niceStatus(activeOrder.status)}</span>
                </div>
              </div>

              <button onClick={closeOrderModal} style={{ border: "none", background: "transparent", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
              Placed on {activeOrder.created_at ? new Date(activeOrder.created_at).toLocaleString() : "-"}
            </div>

            {orderModalLoading ? (
              <p>Loading items...</p>
            ) : activeOrderItems.length === 0 ? (
              <p>No items found in this order.</p>
            ) : (
              <div>
                {activeOrderItems.map((item) => (
                  <div key={item.id} style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <img src={item.product_img || "https://via.placeholder.com/80x80?text=Item"} alt={item.product_name} style={{ width: "70px", height: "70px", borderRadius: "8px", objectFit: "cover" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "2px" }}>{item.product_name}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Qty: {item.quantity}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Price: ₹ {Number(item.unit_price).toFixed(2)} x {item.quantity}</div>
                        <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "4px" }}>Line total: ₹ {Number(item.total_price).toFixed(2)}</div>
                      </div>
                    </div>

                    {item.addons && item.addons.length > 0 && (
                      <div style={{ marginTop: "6px", marginLeft: "80px", fontSize: "12px" }}>
                        <div style={{ fontWeight: 600, marginBottom: "3px" }}>Add-ons:</div>
                        {item.addons.map((ad) => (
                          <div key={ad.id}>{ad.name} (+₹{Number(ad.price).toFixed(2)})</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: "10px", borderTop: "1px solid #e5e7eb", paddingTop: "8px", fontSize: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>Amount</span>
                <span>₹ {Number(activeOrder.amount || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>GST</span>
                <span>₹ {Number(activeOrder.gst_amount || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                <span>Total</span>
                <span>₹ {Number(activeOrder.final_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM ADDONS DRAWER */}
      <BottomAddonsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        product={drawerProduct}
        addons={drawerAddons}
        selectedAddons={drawerSelected}
        toggleAddon={toggleDrawerAddon}
        onAdd={() => {
          confirmAddItem();
          // after adding, automatically keep the bottom bar visible (Order Now already present)
          // optionally auto-navigate to checkout if you want:
          // navigate("/user/checkout");
        }}
        price={drawerProduct ? getEffectivePrice(drawerProduct) : 0}
      />
    </div>
  );
}
