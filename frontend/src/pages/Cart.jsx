// src/pages/Cart.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  CreditCard,
} from "lucide-react";

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  const base =
    api?.defaults?.baseURL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  const cleanBase = base.replace(/\/$/, "");
  const cleanPath = String(imageUrl).replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
}

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth(); // ✅ token ici
  const { cart, clearCart, removeFromCart, updateQty } = useCart();

  const [loadingOrder, setLoadingOrder] = useState(false);
  const [formError, setFormError] = useState("");

  const [shipping, setShipping] = useState({
    firstName: user?.firstName || user?.name || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    cin: "",
    birthDate: "",
    address: "",
    city: "",
    postalCode: "",
    governorate: "",
    phone2: "",
    instructions: "",
  });

  const cartCount = useMemo(
    () => (cart || []).reduce((sum, i) => sum + Number(i.qty || 0), 0),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      (cart || []).reduce(
        (sum, i) => sum + Number(i.qty || 0) * Number(i.price || 0),
        0
      ),
    [cart]
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setShipping((p) => ({ ...p, [name]: value }));
  };

  const inc = (item) => {
    const current = Number(item.qty || 1);
    const max = Number(item.stock ?? 999999);
    if (current >= max) return;
    updateQty(item.id, current + 1);
  };

  const dec = (item) => {
    const current = Number(item.qty || 1);
    if (current <= 1) return;
    updateQty(item.id, current - 1);
  };

  const validate = () => {
    if (!isAuthenticated) {
      setFormError("Veuillez vous connecter pour passer une commande.");
      navigate("/login");
      return false;
    }

    if (!cart || cart.length === 0) {
      setFormError("Votre panier est vide.");
      return false;
    }

    const required = [
      ["firstName", "Prénom"],
      ["lastName", "Nom"],
      ["email", "Email"],
      ["phone", "Téléphone"],
      ["address", "Adresse"],
      ["city", "Ville"],
      ["postalCode", "Code postal"],
      ["governorate", "Gouvernorat"],
    ];

    for (const [key, label] of required) {
      if (!String(shipping[key] || "").trim()) {
        setFormError(`Champ obligatoire : ${label}`);
        return false;
      }
    }

    const bad = (cart || []).find(
      (i) => Number(i.qty || 0) > Number(i.stock ?? 999999)
    );
    if (bad) {
      setFormError(
        `Quantité trop grande pour "${bad.title}". Stock disponible: ${bad.stock}`
      );
      return false;
    }

    setFormError("");
    return true;
  };

  // ✅ Passer commande (version corrigée)
  const placeOrder = async () => {
    if (!validate()) return;

    try {
      setLoadingOrder(true);

      // ✅ forcer un shipping propre (nom toujours rempli)
      const cleanShipping = {
        ...shipping,
        firstName: String(shipping.firstName || "").trim(),
        lastName: String(shipping.lastName || "").trim(),
        email: String(shipping.email || "").trim(),
        phone: String(shipping.phone || "").trim(),
      };

      // ✅ IMPORTANT: backend attend quantity + unit_price
      const payload = {
        items: (cart || []).map((i) => ({
          product_id: i.id,
          quantity: Number(i.qty),          // ✅ OK
          unit_price: Number(i.price),      // ✅ OK (pas price)
        })),
        shipping: cleanShipping,            // ✅ toutes les infos client
        total: Number(cartTotal),
      };

      await api.post("/orders", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      clearCart();
      navigate("/my-orders");
    } catch (e) {
      console.error(e);
      setFormError(
        e?.response?.data?.message || "Erreur lors de la commande. Réessayez."
      );
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/products")}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-700 hover:text-orange-600 transition-all duration-300 shadow-sm hover:shadow-md mb-6"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Continuer vos achats</span>
          </button>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-900 to-orange-900 bg-clip-text text-transparent mb-2">
                Votre panier
              </h1>
              <p className="text-slate-600 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                {cartCount} article(s) dans votre panier
              </p>
            </div>

            <button
              onClick={() => clearCart()}
              disabled={!cart?.length}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Vider le panier</span>
            </button>
          </div>
        </div>

        {/* Erreur formulaire */}
        {formError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne gauche */}
          <div className="lg:col-span-2 space-y-6">
            {/* Infos livraison */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Informations de livraison
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4">
                    Informations personnelles
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="firstName"
                        value={shipping.firstName}
                        onChange={onChange}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                        placeholder="Votre prénom"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="lastName"
                        value={shipping.lastName}
                        onChange={onChange}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                        placeholder="Votre nom"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={shipping.email}
                        onChange={onChange}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                        placeholder="exemple@mail.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        value={shipping.phone}
                        onChange={onChange}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                        placeholder="+216 XX XXX XXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        CIN (Facultatif)
                      </label>
                      <input
                        name="cin"
                        value={shipping.cin}
                        onChange={onChange}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                        placeholder="Numéro CIN"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Date de naissance (Facultatif)
                      </label>
                      <input
                        name="birthDate"
                        type="date"
                        value={shipping.birthDate}
                        onChange={onChange}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">
                    Adresse de livraison
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Adresse complète <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="address"
                        value={shipping.address}
                        onChange={onChange}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                        placeholder="Numéro et nom de rue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Ville <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="city"
                        value={shipping.city}
                        onChange={onChange}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                        placeholder="Tunis, Sfax, Sousse..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Code postal <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="postalCode"
                        value={shipping.postalCode}
                        onChange={onChange}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                        placeholder="1000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Gouvernorat <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="governorate"
                        value={shipping.governorate}
                        onChange={onChange}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="tunis">Tunis</option>
                        <option value="ariana">Ariana</option>
                        <option value="ben-arous">Ben Arous</option>
                        <option value="manouba">Manouba</option>
                        <option value="sfax">Sfax</option>
                        <option value="sousse">Sousse</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Téléphone supplémentaire (Facultatif)
                      </label>
                      <input
                        name="phone2"
                        value={shipping.phone2}
                        onChange={onChange}
                        type="tel"
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                        placeholder="+216 XX XXX XXX"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Instructions de livraison (Facultatif)
                      </label>
                      <textarea
                        name="instructions"
                        value={shipping.instructions}
                        onChange={onChange}
                        rows={2}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all resize-none"
                        placeholder="Bâtiment, étage, code porte..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-amber-50/30">
                <h2 className="text-xl font-bold text-slate-900">Vos articles</h2>
              </div>

              {!cart?.length ? (
                <div className="p-10 text-center">
                  <p className="text-slate-600">Votre panier est vide.</p>
                  <button
                    onClick={() => navigate("/products")}
                    className="mt-4 px-6 py-3 rounded-xl bg-gray-900 text-amber-300 hover:bg-gray-800 transition font-semibold"
                  >
                    Voir les produits
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const outOfStock = Number(item.stock) <= 0;
                  const max = Number(item.stock ?? 999999);
                  const img = resolveImageUrl(item.image_url);

                  return (
                    <div
                      key={item.id}
                      className="p-6 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex gap-6">
                        <div className="relative group">
                          <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 shadow-md">
                            {img ? (
                              <img
                                src={img}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                Aucune image
                              </div>
                            )}
                          </div>

                          {outOfStock && (
                            <div className="absolute inset-0 rounded-2xl bg-black/55 flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                Rupture de stock
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                              {item.title}
                            </h3>
                            <p className="text-xl font-bold text-orange-600">
                              {Number(item.price).toFixed(2)} DT
                            </p>
                          </div>

                          <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => dec(item)}
                                disabled={Number(item.qty) <= 1}
                                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-600 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              <input
                                type="number"
                                min="1"
                                max={max}
                                value={item.qty}
                                readOnly
                                className="w-16 h-9 rounded-lg border-2 border-slate-200 text-center text-sm font-semibold focus:outline-none"
                              />

                              <button
                                onClick={() => inc(item)}
                                disabled={Number(item.qty) >= max || outOfStock}
                                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-600 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex-1 text-right">
                              <p className="text-sm text-slate-500 mb-1">Sous-total</p>
                              <p className="text-2xl font-bold text-slate-900">
                                {(Number(item.qty) * Number(item.price)).toFixed(2)} DT
                              </p>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all hover:scale-110"
                              aria-label="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Colonne droite - résumé */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-amber-500 to-orange-600">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Résumé</h2>
                  </div>
                  <p className="text-white/90 text-sm">Paiement à la livraison</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="text-slate-600">Sous-total</span>
                    <span className="font-semibold text-slate-900">
                      {cartTotal.toFixed(2)} DT
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="text-slate-600">Livraison</span>
                    <span className="font-semibold text-emerald-600">Gratuite</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-slate-900">Total TTC</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {cartTotal.toFixed(2)} DT
                    </span>
                  </div>

                  <button
                    onClick={placeOrder}
                    disabled={loadingOrder || !cart?.length}
                    className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingOrder ? "Traitement..." : "Passer la commande"}
                  </button>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h3 className="font-bold text-slate-900">Nos garanties</h3>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-600">⚡</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Livraison rapide
                    </p>
                    <p className="text-xs text-slate-600">
                      Sous 48h partout en Tunisie
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600">🛡️</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Garantie 6 mois
                    </p>
                    <p className="text-xs text-slate-600">Sur tous nos produits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>{/* grid */}
      </div>
    </main>
  );
}
