// src/components/layout/Header.jsx
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { useState } from "react";

export default function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `relative px-4 py-2 text-sm font-medium transition-all duration-300 ${
      isActive ? "text-amber-400" : "text-gray-300 hover:text-amber-400"
    }`;

  const navLinkIndicator = (isActive) =>
    isActive ? (
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full shadow-sm shadow-amber-400/50" />
    ) : null;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? "bg-gray-800 text-amber-400"
        : "hover:bg-gray-800/60 text-gray-300"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-lg text-white shadow-2xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-3 transition-transform hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 rounded-2xl blur-md group-hover:blur-lg transition-all" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 backdrop-blur-sm border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-2xl font-bold bg-gradient-to-br from-amber-50 to-amber-200 bg-clip-text text-transparent">
                  V
                </span>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold tracking-tight text-white">
                Velveto
              </div>
              <div className="text-xs text-amber-400/90 -mt-0.5">
                Luxury Furniture
              </div>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  Accueil
                  {navLinkIndicator(isActive)}
                </>
              )}
            </NavLink>

            {/* À propos : toujours visible */}
            <NavLink to="/about" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  À propos
                  {navLinkIndicator(isActive)}
                </>
              )}
            </NavLink>

            {/* NAV CLIENT / PUBLIC */}
            {!isAdmin && (
              <>
                <NavLink to="/products" className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      Produits
                      {navLinkIndicator(isActive)}
                    </>
                  )}
                </NavLink>

                {/* Mes commandes : فقط عند الاتصال */}
                {isAuthenticated && (
                  <NavLink to="/my-orders" className={navLinkClass}>
                    {({ isActive }) => (
                      <>
                        Mes Commandes
                        {navLinkIndicator(isActive)}
                      </>
                    )}
                  </NavLink>
                )}
              </>
            )}

            {/* NAV ADMIN */}
            {isAdmin && (
              <>
                <NavLink to="/admin" className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      Produits
                      {navLinkIndicator(isActive)}
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/orders" className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      Commandes
                      {navLinkIndicator(isActive)}
                    </>
                  )}
                </NavLink>
              </>
            )}
          </nav>

          {/* Actions Droite */}
          <div className="flex items-center gap-3">
            {/* ✅ Panier visible فقط للـ client connecté */}
            {isAuthenticated && !isAdmin && (
              <Link
                to="/cart"
                title="Panier"
                className="group relative p-3 rounded-xl bg-gray-800/60 hover:bg-gray-700/80 backdrop-blur-sm border border-gray-700 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-amber-500/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.4"
                >
                  <defs>
                    <linearGradient id="goldCart" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FFF2B2" />
                      <stop offset="50%" stopColor="#FFB84D" />
                      <stop offset="100%" stopColor="#E5A63A" />
                    </linearGradient>
                  </defs>

                  <path
                    stroke="url(#goldCart)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7h13M7 13l1.5 7M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
                  />
                </svg>

                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold shadow-lg animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth */}
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-xl border-2 border-gray-700 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold hover:from-amber-400 hover:to-orange-500 hover:shadow-xl hover:shadow-amber-500/30 shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Inscription
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/60 backdrop-blur-sm border border-gray-700 shadow-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                    {(user?.fullname || user?.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs text-gray-400">Bienvenue</p>
                    <p className="text-sm font-semibold leading-tight text-gray-200">
                      {user?.fullname || user?.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl border-2 border-gray-700 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Menu Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-gray-800/60 hover:bg-gray-700/80 transition-all duration-300"
            >
              <svg
                className="w-6 h-6 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-800 py-4 space-y-2">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass}
            >
               Accueil
            </NavLink>

            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass}
            >
               À propos
            </NavLink>

            {!isAdmin && (
              <>
                <NavLink
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileLinkClass}
                >
                   Produits
                </NavLink>

                {isAuthenticated && (
                  <NavLink
                    to="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                     Mes Commandes
                  </NavLink>
                )}
              </>
            )}

            {isAdmin && (
              <>
                <NavLink
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileLinkClass}
                >
                   Produits
                </NavLink>
                <NavLink
                  to="/admin/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileLinkClass}
                >
                   Commandes
                </NavLink>
              </>
            )}

            {!isAuthenticated && (
              <div className="pt-4 border-t border-gray-800 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl border-2 border-gray-700 text-sm font-semibold text-center text-gray-300 hover:bg-gray-800 hover:border-amber-500/50 hover:text-amber-400"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold text-center hover:from-amber-400 hover:to-orange-500 shadow-lg"
                >
                  Inscription
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/60 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-base font-bold text-white shadow-md">
                    {(user?.fullname || user?.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">
                      Connecté en tant que
                    </p>
                    <p className="text-sm font-semibold text-gray-200">
                      {user?.fullname || user?.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:border-amber-500/50 hover:text-amber-400 flex items-center justify-center gap-2"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
