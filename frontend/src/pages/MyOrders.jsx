// src/pages/MyOrders.jsx
import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function MyOrders() {
  const { token, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔒 Si admin → pas de page "Mes commandes"
  useEffect(() => {
    if (isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const load = async () => {
      setError("");
      setLoading(true);
      try {
        const res = await api.get("/orders/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            "Erreur lors du chargement de vos commandes."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token && !isAdmin) {
      load();
    }
  }, [token, isAdmin]);

  return (
    <main className="flex-1 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Mes commandes
            </h1>
            <p className="text-sm text-slate-600">
              Suivez l&apos;historique de vos achats.
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            ← Retour à la boutique
          </Link>
        </div>

        {loading && (
          <p className="text-sm text-slate-500">Chargement de vos commandes…</p>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {!loading && orders.length === 0 && !error && (
          <p className="text-sm text-slate-500">
            Vous n&apos;avez pas encore passé de commande.
          </p>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-5 space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Commande #{order.id}
                  </p>
                  <p className="text-sm text-slate-600">
                    Passée le{" "}
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString("fr-FR")
                      : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    Statut :{" "}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </span>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    Total : {Number(order.total).toFixed(2)} DT
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  Articles
                </p>
                <div className="space-y-1">
                  {(order.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs text-slate-600"
                    >
                      <span>
                        {item.product_title || `Produit #${item.product_id}`} —{" "}
                        {item.quantity}x
                      </span>
                      <span>
                        {(Number(item.unit_price) * item.quantity).toFixed(
                          2
                        )}{" "}
                        DT
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {(order.customer_name ||
                order.customer_email ||
                order.customer_address) && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    Informations client
                  </p>
                  <p className="text-xs text-slate-600">
                    {order.customer_name && (
                      <>
                        <span className="font-medium">
                          {order.customer_name}
                        </span>{" "}
                      </>
                    )}
                    {order.customer_email && <>– {order.customer_email} </>}
                    {order.customer_phone && <>– {order.customer_phone} </>}
                    {order.customer_address && (
                      <span className="block">
                        Adresse : {order.customer_address}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
