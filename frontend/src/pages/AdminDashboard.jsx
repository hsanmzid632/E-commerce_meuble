// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminDashboard() {
  const { token } = useAuth();

  // Onglets
  const [activeTab, setActiveTab] = useState("products");

  // --- ÉTAT PRODUITS ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [editingId, setEditingId] = useState(null);

  // --- ÉTAT CATÉGORIES ---
  const [newCategory, setNewCategory] = useState("");
  const [catError, setCatError] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");

  // 🔴 Confirmation / erreur suppression catégorie
  const [categoryError, setCategoryError] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // 🔔 Notifications commandes
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  // 🔔 Toast (success / error)
  const [toast, setToast] = useState({ type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 3500);
  };

  // ✅ Timer pour effacer automatiquement categoryError après 5s
  useEffect(() => {
    if (categoryError) {
      const timer = setTimeout(() => {
        setCategoryError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [categoryError]);

  // 🔔 Polling des commandes en attente (notifications)
  useEffect(() => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const fetchPendingOrders = async () => {
      try {
        const res = await api.get("/orders", { headers });
        const list = Array.isArray(res.data) ? res.data : [];

        const pendingStatuses = ["pending", "PENDING", "en_attente", "En attente"];

        const pending = list.filter(
          (o) => o.status && pendingStatuses.includes(o.status)
        );

        setPendingOrdersCount(pending.length);
      } catch (err) {
        console.error("Erreur chargement notifications commandes", err);
      }
    };

    fetchPendingOrders();
    const intervalId = setInterval(fetchPendingOrders, 15000); // toutes les 15s

    return () => clearInterval(intervalId);
  }, [token]);

  // --- CHARGEMENT PRODUITS + CATÉGORIES ---
  useEffect(() => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const loadProducts = async () => {
      try {
        const res = await api.get("/products", { headers });
        setProducts(res.data || []);
      } catch (err) {
        console.error("Erreur chargement produits", err);
      }
    };

    const loadCategories = async () => {
      try {
        const res = await api.get("/categories", { headers });
        setCategories(res.data || []);
      } catch (err) {
        console.error("Erreur chargement catégories", err);
      }
    };

    loadProducts();
    loadCategories();
  }, [token]);

  // --- RESET FORM PRODUIT ---
  const resetProductForm = () => {
    setTitle("");
    setPrice("");
    setDescription("");
    setStock("");
    setImageUrl("");
    setCategoryId("");
    setIsActive(true);
    setEditingId(null);
  };

  // --- AJOUT / MODIF PRODUIT ---
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const payload = {
      title,
      description,
      price: Number(price),
      stock: Number(stock),
      image_url: imageUrl || null,
      category_id: categoryId ? Number(categoryId) : null,
      is_active: isActive,
    };

    try {
      if (editingId) {
        const res = await api.put(`/products/${editingId}`, payload, { headers });
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? res.data : p))
        );
        showToast("success", "Produit mis à jour avec succès");
      } else {
        const res = await api.post("/products", payload, { headers });
        setProducts((prev) => [...prev, res.data]);
        showToast("success", "Produit ajouté avec succès");
      }
      resetProductForm();
    } catch (err) {
      console.error("Erreur sauvegarde produit", err);
      showToast(
        "error",
        err.response?.data?.message || "Erreur lors de l'enregistrement du produit"
      );
    }
  };

  // --- SUPPRESSION PRODUIT ---
  const handleDeleteProduct = async (id) => {
    if (!token) return;
    if (!window.confirm("Supprimer ce produit ?")) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
      await api.delete(`/products/${id}`, { headers });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("success", "Produit supprimé avec succès");
    } catch (err) {
      console.error("Erreur suppression produit", err);
      showToast(
        "error",
        err.response?.data?.message || "Erreur lors de la suppression du produit"
      );
    }
  };

  // --- PASSER EN MODE ÉDITION PRODUIT ---
  const startEditProduct = (p) => {
    setEditingId(p.id);
    setTitle(p.title || "");
    setPrice(p.price != null ? String(p.price) : "");
    setDescription(p.description || "");
    setStock(p.stock != null ? String(p.stock) : "");
    setImageUrl(p.image_url || "");
    setCategoryId(p.category_id != null ? String(p.category_id) : "");
    setIsActive(Boolean(p.is_active));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- CATÉGORIES : RESET FORMULAIRE ---
  const resetCategoryForm = () => {
    setNewCategory("");
    setEditingCategoryId(null);
    setCatError("");
  };

  // --- CATÉGORIES : PASSER EN MODE ÉDITION ---
  const startEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setNewCategory(cat.name);
  };

  // --- CATÉGORIES : AJOUT / MODIF ---
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setCatError("");
    if (!token) return;

    const name = newCategory.trim();
    if (!name) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (editingCategoryId) {
        const res = await api.put(
          `/categories/${editingCategoryId}`,
          { name },
          { headers }
        );
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategoryId ? res.data : c))
        );
        showToast("success", "Catégorie mise à jour avec succès");
      } else {
        const res = await api.post("/categories", { name }, { headers });
        setCategories((prev) => [...prev, res.data]);
        showToast("success", "Catégorie ajoutée avec succès");
      }
      resetCategoryForm();
    } catch (err) {
      console.error("Erreur ajout / édition catégorie", err);
      const msg =
        err.response?.data?.message ||
        "Erreur lors de l'enregistrement de la catégorie.";
      setCatError(msg);
      showToast("error", msg);
    }
  };

  // --- CONFIRMATION SUPPRESSION CATÉGORIE ---
  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete || !token) return;

    setCategoryError("");

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await api.delete(`/categories/${categoryToDelete.id}`, { headers });
      setCategories((prev) =>
        prev.filter((c) => c.id !== categoryToDelete.id)
      );
      setCategoryToDelete(null);
      showToast("success", "Catégorie supprimée avec succès");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        "Erreur lors de la suppression de la catégorie.";
      setCategoryError(msg);
      showToast("error", msg);
      setCategoryToDelete(null);
    }
  };

  // --- LISTE FILTRÉE DES CATÉGORIES ---
  const filteredCategories = categories.filter((c) =>
    (c.name || "").toLowerCase().includes(categorySearch.toLowerCase())
  );

  // --- RENDU ---
  return (
    <main className="flex-1 bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Header + notifications */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              Tableau de bord
            </h1>
            <p className="text-gray-400">
              Gérez vos produits, catégories et commandes en toute simplicité.
            </p>
          </div>

          {/* 🔔 Bouton notifications commandes (version dark) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              className="relative inline-flex items-center justify-center rounded-full border border-gray-700 bg-gray-900/70 px-3 py-2 shadow-lg hover:bg-gray-800 transition-all"
            >
              <span className="sr-only">Notifications commandes</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.7}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
                />
              </svg>

              {pendingOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-gray-700 bg-gray-900/95 backdrop-blur-md p-4 text-sm shadow-2xl z-20">
                {pendingOrdersCount > 0 ? (
                  <>
                    <p className="font-semibold text-gray-100 mb-1">
                      Nouvelles commandes
                    </p>
                    <p className="text-gray-300 mb-2">
                      Il y a{" "}
                      <span className="font-semibold text-amber-400">
                        {pendingOrdersCount} commande
                        {pendingOrdersCount > 1 && "s"}
                      </span>{" "}
                      en attente de traitement.
                    </p>
                    <p className="text-xs text-gray-500">
                      Ouvre la page des commandes pour les consulter.
                    </p>
                  </>
                ) : (
                  <p className="text-gray-300">Aucune nouvelle commande.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Onglets modernes */}
        <div className="inline-flex rounded-2xl bg-gray-800/50 backdrop-blur-sm p-1.5 border border-gray-700 shadow-lg">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === "products"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            📦 Produits
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === "categories"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            🏷️ Catégories
          </button>
        </div>

        {/* ----- ONGLET PRODUITS ----- */}
        {activeTab === "products" && (
          <section className="space-y-6">
            {/* Formulaire produit */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700 shadow-2xl p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <span className="text-xl">{editingId ? "✏️" : "➕"}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {editingId ? "Modifier un produit" : "Ajouter un produit"}
                </h2>
              </div>

              <form onSubmit={handleSubmitProduct} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Titre du produit
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border-2 border-gray-700 bg-gray-900/50 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Canapé 3 places en velours"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Prix (DT)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-xl border-2 border-gray-700 bg-gray-900/50 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full rounded-xl border-2 border-gray-700 bg-gray-900/50 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez votre produit en détail..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Stock disponible
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-xl border-2 border-gray-700 bg-gray-900/50 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Catégorie
                    </label>
                    <select
                      className="w-full rounded-xl border-2 border-gray-700 bg-gray-900/50 px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">Sans catégorie</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    URL de l&apos;image
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border-2 border-gray-700 bg-gray-900/50 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <label className="inline-flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-600 transition-all"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-md"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100">
                      Produit actif
                    </span>
                  </label>

                  <div className="flex gap-3">
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetProductForm}
                        className="px-6 py-3 rounded-xl border-2 border-gray-600 text-sm font-semibold text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-gray-100 transition-all"
                      >
                        Annuler
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold hover:from-amber-400 hover:to-orange-500 shadow-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all hover:scale-105"
                    >
                      {editingId ? "✓ Mettre à jour" : "➕ Ajouter le produit"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Liste produits */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Liste des produits</h2>
                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-amber-500/30 text-amber-400 text-sm font-semibold">
                  {products.length} produit{products.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Titre
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {products.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                          #{p.id}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-200">
                            {p.title}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-xs font-medium">
                            {p.category_name || "Sans catégorie"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-amber-400">
                            {Number(p.price).toFixed(2)} DT
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-300">
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {p.is_active ? (
                            <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold">
                              ✓ Actif
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-gray-700 text-gray-400 text-xs font-semibold">
                              Inactif
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => startEditProduct(p)}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-500/30 transition-colors"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors"
                          >
                            🗑️ Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}

                    {products.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-3xl">
                              📦
                            </div>
                            <p className="text-sm text-gray-500">
                              Aucun produit pour le moment.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ----- ONGLET CATÉGORIES ----- */}
        {activeTab === "categories" && (
          <section className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700 shadow-2xl p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <span className="text-xl">🏷️</span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Gérer les catégories
                </h2>
              </div>

              <form
                onSubmit={handleSaveCategory}
                className="flex flex-col md:flex-row gap-3"
              >
                <input
                  type="text"
                  className="flex-1 rounded-xl border-2 border-gray-700 bg-gray-900/50 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                  placeholder="Nom de la catégorie (Salon, Chambre, Bureau...)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  {editingCategoryId && (
                    <button
                      type="button"
                      onClick={resetCategoryForm}
                      className="px-6 py-3 rounded-xl border-2 border-gray-600 text-sm font-semibold text-gray-300 hover:bg-gray-700 hover:text-gray-100 transition-all"
                    >
                      Annuler
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold hover:from-amber-400 hover:to-orange-500 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    {editingCategoryId ? "✓ Mettre à jour" : "➕ Ajouter"}
                  </button>
                </div>
              </form>

              {catError && (
                <div className="bg-red-500/20 border-2 border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {catError}
                </div>
              )}

              <div className="flex justify-end">
                <input
                  type="text"
                  placeholder="🔍 Rechercher une catégorie..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full max-w-sm rounded-xl border-2 border-gray-700 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                />
              </div>

              {categoryError && (
                <div className="bg-red-500/20 border-2 border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {categoryError}
                </div>
              )}

              <div className="border-2 border-gray-700 rounded-2xl overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-20">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredCategories.map((c) => (
                      <tr
                        key={c.id}
                        className={`hover:bg-gray-700/30 transition-colors ${
                          editingCategoryId === c.id ? "bg-amber-500/10" : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                          #{c.id}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-200">
                            {c.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => startEditCategory(c)}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-500/30 transition-colors"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => {
                              setCategoryError("");
                              setCategoryToDelete(c);
                            }}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors"
                          >
                            🗑️ Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredCategories.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-3xl">
                              🏷️
                            </div>
                            <p className="text-sm text-gray-500">
                              Aucune catégorie ne correspond à cette recherche.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {categoryToDelete && (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-red-500/20 border-2 border-red-500/30 text-red-400 px-6 py-4 rounded-2xl">
                  <div>
                    <p className="font-semibold">
                      Confirmer la suppression de "{categoryToDelete.name}" ?
                    </p>
                    <p className="text-xs text-red-400/80 mt-1">
                      Cette action est définitive et irréversible.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setCategoryToDelete(null)}
                      className="px-4 py-2 rounded-xl border-2 border-red-500/30 text-red-400 hover:bg-red-500/20 text-sm font-semibold transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleConfirmDeleteCategory}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-500 text-sm font-semibold shadow-lg transition-all hover:scale-105"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* 🔔 TOAST */}
      {toast.message && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-md animate-fade-in-up
            ${
              toast.type === "success"
                ? "bg-green-500/20 border-green-500/40 text-green-300"
                : "bg-red-500/20 border-red-500/40 text-red-300"
            }`}
          >
            <span className="font-semibold">
              {toast.type === "success" ? "✔ " : "⚠ "}
            </span>
            {toast.message}
          </div>
        </div>
      )}
    </main>
  );
}
