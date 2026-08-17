import { useEffect, useState, useMemo } from "react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_LABELS = {
  all: "Toutes",
  pending: "En attente",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const load = async () => {
      setError("");
      setLoading(true);
      try {
        const res = await api.get("/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            "Erreur lors du chargement des commandes.",
        );
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  const handleStatusChange = async (orderId, newStatus) => {
    setError("");
    setSavingId(orderId);
    try {
      await api.patch(
        `/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      setSelectedOrder((prev) =>
        prev && prev.id === orderId ? { ...prev, status: newStatus } : prev,
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour du statut.",
      );
    } finally {
      setSavingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const getShipping = (o) => {
    const fullName = o.customer_name || "";

    const parts = fullName.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

    return {
      firstName,
      lastName,

      email: o.customer_email,
      phone: o.customer_phone,

      cin: o.customer_cin,
      birthDate: o.customer_birthdate,

      address: o.customer_address,
      city: o.customer_city,
      postalCode: o.customer_postal_code,
      governorate: o.customer_governorate,

      phone2: o.customer_phone2,
      instructions: o.customer_instructions,
    };
  };

  const handlePrintSelectedOrder = () => {
    if (!selectedOrder) return;

    const win = window.open("", "_blank");
    if (!win) return;

    const s = getShipping(selectedOrder);
    const statusLabel =
      STATUS_LABELS[selectedOrder.status] ?? selectedOrder.status;
    const createdAt = selectedOrder.created_at
      ? new Date(selectedOrder.created_at).toLocaleString("fr-FR")
      : "—";

    const itemsRows = (selectedOrder.items || [])
      .map((item) => {
        const title = item.product_title || `Produit #${item.product_id || ""}`;
        return `
          <tr>
            <td style="padding: 6px; border: 1px solid #ddd;">${title}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${Number(item.unit_price).toFixed(2)} DT</td>
            <td style="padding: 6px; border: 1px solid #ddd;">${(Number(item.unit_price) * item.quantity).toFixed(2)} DT</td>
          </tr>
        `;
      })
      .join("");

    win.document.write(`
      <!doctype html>
      <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Commande #${selectedOrder.id}</title>
        <style>
          body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color:#0f172a; padding:24px; }
          h1 { font-size:20px; margin-bottom:4px; }
          h2 { font-size:16px; margin-top:16px; margin-bottom:4px; }
          .muted { color:#64748b; font-size:12px; }
          .section { margin-top:12px; margin-bottom:10px; }
          table { border-collapse: collapse; width:100%; font-size:12px; margin-top:6px; }
          th { background:#f1f5f9; border:1px solid #e2e8f0; padding:6px; text-align:left; }
          td { border:1px solid #e2e8f0; padding:6px; }
          .total { text-align:right; margin-top:10px; font-weight:600; }
          .badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px; background:#e0f2fe; color:#0369a1; }
          .grid { display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:8px; }
        </style>
      </head>
      <body>
        <h1>Commande #${selectedOrder.id}</h1>
        <div class="muted">Date : ${createdAt}</div>
        <div class="muted">Statut : <span class="badge">${statusLabel}</span></div>

        <div class="section">
          <h2>Informations client</h2>
          <div class="grid">
            <div><strong>Nom :</strong> ${s.firstName || "—"} ${s.lastName || ""}</div>
            <div><strong>Email :</strong> ${s.email || "—"}</div>
            <div><strong>Téléphone :</strong> ${s.phone || "—"}</div>
            <div><strong>Téléphone 2 :</strong> ${s.phone2 || "—"}</div>
            <div><strong>CIN :</strong> ${s.cin || "—"}</div>
            <div><strong>Naissance :</strong> ${s.birthDate ? new Date(s.birthDate).toLocaleDateString("fr-FR") : "—"}</div>
            <div style="grid-column:1/3"><strong>Adresse :</strong> ${s.address || "—"}</div>
            <div><strong>Ville :</strong> ${s.city || "—"}</div>
            <div><strong>Code postal :</strong> ${s.postalCode || "—"}</div>
            <div><strong>Gouvernorat :</strong> ${s.governorate || "—"}</div>
            <div style="grid-column:1/3"><strong>Instructions :</strong> ${s.instructions || "—"}</div>
          </div>
        </div>

        <div class="section">
          <h2>Articles</h2>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Sous-total</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>
          <div class="total">Total : ${Number(selectedOrder.total).toFixed(2)} DT</div>
        </div>
      </body>
      </html>
    `);

    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <main className="flex-1 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Gestion des commandes
            </h1>
            <p className="text-sm text-slate-600">
              Vue d&apos;ensemble des commandes clients.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "all",
              "pending",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                  statusFilter === s
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <p className="text-sm text-slate-500">Chargement des commandes…</p>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {!loading && filteredOrders.length === 0 && !error && (
          <p className="text-sm text-slate-500">
            Aucune commande pour ce filtre.
          </p>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-2 border-b border-slate-200">#</th>
                  <th className="px-4 py-2 border-b border-slate-200">
                    Client
                  </th>
                  <th className="px-4 py-2 border-b border-slate-200">Date</th>
                  <th className="px-4 py-2 border-b border-slate-200">Total</th>
                  <th className="px-4 py-2 border-b border-slate-200">
                    Statut
                  </th>
                  <th className="px-4 py-2 border-b border-slate-200">
                    Articles
                  </th>
                  <th className="px-4 py-2 border-b border-slate-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const s = getShipping(order);
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-slate-100 hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-2 align-top">#{order.id}</td>

                      <td className="px-4 py-2 align-top">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {s.firstName || "—"} {s.lastName || ""}
                          </span>
                          <span className="text-xs text-slate-500">
                            {s.email || ""}
                          </span>
                          <span className="text-xs text-slate-500">
                            {s.phone || ""}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-2 align-top text-xs text-slate-600">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString("fr-FR")
                          : "—"}
                      </td>

                      <td className="px-4 py-2 align-top font-semibold text-slate-900">
                        {Number(order.total).toFixed(2)} DT
                      </td>

                      <td className="px-4 py-2 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-600">
                            {STATUS_LABELS[order.status] ?? order.status}
                          </span>
                          <select
                            className="text-xs rounded-lg border border-slate-300 px-2 py-1 bg-white"
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            disabled={savingId === order.id}
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {STATUS_LABELS[st]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="px-4 py-2 align-top text-xs text-slate-600">
                        <ul className="space-y-1">
                          {(order.items || []).map((item, idx) => (
                            <li key={idx}>
                              {item.product_title ||
                                `Produit #${item.product_id}`}{" "}
                              — {item.quantity}x (
                              {Number(item.unit_price).toFixed(2)} DT)
                            </li>
                          ))}
                        </ul>
                      </td>

                      <td className="px-4 py-2 align-top">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs rounded-full px-3 py-1 bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100"
                        >
                          Voir détail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {selectedOrder &&
          (() => {
            const s = getShipping(selectedOrder);
            return (
              <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Détail de la commande #{selectedOrder.id}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrintSelectedOrder}
                      className="text-xs rounded-full px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    >
                      Imprimer / PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Fermer
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Client
                    </p>
                    <p className="font-medium">
                      {s.firstName || "—"} {s.lastName || ""}
                    </p>
                    <p className="text-xs text-slate-600">
                      Email : {s.email || "—"}
                    </p>
                    <p className="text-xs text-slate-600">
                      Téléphone : {s.phone || "—"}
                    </p>
                    {s.phone2 && (
                      <p className="text-xs text-slate-600">
                        Téléphone 2 : {s.phone2}
                      </p>
                    )}
                    {s.cin && (
                      <p className="text-xs text-slate-600">CIN : {s.cin}</p>
                    )}
                    {s.birthDate && (
                      <p className="text-xs text-slate-600">
                        Naissance :{" "}
                        {new Date(s.birthDate).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Livraison
                    </p>
                    <p className="text-xs text-slate-600">
                      Adresse : {s.address || "—"}
                    </p>
                    <p className="text-xs text-slate-600">
                      Ville : {s.city || "—"}
                    </p>
                    <p className="text-xs text-slate-600">
                      Code postal : {s.postalCode || "—"}
                    </p>
                    <p className="text-xs text-slate-600">
                      Gouvernorat : {s.governorate || "—"}
                    </p>
                    {s.instructions && (
                      <p className="text-xs text-slate-600">
                        Instructions : {s.instructions}
                      </p>
                    )}
                    <p className="text-xs text-slate-600">
                      Date :{" "}
                      {selectedOrder.created_at
                        ? new Date(selectedOrder.created_at).toLocaleString(
                            "fr-FR",
                          )
                        : "—"}
                    </p>
                    <p className="text-xs text-slate-600">
                      Statut :{" "}
                      <span className="font-medium">
                        {STATUS_LABELS[selectedOrder.status] ??
                          selectedOrder.status}
                      </span>
                    </p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      Total : {Number(selectedOrder.total).toFixed(2)} DT
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                    Articles
                  </p>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>
                          {item.product_title || `Produit #${item.product_id}`}{" "}
                          — {item.quantity}x
                        </span>
                        <span>
                          {(Number(item.unit_price) * item.quantity).toFixed(2)}{" "}
                          DT
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })()}
      </div>
    </main>
  );
}
