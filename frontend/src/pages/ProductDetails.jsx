// src/pages/ProductDetails.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (e) {
        console.error(e);
        setError("Produit introuvable.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const outOfStock = product ? Number(product.stock) <= 0 : false;

  const handleAdd = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    addToCart(product);
    navigate("/cart");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Chargement…</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error || "Erreur"}</p>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 px-6 py-2 rounded-xl bg-gray-900 text-amber-300 hover:bg-gray-800"
          >
            Retour aux produits
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-700 hover:text-orange-600 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Retour</span>
        </button>
        <div className="mt-6 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden grid md:grid-cols-2">
          {/* Image */}
          <div className="relative">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover min-h-[320px]"
              />
            ) : (
              <div className="w-full h-full min-h-[320px] bg-slate-200 flex items-center justify-center">
                <span className="text-slate-500">Aucune image</span>
              </div>
            )}

            {outOfStock && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                  Rupture de stock
                </span>
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="p-8 flex flex-col">
            {product.category_name && (
              <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {product.category_name}
              </span>
            )}

            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              {product.title}
            </h1>

            <p className="mt-3 text-slate-600 leading-relaxed">
              {product.description || "Aucune description disponible."}
            </p>

            <div className="mt-6">
              <span className="text-3xl font-bold text-orange-600">
                {Number(product.price).toFixed(2)}
              </span>
              <span className="text-base font-semibold text-orange-600 ml-2">
                DT
              </span>
            </div>

            {/* CTA */}
            {!isAdmin && (
              <div className="mt-8">
                <button
                  onClick={handleAdd}
                  disabled={outOfStock}
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
      </div>
    </main>
  );
}
