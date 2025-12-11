// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

// USER PAGES
import LandingLogin from "./pages/user/LandingLogin.jsx";
import UserDashboard from "./pages/user/UserDashboard.jsx";
import CheckoutPage from "./pages/user/CheckoutPage.jsx";
import OrderHistoryPage from "./pages/user/OrderHistoryPage.jsx";

// ADMIN PAGES
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/admindashboard.jsx";

// CATEGORY PAGES
import CategoriesList from "./pages/admin/CategoriesList.jsx";
import AddEditCategory from "./pages/admin/AddEditCategory.jsx";

// PRODUCT PAGES
import ProductsList from "./pages/admin/ProductsList.jsx";
import AddEditProduct from "./pages/admin/AddEditProduct.jsx";

// INGREDIENT PAGES
import IngredientsList from "./pages/admin/IngredientsList.jsx";
import AddEditIngredient from "./pages/admin/AddEditIngredient.jsx";

// REWARDS PAGES
import RewardsList from "./pages/admin/RewardsList.jsx";
import AddEditReward from "./pages/admin/AddEditReward.jsx";

export default function App() {
  return (
    <Routes>

      {/* ---------------------------
          PUBLIC ROUTES (NO LOGIN)
      ---------------------------- */}

      {/* Guest homepage + logged-in user homepage */}
      <Route path="/" element={<UserDashboard />} />

      {/* Login page */}
      <Route path="/login" element={<LandingLogin />} />


      {/* ---------------------------
          USER PROTECTED ROUTES
      ---------------------------- */}

      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute roles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/checkout"
        element={
          <ProtectedRoute roles={["user"]}>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/orders"
        element={
          <ProtectedRoute roles={["user"]}>
            <OrderHistoryPage />
          </ProtectedRoute>
        }
      />


      {/* ---------------------------
          ADMIN ROUTES
      ---------------------------- */}

      <Route path="/cloffy/admin" element={<AdminLogin />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute roles={["admin"]}>
            <CategoriesList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/categories/add"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AddEditCategory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/categories/edit/:id"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AddEditCategory />
          </ProtectedRoute>
        }
      />


      {/* PRODUCTS */}
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute roles={["admin"]}>
            <ProductsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/products/add"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AddEditProduct />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/products/edit/:id"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AddEditProduct />
          </ProtectedRoute>
        }
      />


      {/* INGREDIENTS */}
      <Route
        path="/admin/ingredients"
        element={
          <ProtectedRoute roles={["admin"]}>
            <IngredientsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/ingredients/add"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AddEditIngredient />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/ingredients/edit/:id"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AddEditIngredient />
          </ProtectedRoute>
        }
      />


      {/* REWARDS */}
      <Route
        path="/admin/rewards"
        element={
          <ProtectedRoute roles={["admin"]}>
            <RewardsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/rewards/add"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AddEditReward />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/rewards/edit/:id"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AddEditReward />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}
