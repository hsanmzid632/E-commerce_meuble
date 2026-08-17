// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-300 mt-20">
      {/* Ligne décorative dorée */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo et description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <span className="text-2xl font-bold text-white">V</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Velveto</h3>
                <p className="text-xs text-amber-400">Luxury Furniture</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Découvrez l'excellence du mobilier haut de gamme. Chaque pièce est
              sélectionnée avec soin pour transformer votre intérieur en un
              espace unique et élégant.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/share/19zZX2mVei/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gradient-to-br hover:from-amber-500 hover:to-orange-600 flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-gray-700 hover:border-transparent"
              >
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/velveto.official?igsh=MXFtaXljNnpkazJweA%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gradient-to-br hover:from-amber-500 hover:to-orange-600 flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-gray-700 hover:border-transparent"
              >
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://wa.me/21622070061"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gradient-to-br hover:from-green-500 hover:to-emerald-600 flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-gray-700 hover:border-transparent"
              >
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.166 1.24 8.413 3.488 2.246 2.247 3.485 5.233 3.484 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.449l-6.306 1.654zm17.574-3.059c5.26-3.033 5.802-6.643 5.802-6.974 0-.331-.188-.543-.414-.73-.216-.181-1.497-1.168-1.728-1.303-.23-.136-.397-.181-.563.181-.164.362-.632 1.303-.774 1.566-.143.265-.287.298-.53.109-.242-.19-1.019-.375-1.942-1.198-.718-.637-1.204-1.423-1.35-1.66-.143-.237-.015-.365.104-.498.107-.107.24-.265.36-.398.119-.132.159-.23.238-.382.079-.151.04-.284-.02-.398-.061-.114-.563-1.357-.77-1.857-.202-.488-.406-.422-.563-.43-.144-.007-.31-.009-.476-.009s-.398.057-.607.284c-.206.228-.784.765-.784 1.861s.803 2.163.914 2.312c.11.151 1.576 2.407 3.82 3.374 2.244.966 2.244.644 2.647.604z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                >
                  Nos Produits
                </Link>
              </li>
              <li>
                <Link
                  to="/my-orders"
                  className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                >
                  Mes Commandes
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                >
                  Panier
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-sm text-gray-400">Tunisie,Sfax</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href="mailto:jihedhnai6@gmail.com"
                  className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                >
                  jihedhnai6@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a
                  href="tel:+21612345678"
                  className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                >
                  +216 22 070 061
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()}{" "}
              <span className="text-amber-400 font-semibold">Velveto</span>.
              Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                to="#"
                className="text-gray-500 hover:text-amber-400 transition-colors"
              >
                Conditions d'utilisation
              </Link>
              <Link
                to="#"
                className="text-gray-500 hover:text-amber-400 transition-colors"
              >
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Effet de lueur en bas */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
    </footer>
  );
}
