import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logo =
    theme === "nonedible"
      ? "https://i.ibb.co/nM20FT5t/Green-Logo.jpg"
      : "https://i.ibb.co/d0NpdWn9/Logo.png";

  const buttonClass =
    theme === "nonedible"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : "bg-orange-600 hover:bg-orange-700";

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b shadow">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        {/* LOGO */}
        <img src={logo} alt="Logo" className="h-12 rounded-lg shadow-md" />

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          <Link
            to="/"
            className={location.pathname === "/" ? "text-orange-700 font-semibold" : ""}
          >
            Home
          </Link>

          <Link to="/edible">Edible</Link>
          <Link to="/non-edible">Non-Edible</Link>

          

          <Link to="/directory">Directory</Link>
          <Link to="/listings">Listings</Link>
          <Link to="/contact">Support</Link>

          {user && (
            <Link
              to="/dashboard"
              className="bg-orange-500 text-white px-4 py-2 rounded-xl"
            >
              Dashboard
            </Link>
          )}

          <button
            onClick={user ? logout : () => (window.location.href = "/auth")}
            className={`px-4 py-2 rounded-xl text-white ${buttonClass}`}
          >
            {user ? "Logout" : "Login"}
          </button>
        </div>

        {/* MOBILE BUTTON */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu />
        </button>
      </nav>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-white px-6 py-4 space-y-3">
          <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/edible" onClick={() => setMobileOpen(false)}>Edible</Link>
          <Link to="/non-edible" onClick={() => setMobileOpen(false)}>Non-Edible</Link>

          <Link
            to="/products"
            className="font-semibold text-[#4A7F84]"
            onClick={() => setMobileOpen(false)}
          >
            Products
          </Link>

          <Link to="/products/medications" onClick={() => setMobileOpen(false)}>
            Medications
          </Link>
          <Link to="/products/accessories" onClick={() => setMobileOpen(false)}>
            Accessories
          </Link>
          <Link to="/products/resalable-clothes" onClick={() => setMobileOpen(false)}>
            Resalable Clothes
          </Link>

          <Link to="/directory" onClick={() => setMobileOpen(false)}>Directory</Link>
          <Link to="/listings" onClick={() => setMobileOpen(false)}>Listings</Link>
          <Link to="/contact" onClick={() => setMobileOpen(false)}>Support</Link>

          <button
            onClick={() => {
              user ? logout() : (window.location.href = "/auth");
              setMobileOpen(false);
            }}
            className={`w-full py-2 rounded-xl text-white ${buttonClass}`}
          >
            {user ? "Logout" : "Login"}
          </button>
        </div>
      )}
    </header>
  );
}
