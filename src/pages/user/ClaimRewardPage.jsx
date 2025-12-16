import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { fetchUserRewards } from "../../api/user/rewards";
import { fetchAdditionalIngredients } from "../../api/user/additionalIngredients";
import { placeOrder } from "../../api/user/orders";
import { fetchProducts } from "../../api/user/products";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";
import "./ClaimRewardPage.css";

export default function ClaimRewardPage() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [userRewards, setUserRewards] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addonsByProduct, setAddonsByProduct] = useState({});
    const [addonsByCategory, setAddonsByCategory] = useState({});
    const [toast, setToast] = useState(null);

    // modal state for configuring a reward (direct order from modal)
    const [configureReward, setConfigureReward] = useState(null); // reward object
    const [modalProducts, setModalProducts] = useState([]); // { product, qty, selectedAddons: [], autoLocked: bool }
    const [placing, setPlacing] = useState(false);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // normalize membership flag
    const isTrue = (v) => v === 1 || v === "1" || v === true || v === "true";

    // parse numbers robustly
    const parseNumericPrice = (val) => {
        if (val == null) return 0;
        if (typeof val === "number") return val;
        if (typeof val === "string") {
            const cleaned = val.replace(/[^\d.\-]/g, "").trim();
            const n = parseFloat(cleaned);
            return Number.isFinite(n) ? n : 0;
        }
        return 0;
    };

    /**
     * @description Calculates the effective price per unit based on user's membership.
     * For members: show member price directly
     * For non-members: show selling_price
     */
    const getEffectivePrice = (product) => {
        if (!product) return 0;

        const isBowl = isTrue(user?.bowl_membership);
        const isGolden = isTrue(user?.golden_membership);

        // ❗ Members get member price
        if (isGolden) {
            const gp = parseNumericPrice(product.goldenmem_sellingprice);
            if (gp > 0) return gp;
        }

        if (isBowl) {
            const bp = parseNumericPrice(product.bowlmem_sellingprice);
            if (bp > 0) return bp;
        }

        // ❌ Non-member → return selling_price
        return parseNumericPrice(product.selling_price || 0);
    };

    // load products & addons
    useEffect(() => {
        const load = async () => {
            try {
                const [prodRes, addonRes, rewardsRes] = await Promise.all([
                    fetchProducts(),
                    fetchAdditionalIngredients(),
                    fetchUserRewards(user?.id),
                ]);

                const rawProds = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.data ?? [];
                // normalize minimal product fields
                const normalized = rawProds.map((p) => ({
                    ...p,
                    id: Number(p.id ?? p.product_id ?? -1),
                    category_id: p.category_id ?? null,
                    product_name: p.product_name ?? p.name ?? "",
                    selling_price: parseNumericPrice(p.selling_price ?? 0),
                    net_price: parseNumericPrice(p.net_price ?? 0),
                    discount: parseNumericPrice(p.discount || 0),
                    bowlmem_sellingprice: parseNumericPrice(p.bowlmem_sellingprice ?? 0),
                    goldenmem_sellingprice: parseNumericPrice(p.goldenmem_sellingprice ?? 0),
                    bowlmem_discount: parseNumericPrice(p.bowlmem_discount || 0),
                    goldenmem_discount: parseNumericPrice(p.goldenmem_discount || 0),
                    product_img: p.product_img ?? p.image ?? null,
                }));
                setProducts(normalized);

                const addonRaw = addonRes.data;
                const data =
                    Array.isArray(addonRaw) ||
                    Array.isArray(addonRaw?.data) ||
                    Array.isArray(addonRaw?.additional_ingredients)
                        ? addonRaw.data || addonRaw.additional_ingredients || addonRaw
                        : [];

                const byProduct = {};
                const byCategory = {};
                data.forEach((a) => {
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

                // rewards loaded separately below too (for first load)
                const rows = Array.isArray(rewardsRes?.data) ? rewardsRes.data : rewardsRes?.data?.rewards ?? rewardsRes?.data?.data ?? [];
                setUserRewards(rows);
            } catch (e) {
                console.error("load error", e);
                showToast("error", "Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // separate function to fetch user rewards (used after placing)
    const loadUserRewards = async () => {
        try {
            const res = await fetchUserRewards(user.id);
            const rows = Array.isArray(res.data) ? res.data : res.data?.rewards ?? res.data?.data ?? [];
            setUserRewards(rows);
        } catch (err) {
            console.error("loadUserRewards", err);
            showToast("error", "Failed to load your rewards");
        }
    };

    // helper: find eligible products for a reward
    const findEligibleProducts = (reward) => {
        if (!reward) return [];
        const targetPid = reward.product_id ? Number(reward.product_id) : null;
        const targetCid = reward.category_id ? Number(reward.category_id) : null;

        if (targetPid) {
            return products.filter((p) => Number(p.id) === targetPid);
        }
        if (targetCid) {
            return products.filter((p) => Number(p.category_id) === targetCid);
        }
        // global rewards: show all active products (or let user pick) — we will default to all
        return products.slice();
    };

    // open configure modal for a user_reward row
    const openConfigure = (ur) => {
        if (!ur) return;
        const rewardObj = {
            ...ur,
            user_reward_id: ur.user_reward_id ?? ur.id,
            reward_id: ur.reward_id ?? ur.id,
            apply_on: (ur.apply_on ?? ur.applyOn ?? "").toUpperCase(),
            buy: Number(ur.buy || 0),
            get: Number(ur.get || 0),
            percentage: Number(ur.percentage || 0),
        };

        // gather eligible products
        const eligible = findEligibleProducts(ur);
        if (!eligible || eligible.length === 0) {
            showToast("error", "No eligible products found for this reward.");
            return;
        }

        // If this is a PRODUCT-level buy/get we prefill qty = buy + get and lock it.
        const isProductBuyGet =
            rewardObj.apply_on === "PRODUCT" &&
            rewardObj.buy > 0 &&
            rewardObj.get > 0 &&
            Number(rewardObj.product_id || -1) !== -1;

        // For PRICE discount vouchers we want default qty = 1 (user asked)
        const defaultQtyForPrice = rewardObj.apply_on === "PRICE" ? 1 : 0;

        // seed modalProducts; if the reward targets a specific product we set autoLocked = true
        const seed = eligible.map((p) => {
            const isTargeted = isProductBuyGet && Number(rewardObj.product_id) === Number(p.id);
            const defaultQty = isTargeted ? rewardObj.buy + rewardObj.get : defaultQtyForPrice;
            return {
                product: p,
                qty: defaultQty,
                selectedAddons: [], // <--- ENSURING ADDONS START EMPTY (not pre-selected)
                autoLocked: isTargeted, // mark targeted product as autoLocked
            };
        });

        setConfigureReward(rewardObj);
        setModalProducts(seed);
    };

    const closeConfigure = () => {
        setConfigureReward(null);
        setModalProducts([]);
    };

    // toggle addon inside modal
    const toggleModalAddon = (productId, addonId) => {
        setModalProducts((prev) =>
            prev.map((mp) => {
                if (mp.product.id !== productId) return mp;
                const existing = mp.selectedAddons || [];
                if (existing.includes(addonId)) {
                    return { ...mp, selectedAddons: existing.filter((x) => x !== addonId) };
                }
                return { ...mp, selectedAddons: [...existing, addonId] };
            })
        );
    };

    // update quantity in modal (respects locking rules)
    const updateModalQty = (productId, qty) => {
        // check locking rule: if product is autoLocked we disallow manual change
        const mp = modalProducts.find((m) => Number(m.product.id) === Number(productId));
        if (mp && mp.autoLocked) {
            // locked — do nothing
            return;
        }

        // If the reward is PRICE, enforce min 1
        const minForPrice = configureReward && configureReward.apply_on === "PRICE" ? 1 : 0;

        const safe = Math.max(minForPrice, Math.floor(Number(qty || 0)));
        setModalProducts((prev) => prev.map((m) => (Number(m.product.id) === Number(productId) ? { ...m, qty: safe } : m)));
    };

    /**
     * @description Computes totals for modal selection taking reward and membership into account.
     * Uses rupee amounts formula: Effective Discount = D1 + D2 - (D1 × D2)/100
     * Where D1 and D2 are rupee amounts
     */
    const computeModalTotals = () => {
        if (!configureReward) return { 
            subtotal: 0, 
            freeCount: 0, 
            discount: 0, 
            gst: 0, 
            finalAmount: 0, 
            freeAllocation: {}, 
            totalValueClaimed: 0, 
            couponDiscountValue: 0, 
            membershipDiscountValue: 0,
            regularDiscountValue: 0,
            couponPercentage: 0, 
            bogoDiscountValue: 0,
            isMember: false,
            effectiveDiscountValue: 0
        };

        // Check if user is a member
        const isMember = isTrue(user?.bowl_membership) || isTrue(user?.golden_membership);
        
        // Coupon discount percentage (D2) from the reward
        const couponPercentage = configureReward.apply_on === "PRICE" ? Number(configureReward.percentage || 0) : 0;
        
        // Initialize cumulative discount values
        let regularDiscountTotal = 0; // Value saved by regular discount (for non-members)
        let membershipDiscountTotal = 0; // Value saved by membership (for members)
        let couponDiscountTotal = 0; // Value saved by reward percentage (D2)
        let effectiveDiscountTotal = 0; // Combined effective discount using formula
        
        // Function to calculate prices and discount values for one unit
        const getUnitPricesAndDiscounts = (product) => {
            if (!product) {
                return {
                    finalUnitPrice: 0,
                    regularDiscountValue: 0,
                    membershipDiscountValue: 0,
                    couponDiscountValue: 0,
                    effectiveDiscountValue: 0,
                };
            }

            // Base prices
            const netPrice = parseNumericPrice(product.net_price || 0);
            const sellingPrice = parseNumericPrice(product.selling_price || 0);
            const memberPrice = getEffectivePrice(product); // This will be member price if user has membership
            
            let D1_amount = 0; // First discount amount (Regular or Membership) in ₹
            let D2_amount = 0; // Second discount amount (Coupon) in ₹
            let effectiveDiscountAmount = 0;
            let finalUnitPrice = 0;
            
            // Calculate D2 (coupon discount amount) from NET PRICE
            D2_amount = (netPrice * couponPercentage) / 100;
            
            if (isMember) {
                // FOR MEMBERS: Calculate membership discount from net_price to member_price
                D1_amount = Math.max(0, netPrice - memberPrice);
            } else {
                // FOR NON-MEMBERS: Calculate regular discount from net_price to selling_price
                D1_amount = Math.max(0, netPrice - sellingPrice);
            }
            
            // Calculate EFFECTIVE DISCOUNT using RUPEE AMOUNTS formula: D1 + D2 - (D1 × D2)/100
            effectiveDiscountAmount = D1_amount + D2_amount - (D1_amount * D2_amount) / 100;
            
            // Final unit price = Net Price - Effective Discount Amount
            finalUnitPrice = Math.max(0, netPrice - effectiveDiscountAmount);
            
            return {
                finalUnitPrice: Math.round(finalUnitPrice * 100) / 100,
                regularDiscountValue: isMember ? 0 : Math.round(D1_amount * 100) / 100,
                membershipDiscountValue: isMember ? Math.round(D1_amount * 100) / 100 : 0,
                couponDiscountValue: Math.round(D2_amount * 100) / 100,
                effectiveDiscountValue: Math.round(effectiveDiscountAmount * 100) / 100,
            };
        };
        
        // --- Prepare Unit List with accurate prices ---
        const unitListByProduct = {}; // productId -> [{...unit}]
        modalProducts.forEach((mp) => {
            if (!mp.product || mp.qty <= 0) return;
            
            // Get the price and discount breakdown for one unit
            const {
                finalUnitPrice,
                regularDiscountValue,
                membershipDiscountValue,
                couponDiscountValue,
                effectiveDiscountValue,
            } = getUnitPricesAndDiscounts(mp.product);

            const addonsList = (addonsByProduct[mp.product.id] || addonsByCategory[mp.product.category_id] || []);
            // addons cost per unit if selected (we assume addons apply per unit)
            const addonsCostPerUnit = (mp.selectedAddons || [])
                .map((aid) => {
                    const a = addonsList.find((x) => x.id === aid);
                    return a ? parseNumericPrice(a.price) : 0;
                })
                .reduce((s, x) => s + x, 0);

            const arr = [];
            for (let i = 0; i < (mp.qty || 0); i++) {
                // Accumulate discount values for each unit
                regularDiscountTotal += regularDiscountValue;
                membershipDiscountTotal += membershipDiscountValue;
                couponDiscountTotal += couponDiscountValue;
                effectiveDiscountTotal += effectiveDiscountValue;

                arr.push({
                    productId: mp.product.id,
                    finalUnitPrice: finalUnitPrice, // Price after all percentage discounts
                    addonsPerUnit: addonsCostPerUnit,
                    // Total payable price per unit (Discounted Unit Price + Addons)
                    totalUnitPrice: finalUnitPrice + addonsCostPerUnit,
                });
            }
            unitListByProduct[mp.product.id] = (unitListByProduct[mp.product.id] || []).concat(arr);
        });

        // --- BOGO Logic (Free Allocation - Applied Last) ---
        const buy = Number(configureReward.buy || 0);
        const get = Number(configureReward.get || 0);
        let freeAllocation = {}; // productId -> freeCount
        let freeCountTotal = 0;
        let bogoDiscountTotal = 0; // Value claimed via free items

        if (configureReward.apply_on === "PRODUCT" && buy > 0 && get > 0) {
            if (configureReward.product_id) {
                const pid = Number(configureReward.product_id);
                const units = unitListByProduct[pid] || [];
                const totalUnitsForPid = units.length;
                const group = buy + get;
                let freeForPid = Math.floor(totalUnitsForPid / group) * get;

                const mpRow = modalProducts.find((m) => Number(m.product.id) === pid);
                if (mpRow && mpRow.autoLocked && totalUnitsForPid === group) {
                    freeForPid = Math.min(get, totalUnitsForPid);
                }

                freeCountTotal = freeForPid;
                if (freeForPid > 0) {
                    const sortedAsc = [...units].sort((a, b) => a.totalUnitPrice - b.totalUnitPrice);
                    for (let i = 0; i < freeForPid; i++) {
                        const u = sortedAsc[i];
                        if (!u) break;
                        freeAllocation[u.productId] = (freeAllocation[u.productId] || 0) + 1;
                    }
                }
            } else if (configureReward.category_id) {
                const cid = Number(configureReward.category_id);
                const unitsInCategory = [];
                Object.keys(unitListByProduct).forEach((pidStr) => {
                    const pid = Number(pidStr);
                    const prod = products.find((x) => Number(x.id) === pid);
                    if (prod && Number(prod.category_id) === cid) {
                        unitsInCategory.push(...(unitListByProduct[pid] || []));
                    }
                });
                const totalUnitsCat = unitsInCategory.length;
                const group = buy + get;
                const freeForCat = Math.floor(totalUnitsCat / group) * get;
                freeCountTotal = freeForCat;
                if (freeForCat > 0) {
                    const sortedAsc = [...unitsInCategory].sort((a, b) => a.totalUnitPrice - b.totalUnitPrice);
                    for (let i = 0; i < freeForCat; i++) {
                        const u = sortedAsc[i];
                        if (!u) break;
                        freeAllocation[u.productId] = (freeAllocation[u.productId] || 0) + 1;
                    }
                }
            } else {
                const allUnits = Object.values(unitListByProduct).flat();
                const group = buy + get;
                const totalUnits = allUnits.length;
                const freeAll = Math.floor(totalUnits / group) * get;
                freeCountTotal = freeAll;
                if (freeAll > 0) {
                    const sortedAsc = [...allUnits].sort((a, b) => a.totalUnitPrice - b.totalUnitPrice);
                    for (let i = 0; i < freeAll; i++) {
                        const u = sortedAsc[i];
                        if (!u) break;
                        freeAllocation[u.productId] = (freeAllocation[u.productId] || 0) + 1;
                    }
                }
            }
        }

        // --- Calculate Payable Subtotal & BOGO Value ---
        let subtotal = 0; // Total payable amount AFTER all discounts (pre-GST)
        Object.keys(unitListByProduct).forEach((pidStr) => {
            const pid = Number(pidStr);
            const units = unitListByProduct[pid] || [];
            const freeForThis = freeAllocation[pid] || 0;
            const payableCount = Math.max(0, units.length - freeForThis);
            
            // Sort Descending to ensure the most expensive items are the ones the user PAYS for.
            const sortedDesc = [...units].sort((a, b) => b.totalUnitPrice - a.totalUnitPrice);
            const payableUnits = sortedDesc.slice(0, payableCount);
            const freeUnits = sortedDesc.slice(payableCount);
                
            // Sum of the final, already-discounted prices of the payable units
            subtotal += payableUnits.reduce((s, u) => s + Number(u.totalUnitPrice || 0), 0);
            
            // Discount from Free (BOGO) units: Sum of their calculated discounted price + addons
            bogoDiscountTotal += freeUnits.reduce((s, u) => s + Number(u.totalUnitPrice || 0), 0);
        });
        
        // Calculate totals with proper rounding
        const finalRegularDiscountValue = Math.round(regularDiscountTotal * 100) / 100;
        const finalMembershipDiscountValue = Math.round(membershipDiscountTotal * 100) / 100;
        const finalCouponDiscountValue = Math.round(couponDiscountTotal * 100) / 100;
        const finalBogoDiscountValue = Math.round(bogoDiscountTotal * 100) / 100;
        const finalEffectiveDiscountValue = Math.round(effectiveDiscountTotal * 100) / 100;
        
        // For DISPLAY: Show ONLY the effective discount value (NOT the sum of individual discounts)
        const displayDiscountTotal = finalEffectiveDiscountValue + finalBogoDiscountValue;
        
        // For ACTUAL PRICE: We already used effective discount in finalUnitPrice calculation

        // The subtotal is already the final amount (pre-GST), as all percentage/BOGO discounts are applied per unit.
        const gstBase = Math.max(0, subtotal); 
        const gst = Math.round(gstBase * 0.05 * 100) / 100;
        const finalAmount = Math.round((gstBase + gst) * 100) / 100;

        return { 
            subtotal, 
            freeCount: freeCountTotal, 
            discount: displayDiscountTotal, // Show effective discount + BOGO
            gst, 
            finalAmount, 
            freeAllocation, 
            // Specific metrics for detailed justification
            couponPercentage, 
            regularDiscountValue: finalRegularDiscountValue,
            membershipDiscountValue: finalMembershipDiscountValue, 
            couponDiscountValue: finalCouponDiscountValue, 
            bogoDiscountValue: finalBogoDiscountValue, 
            effectiveDiscountValue: finalEffectiveDiscountValue,
            totalValueClaimed: displayDiscountTotal, // Show effective discount for display
            isMember,
        };
    };

    // Build order payload from modal selection (no cart)
    const buildModalOrderPayload = () => {
        const { subtotal, discount, gst, finalAmount } = computeModalTotals();

        // group items by product to build items array with addons
        const itemsMap = {};
        modalProducts.forEach((mp) => {
            if (!mp.qty || mp.qty <= 0) return;
            const pid = mp.product.id;
            // Send the effective price (after all discounts except BOGO)
            const unit_price = getEffectivePrice(mp.product); 
            
            const addonsList = addonsByProduct[pid] || addonsByCategory[mp.product.category_id] || [];
            const addonsPayload = (mp.selectedAddons || [])
                .map((aid) => {
                    const a = addonsList.find((x) => x.id === aid);
                    if (!a) return null;
                    return { ingredient_id: a.id, price: parseNumericPrice(a.price || 0) };
                })
                .filter(Boolean);

            if (!itemsMap[pid]) {
                itemsMap[pid] = { product_id: pid, quantity: 0, unit_price, addons: addonsPayload };
            }
            itemsMap[pid].quantity += Number(mp.qty || 0);
        });

        const orderItems = Object.values(itemsMap).map((it) => ({
            product_id: it.product_id,
            quantity: it.quantity,
            unit_price: Number(it.unit_price || 0), 
            addons: it.addons,
        }));

        const payload = {
            // Send the calculated amounts:
            amount: Math.round(subtotal * 100) / 100, // This is the total price *after* all discounts, pre-GST
            gst_amount: Math.round(gst * 100) / 100,
            final_amount: Math.round(finalAmount * 100) / 100,
            transactionId: `TXN-${Date.now()}`,
            items: orderItems,
            applied_reward: configureReward || null,
        };
        // Include the total discount amount for the backend
        if (discount > 0) {
            payload.discount_amount = discount; 
        }
        
        // Pass user's membership type to backend for re-validation
        payload.user_membership = user?.golden_membership ? 'GOLDEN' : (user?.bowl_membership ? 'BOWL' : 'NONE');

        return payload;
    };

    // place order from modal
    const placeOrderFromModal = async () => {
        if (!configureReward) return;
        // ensure at least some qty chosen
        const totalQty = modalProducts.reduce((s, m) => s + (m.qty || 0), 0);
        if (totalQty === 0) {
            showToast("error", "Select products and quantities before placing the order.");
            return;
        }

        // strict applicability check: reward.product_id => all selected product ids must be that id
        if (configureReward.product_id) {
            const allowed = Number(configureReward.product_id);
            const invalid = modalProducts.some((mp) => mp.qty > 0 && Number(mp.product.id) !== allowed);
            if (invalid) {
                showToast("error", "This reward only applies to the specified product. Please choose that product only.");
                return;
            }
        }
        // category check
        if (configureReward.category_id) {
            const allowedCat = Number(configureReward.category_id);
            const invalid = modalProducts.some((mp) => mp.qty > 0 && Number(mp.product.category_id) !== allowedCat);
            if (invalid) {
                showToast("error", "This reward only applies to the specified category. Please choose products from that category only.");
                return;
            }
        }

        // confirm
        if (!window.confirm("Place order now using this reward? This will mark the reward as USED on success.")) return;

        setPlacing(true);
        try {
            const payload = buildModalOrderPayload();
            console.log("Placing order (modal):", payload);
            const res = await placeOrder(payload);
            console.log("placeOrder response:", res?.data);

            if (res?.data?.success) {
                confetti({ particleCount: 90, spread: 140, origin: { y: 0.6 } });

                // Update reward status to USED in UI
                setUserRewards((prev) =>
                    prev.map((r) => {
                        const matches = (r.user_reward_id || r.id) === (configureReward.user_reward_id || configureReward.id);
                        if (matches) return { ...r, status: "USED" };
                        return r;
                    })
                );

                showToast("success", "Order placed! Reward marked used.");
                closeConfigure();
                
                // Navigate to orders page
                navigate("/user/orders");
            } else {
                throw new Error(res?.data?.message || "Failed to place order");
            }
        } catch (err) {
            console.error("placeOrderFromModal err:", err);
            const msg = err?.response?.data?.message || "Failed to place order";
            showToast("error", msg);
        } finally {
            setPlacing(false);
        }
    };

    // UI helpers
    const renderStatusBadge = (status) => {
        const s = (status || "").toUpperCase();
        if (s === "ACTIVE") return <span className="badge badge-active">Active</span>;
        if (s === "USED") return <span className="badge badge-used">Used</span>;
        if (s === "EXPIRED") return <span className="badge badge-expired">Expired</span>;
        return <span className="badge badge-default">{status || "Unknown"}</span>;
    };

    // modal derived info
    const modalTotals = computeModalTotals();
    const totalQty = modalProducts.reduce((s, m) => s + (m.qty || 0), 0);

    // render modal product row
    const renderModalProductRow = (mp) => {
        const p = mp.product;
        const unitPrice = getEffectivePrice(p);
        const addonsList = addonsByProduct[p.id] || addonsByCategory[p.category_id] || [];

        // determine if quantity should be locked: autoLocked flag
        const lockQtyForProduct = !!mp.autoLocked;

        // min for input: if reward is PRICE -> 1 else 0
        const minInput = configureReward && configureReward.apply_on === "PRICE" ? 1 : 0;

        return (
            <div key={p.id} className="modal-product-row">
                <img className="product-image" src={p.product_img || "/images/placeholder.png"} alt={p.product_name} />

                <div className="product-main">
                    <div className="product-title">{p.product_name}</div>
                    <div className="product-sub">Unit ₹ {Number(unitPrice || 0).toFixed(2)} (Member Price)</div>

                    <div className="qty-row">
                        <div className="qty-label">Qty</div>
                        <input
                            type="number"
                            min={minInput}
                            value={mp.qty}
                            onChange={(e) => updateModalQty(p.id, e.target.value)}
                            className="qty-input"
                            disabled={lockQtyForProduct}
                            readOnly={lockQtyForProduct}
                        />
                        {lockQtyForProduct && <div className="fixed-pill">Fixed</div>}
                    </div>

                    {addonsList.length > 0 && (
                        <div className="addons-list">
                            <div className="addons-title">Addons</div>
                            <div className="addons-items">
                                {addonsList.map((a) => (
                                    <label key={a.id} className="addon-item">
                                        {/* Checkbox state now relies purely on user selection via mp.selectedAddons */}
                                        <input type="checkbox" checked={(mp.selectedAddons || []).includes(a.id)} onChange={() => toggleModalAddon(p.id, a.id)} />
                                        <span className="addon-text">{a.ingredients} (+₹{Number(a.price).toFixed(2)})</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* show free allocation for this product */}
                <div className="product-right">
                    <div className="small-muted">Included total units: <strong>{mp.qty}</strong></div>
                    <div className="free-count">Free: {modalTotals.freeAllocation[p.id] || 0}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="crp-container">
            {toast && (
                <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>
                    {toast.message}
                </div>
            )}

            <h2 className="page-title">Your Claimed Rewards</h2>

            <div className="rewards-area">
                {loading ? (
                    <div className="muted">Loading...</div>
                ) : userRewards.length === 0 ? (
                    <div className="muted">You have no claimed rewards.</div>
                ) : (
                    <div className="rewards-grid">
                        {userRewards.map((ur) => {
                            const status = (ur.status || ur.user_reward_status || "").toUpperCase();
                            const code = ur.coupon_code || ur.coupon || ur.couponCode || "(no-code)";
                            const applyOn = (ur.apply_on || ur.applyOn || "").toUpperCase();

                            let desc = "Reward";
                            if (applyOn === "PRICE") desc = ur.percentage ? `${ur.percentage}% off on total price` : "Price discount";
                            else if (applyOn === "PRODUCT") {
                                if (ur.product_name || ur.product_id) desc = `Buy ${ur.buy || 1} get ${ur.get || 0} on product ${ur.product_name || ur.product_id}`;
                                else if (ur.category_name || ur.category_id) desc = `Buy ${ur.buy || 1} get ${ur.get || 0} on category ${ur.category_name || ur.category_id}`;
                                else desc = `Product reward`;
                            }

                            return (
                                <div key={ur.user_reward_id || ur.id || `${ur.reward_id}-${ur.user_reward_id}`} className={`reward-card ${status === "EXPIRED" ? "expired" : ""}`}>
                                    <div className="reward-left">
                                        <div className="reward-title-row">
                                            <span className="reward-code">{code}</span>
                                            {renderStatusBadge(status)}
                                        </div>

                                        <div className="reward-desc">{desc}</div>

                                        <div className="reward-claimed muted">
                                            Claimed: {new Date(ur.claimed_at || ur.created_at || ur.createdAt || ur.updated_at).toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="reward-actions">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(code);
                                                    showToast("success", "Code copied");
                                                } catch {
                                                    showToast("error", "Copy failed");
                                                }
                                            }}
                                            className="btn-outline"
                                        >
                                            Copy Code
                                        </button>

                                        {status === "ACTIVE" ? (
                                            <button onClick={() => openConfigure(ur)} className="btn-primary">
                                                Use / Configure
                                            </button>
                                        ) : (
                                            <div className="muted small-text">{status === "EXPIRED" ? "Expired" : "Used"}</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Configure Modal */}
            {configureReward && (
                <div className="modal-backdrop" role="dialog" aria-modal="true">
                    <div className="modal-card">
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">{configureReward.coupon_code || configureReward.reward_id}</h3>
                                <div className="muted">Choose products & quantities. Free items are assigned cheapest-first. Preview shows discount & GST.</div>
                            </div>
                            <button onClick={closeConfigure} className="modal-close">✕</button>
                        </div>

                        <div className="modal-body">
                            <div className="section-title">Products</div>

                            <div className="modal-products-list">
                                {modalProducts.map((mp) => renderModalProductRow(mp))}
                            </div>

                            <div className="modal-summary">
                                <div className="summary-left">
                                    <div className="summary-section-title">Reward Breakdown</div>
                                    
                                    <div className="muted">Total Units Selected: <strong>{totalQty}</strong></div>
                                    <hr className="summary-hr-thin" />
                                    
                                    {/* SHOW ONLY TOTAL CLAIMED VALUE - Effective Discount Amount */}
                                    <div className="muted reward-detail-item">
                                        Total Claimed Value (Reward): ₹ <strong>{modalTotals.totalValueClaimed.toFixed(2)}</strong>
                                    </div>
                                    
                                    <div className="muted">GST (5% on Subtotal): ₹ <strong>{Number(modalTotals.gst || 0).toFixed(2)}</strong></div>

                                    <div className="per-product-free">
                                        <div className="sub-title">Per-product free allocation:</div>
                                        <div className="free-badges">
                                            {Object.keys(modalTotals.freeAllocation).length === 0 ? <div className="muted">—</div> :
                                                Object.entries(modalTotals.freeAllocation).map(([pid, cnt]) => {
                                                    const prod = products.find((x) => Number(x.id) === Number(pid));
                                                    return <div key={pid} className="free-pill">{prod?.product_name || `Product ${pid}`}: Free {cnt}</div>;
                                                })}
                                        </div>
                                    </div>
                                </div>

                                <div className="summary-right">
                                    <div className="muted small-text">Total Payable Amount</div>
                                    <div className="amount-display">
                                        ₹ <strong>{modalTotals.finalAmount.toFixed(2)}</strong>
                                    </div>

                                    <button 
                                        onClick={placeOrderFromModal} 
                                        className="btn-place-order primary-highlight" // Added class for highlighting
                                        disabled={placing || totalQty === 0 || modalTotals.finalAmount < 0}
                                    >
                                        {placing ? "Placing Order..." : `Pay Now & Use Reward`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}