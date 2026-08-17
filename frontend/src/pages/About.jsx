import React from "react";
import { Link } from "react-router-dom";
import { Target, Layers, Shield, Lock, ShoppingCart } from "lucide-react";

export default function About() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-amber-300/15 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-medium text-orange-800 mb-6">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            À propos
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            <span className="text-slate-900">Velveto</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
            Velveto est une plateforme e-commerce dédiée au mobilier moderne et élégant.
            Elle permet de découvrir des produits, consulter leurs détails et, pour les
            utilisateurs connectés, gérer un panier et suivre des commandes.
          </p>

          {/* ✅ Boutons fonctionnels */}
          <div className="mt-8 flex gap-3 flex-wrap">
            <Link
              to="/products"
              className="group rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3.5 font-semibold text-white shadow-md hover:shadow-lg transition-all"
            >
              <span className="flex items-center gap-2">
                Voir les produits
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </Link>

            <Link
              to="/register"
              className="rounded-xl border-2 border-slate-300 bg-white px-8 py-3.5 font-semibold text-slate-800 hover:bg-slate-50 transition"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      {/* OBJECTIFS */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-50/50 to-amber-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Objectif</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Proposer une expérience simple pour rechercher et choisir du mobilier,
                avec un parcours clair du catalogue jusqu'à la commande.
              </p>
            </div>
          </div>

          <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-50/50 to-amber-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Fonctionnement</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sans compte, vous pouvez consulter le site et voir les produits.
                Avec un compte, vous accédez au panier, aux commandes et au suivi.
              </p>
            </div>
          </div>

          <div className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-50/50 to-amber-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Engagement</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Offrir une navigation lisible, des fiches produits propres et un espace
                client pratique pour consulter l'historique des commandes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ACCÈS */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Accès aux fonctionnalités
          </h2>
          <p className="text-slate-600 mb-8">
            Découvrez les différents niveaux d'accès selon votre statut
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* NON CONNECTÉ */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50 p-8">
              <div className="absolute top-4 right-4">
                <Lock className="h-8 w-8 text-slate-300" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-4">Non connecté</h3>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span>Accès au contenu : Accueil, Produits, À propos</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span>Consultation des fiches produits</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-500">
                  <span className="text-slate-300 font-bold">✕</span>
                  <span>Pas de panier</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-500">
                  <span className="text-slate-300 font-bold">✕</span>
                  <span>Pas de commande</span>
                </li>
              </ul>

              {/* ✅ Lien fonctionnel */}
              <Link
                to="/login"
                className="block text-center w-full rounded-xl border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 hover:bg-slate-50 transition"
              >
                Se connecter
              </Link>
            </div>

            {/* CONNECTÉ */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/50 p-8">
              <div className="absolute top-4 right-4">
                <ShoppingCart className="h-8 w-8 text-orange-400" />
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white mb-3">
                Recommandé
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-4">Connecté</h3>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span>Accès complet aux pages</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span>Ajout au panier</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span>Passer une commande</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span>Suivre ses commandes</span>
                </li>
              </ul>

              {/* ✅ Lien fonctionnel */}
              <Link
                to="/products"
                className="block text-center w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 font-semibold text-white shadow-md hover:shadow-lg transition-all"
              >
                Aller au catalogue
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-r from-orange-500 to-amber-500 p-10 text-white shadow-xl">
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-black/10 blur-2xl" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-bold mb-2">Découvrez l'univers Velveto</h3>
              <p className="text-white/90 max-w-lg">
                Une expérience premium pour découvrir et acheter du mobilier moderne avec style.
              </p>
            </div>

            {/* ✅ Lien fonctionnel */}
            <Link
              to="/register"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-orange-700 hover:bg-slate-50 transition shadow-md whitespace-nowrap"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <p className="pb-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Velveto — Luxury Furniture.
      </p>
    </main>
  );
}
