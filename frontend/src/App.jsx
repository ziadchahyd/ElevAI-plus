import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddEntry from "./pages/AddEntry";
import Login from "./pages/Login";
import Register from "./pages/Register";



function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("theme", t);
}

/** Remonte en haut à chaque changement de page (évite le scroll qui reste) */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

/** Protège les routes si pas de token */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

/** Navbar (fixe) */
function Topbar({ theme, toggle }) {
  const { pathname } = useLocation();

  // Optionnel: cacher la navbar sur /login (si tu veux)
  const hideOnLogin = pathname === "/login";
  if (hideOnLogin) return null;

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    // retour login
    window.location.href = "/login";
  };

  return (
    <header className="topbar">
      <div className="nav">
        <div className="navLeft">
          <Link to="/login">Profil</Link>
          <Link to="/">Dashboard</Link>
          <Link to="/add">Saisie</Link>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn" onClick={toggle}>
            {theme === "dark" ? "Mode clair" : "Mode sombre"}
          </button>

          <button className="btn" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const t = saved === "light" ? "light" : "dark";
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Topbar theme={theme} toggle={toggle} />

      {/* padding-top pour compenser la topbar fixe (si topbar: position fixed) */}
      <main className="page">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add"
            element={
              <ProtectedRoute>
                <AddEntry />
              </ProtectedRoute>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
