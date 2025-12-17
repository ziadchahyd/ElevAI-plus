import { useEffect, useMemo, useState } from "react";
import { login } from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const navigate = useNavigate();

  const isAuthed = useMemo(() => {
    return !!localStorage.getItem("access_token");
  }, []);

  useEffect(() => {
    if (isAuthed) navigate("/", { replace: true });
  }, [isAuthed, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setLoading(true);

    try {
      const res = await login(username.trim(), password);
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("username", username.trim());

      setMsg({ type: "success", text: "Connexion réussie. Redirection…" });
      navigate("/", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      let text = "❌ Connexion impossible.";
      if (status === 401) text = "❌ Identifiants invalides.";
      if (typeof detail === "string") text = `❌ ${detail}`;

      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout" data-testid="login-page">
      <div className="auth-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            alignItems: "center",
          }}
        >
          {/* LEFT */}
          <div>
            <h1 style={{ margin: 0, fontSize: 48 }}>Connexion</h1>
            <p style={{ marginTop: 12, opacity: 0.75, lineHeight: 1.6 }}>
              Accède à ton <b>dashboard</b>, saisis tes données quotidiennes et
              reçois des recommandations personnalisées.
            </p>
          </div>

          {/* RIGHT */}
          <form
            onSubmit={onSubmit}
            className="card"
            data-testid="login-form"
          >
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontWeight: 700 }}>Nom d’utilisateur</label>
                <input
                  data-testid="login-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex : ziad"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label style={{ fontWeight: 700 }}>Mot de passe</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    data-testid="login-password"
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowPwd((v) => !v)}
                    style={{ padding: "10px 12px" }}
                    data-testid="login-toggle-password"
                  >
                    {showPwd ? "Masquer" : "Afficher"}
                  </button>
                </div>
              </div>

              <button
                className="btn"
                disabled={loading}
                data-testid="login-submit"
              >
                {loading ? "Connexion…" : "Se connecter"}
              </button>

              {msg.text && (
                <div
                  className="card"
                  data-testid="login-msg"
                  style={{
                    background:
                      msg.type === "error"
                        ? "rgba(220,38,38,0.1)"
                        : "rgba(34,197,94,0.1)",
                  }}
                >
                  <b>{msg.text}</b>
                </div>
              )}

              <p style={{ margin: 0, opacity: 0.8 }}>
                Pas de compte ? <Link to="/register">Créer un compte</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
