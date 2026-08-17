// src/pages/Products.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { ShoppingCart, Search, Filter, Grid, List } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("default");

  const { addToCart } = useCart();
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 🔒 Si admin → aller directement sur le dashboard CRUD
  useEffect(() => {
    if (isAdmin) navigate("/admin");
  }, [isAdmin, navigate]);

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        setLoading(true);

        const [prodRes, catRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);

        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des produits.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const goToDetails = (id) => {
    navigate(`/products/${id}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // ✅ empêche le clic carte d’ouvrir les détails
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    addToCart(product);
  };

  // ✅ Stock badge: فقط rupture de stock
  const isOutOfStock = (p) => Number(p.stock) <= 0;

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return (products || []).filter((p) => {
      const matchCategory =
        selectedCategory === "all" || p.category_id === Number(selectedCategory);

      const matchSearch =
        !q ||
        (p.title || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q);

      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case "price-asc":
        return arr.sort((a, b) => Number(a.price) - Number(b.price));
      case "price-desc":
        return arr.sort((a, b) => Number(b.price) - Number(a.price));
      case "name":
        return arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      default:
        return arr;
    }
  }, [filteredProducts, sortBy]);

  const ProductCard = ({ product }) => {
    const outOfStock = isOutOfStock(product);

    return (
      <article
        onClick={() => goToDetails(product.id)}
        className="group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && goToDetails(product.id)}
      >
        <div className="relative overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className={`w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110 ${
                outOfStock ? "opacity-70" : ""
              }`}
            />
          ) : (
            <div className="w-full h-56 bg-slate-200 flex items-center justify-center">
              <span className="text-slate-400">Aucune image</span>
            </div>
          )}

          {/* Category badge */}
          {product.category_name && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-slate-700 shadow-md">
                {product.category_name}
              </span>
            </div>
          )}

          {/* ✅ Only rupture de stock */}
          {outOfStock && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                Rupture de stock
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition">
            {product.title}
          </h2>

          <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-1">
            {product.description || "Aucune description disponible"}
          </p>

          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-2xl font-bold text-orange-600">
                {Number(product.price).toFixed(2)}
              </span>
              <span className="text-sm text-orange-600 ml-1">DT</span>
            </div>
          </div>

          {/* ✅ Bouton achat فقط للمستخدم connecté (et non admin) */}
          {!isAdmin && (
            <button
              type="button"
              disabled={outOfStock}
              onClick={(e) => handleAddToCart(e, product)}
              className={`w-full rounded-xl text-sm font-semibold py-3 transition-all duration-300 flex items-center justify-center gap-2 ${
                outOfStock
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : isAuthenticated
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:scale-[1.02]"
                  : "bg-gray-900 text-amber-300 hover:text-amber-200 hover:bg-gray-800"
              }`}
            >
              {outOfStock ? (
                "Rupture de stock"
              ) : isAuthenticated ? (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Ajouter au panier
                </>
              ) : (
                "Connectez-vous pour acheter"
              )}
            </button>
          )}
        </div>
      </article>
    );
  };

  const ProductListItem = ({ product }) => {
    const outOfStock = isOutOfStock(product);

    return (
      <article
        onClick={() => goToDetails(product.id)}
        className="group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && goToDetails(product.id)}
      >
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-72 h-48 md:h-auto overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                  outOfStock ? "opacity-70" : ""
                }`}
              />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <span className="text-slate-400">Aucune image</span>
              </div>
            )}

            {outOfStock && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                <span className="text-white font-semibold">Rupture de stock</span>
              </div>
            )}
          </div>

          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-1 group-hover:text-orange-600 transition">
                  {product.title}
                </h2>
                {product.category_name && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {product.category_name}
                  </span>
                )}
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-orange-600">
                  {Number(product.price).toFixed(2)}{" "}
                  <span className="text-base font-semibold">DT</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
              {product.description || "Aucune description disponible"}
            </p>

            {!isAdmin && (
              <div className="mt-auto">
                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={(e) => handleAddToCart(e, product)}
                  className={`w-full rounded-xl text-sm font-semibold py-3 transition-all duration-300 flex items-center justify-center gap-2 ${
                    outOfStock
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : isAuthenticated
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg"
                      : "bg-gray-900 text-amber-300 hover:text-amber-200 hover:bg-gray-800"
                  }`}
                >
                  {outOfStock ? (
                    "Rupture de stock"
                  ) : isAuthenticated ? (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Ajouter au panier
                    </>
                  ) : (
                    "Connectez-vous pour acheter"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-slate-600">Chargement des produits...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-amber-300/15 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
                Nos produits
              </h1>
              <p className="text-lg text-slate-600">
                Découvrez notre sélection de mobilier pour salon, chambre, bureau
                et plus encore.
              </p>
            </div>

            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        </div>
      )}

      {/* Filters */}
      <section className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">
                  Catégorie :
                </span>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    selectedCategory === "all"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Toutes
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(String(cat.id))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                      selectedCategory === String(cat.id)
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="default">Trier par défaut</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name">Nom A-Z</option>
              </select>

              <div className="flex gap-2 border border-slate-300 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition ${
                    viewMode === "grid"
                      ? "bg-orange-500 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  aria-label="Vue grille"
                >
                  <Grid className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition ${
                    viewMode === "list"
                      ? "bg-orange-500 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  aria-label="Vue liste"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
              <ShoppingCart className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-slate-600">
              Essayez de changer vos filtres ou votre recherche
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">
                  {sortedProducts.length}
                </span>{" "}
                produits trouvés
              </p>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {sortedProducts.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
