// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import heroLogo from "../assets/image.jpg";

export default function Home() {
  const { isAdmin, isAuthenticated } = useAuth();

  // 🟣 Vue spéciale ADMIN
  if (isAdmin) {
    return (
      <main className="flex-1 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-neutral-900 to-stone-900">
          <div className="absolute inset-0 opacity-50">
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80"
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-gray-900/60 to-black/70" />

          <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-gray-800/40 backdrop-blur-sm border border-amber-500/30 px-4 py-1.5 rounded-full mb-6 shadow-lg">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-amber-100 uppercase tracking-wider">
                    Espace Administrateur
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-amber-50 mb-4 leading-tight">
                  Bienvenue sur
                  <span className="block bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 bg-clip-text text-transparent">
                    Velveto Admin
                  </span>
                </h1>

                <p className="text-lg text-amber-100/90 leading-relaxed">
                  Votre centre de contrôle pour gérer l&apos;ensemble de votre boutique.
                  Produits, catégories, commandes — tout est à portée de main.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-auto">
                <Link
                  to="/admin"
                  className="group relative overflow-hidden rounded-2xl bg-gray-800/30 hover:bg-gray-700/40 backdrop-blur-md border border-amber-500/30 px-6 py-5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg">
                      <span className="text-2xl">📦</span>
                    </div>
                    <h3 className="text-lg font-semibold text-amber-50 mb-1">Produits</h3>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      Gérer votre catalogue complet
                    </p>
                  </div>
                </Link>

                <Link
                  to="/admin#categories"
                  className="group relative overflow-hidden rounded-2xl bg-gray-800/30 hover:bg-gray-700/40 backdrop-blur-md border border-amber-500/30 px-6 py-5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg">
                      <span className="text-2xl">🏷️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-amber-50 mb-1">Catégories</h3>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      Organiser vos collections
                    </p>
                  </div>
                </Link>

                <Link
                  to="/admin/orders"
                  className="group relative overflow-hidden rounded-2xl bg-gray-800/30 hover:bg-gray-700/40 backdrop-blur-md border border-amber-500/30 px-6 py-5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h3 className="text-lg font-semibold text-amber-50 mb-1">Commandes</h3>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      Suivre toutes les ventes
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group relative overflow-hidden bg-white rounded-3xl border border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-amber-900">Produits actifs</span>
                  <span className="text-2xl">🛋️</span>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-amber-900 to-orange-900 bg-clip-text text-transparent mb-2">
                  —
                </p>
                <p className="text-sm text-amber-700/70">Données à venir</p>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white rounded-3xl border border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-amber-900">Commandes récentes</span>
                  <span className="text-2xl">🛒</span>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-amber-900 to-orange-900 bg-clip-text text-transparent mb-2">
                  —
                </p>
                <p className="text-sm text-amber-700/70">Consultez l&apos;onglet commandes</p>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white rounded-3xl border border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-600/10 to-orange-600/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-amber-900">Catégories</span>
                  <span className="text-2xl">📂</span>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-amber-900 to-orange-900 bg-clip-text text-transparent mb-2">
                  —
                </p>
                <p className="text-sm text-amber-700/70">Organisez votre catalogue</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // 🟢 Vue CLIENT (non admin)
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden">
        {/* Image de fond */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-gray-900/70 to-black/75" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Texte */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-1.5 rounded-full mb-6 shadow-xl">
                  <span className="w-2 h-2 bg-amber-100 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Nouveau sur Velveto
                  </span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                  Le luxe accessible
                  <span className="block bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                    pour votre intérieur
                  </span>
                </h1>

                <p className="text-lg text-amber-100/90 leading-relaxed max-w-xl">
                  Découvrez Velveto, votre destination pour un mobilier moderne et élégant.
                  Du salon à la chambre, créez l&apos;espace de vos rêves avec nos collections
                  exclusives.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="group relative overflow-hidden px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-amber-950 font-bold shadow-2xl hover:shadow-amber-400/50 transition-all duration-300 hover:scale-105"
                >
                  <span className="relative z-10">Explorer la collection</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                {/* ✅ Afficher uniquement si NON connecté */}
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="px-8 py-4 rounded-full border-2 border-amber-400/80 text-amber-100 font-semibold hover:bg-amber-500/20 hover:border-amber-300 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    Créer un compte
                  </Link>
                )}
              </div>

              {/* ✅ Stats supprimées (500+,10k+,4.9) */}
            </div>

            {/* Logo */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute -inset-8 bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-amber-600/20 blur-3xl rounded-3xl" />
              <div className="relative w-full max-w-2xl aspect-[4/3] flex items-center justify-center">
                <img
                  src={heroLogo}
                  alt="Logo Velveto"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 overflow-hidden">
        {/* Arrière-plan décoratif */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white -z-10"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-400/20 to-amber-400/20 rounded-full blur-3xl -z-10"></div>

        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 text-amber-700 text-sm font-semibold">
              Nos Avantages
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-amber-950 mb-4">
            Pourquoi choisir{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
                Velveto
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                <path d="M0 4C50 7 150 7 200 4" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </svg>
            </span>{" "}
            ?
          </h2>
          <p className="text-lg text-amber-800/80 max-w-2xl mx-auto">
            Une expérience d&apos;achat unique avec des avantages exclusifs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="group relative p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-amber-100 hover:bg-white hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-xl shadow-amber-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-900 to-orange-900 bg-clip-text text-transparent mb-3">
                Livraison rapide
              </h3>
              <p className="text-amber-700/90 leading-relaxed">
                Recevez vos meubles en 48h partout en Tunisie avec un suivi en temps réel
              </p>
            </div>
          </div>

          <div className="group relative p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-amber-100 hover:bg-white hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-6 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-xl shadow-orange-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-900 to-amber-900 bg-clip-text text-transparent mb-3">
                Qualité garantie
              </h3>
              <p className="text-amber-700/90 leading-relaxed">
                Tous nos produits sont sélectionnés avec soin et garantis 6 mois
              </p>
            </div>
          </div>

          <div className="group relative p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-amber-100 hover:bg-white hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center mb-6 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-xl shadow-amber-600/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-900 to-orange-900 bg-clip-text text-transparent mb-3">
                Paiement sécurisé
              </h3>
              <p className="text-amber-700/90 leading-relaxed">
                Payez en toute sécurité avec nos solutions de paiement certifiées
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
