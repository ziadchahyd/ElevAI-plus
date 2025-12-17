import { useState } from "react";
import { register, login } from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    age: 22,
    genre: "M",
    taille_cm: 173,
    poids_kg: 65,
    objectif: "Mieux dormir",
  });

  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const payload = {
      username: form.username.trim(),
      password: form.password,
      age: Number(form.age),
      genre: form.genre.trim().toUpperCase(),
      taille_cm: Number(form.taille_cm),
      poids_kg: Number(form.poids_kg),
      objectif: form.objectif.trim(),
    };

    try {
      await register(payload);

      const res = await login(payload.username, payload.password);
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("username", payload.username);

      setMsg("✅ Compte créé & connecté !");
      navigate("/" ,{ replace: true });
    } catch (err) {
      const data = err?.response?.data;

      if (Array.isArray(data?.detail)) {
        const text = data.detail
          .map((d) => `• ${d.loc?.slice(1).join(".")}: ${d.msg}`)
          .join("\n");
        setMsg("❌ " + text);
      } else if (typeof data?.detail === "string") {
        setMsg("❌ " + data.detail);
      } else {
        setMsg("❌ Erreur inscription");
      }
    }
  };

  return (
    <div className="container" data-testid="register-page">
      <h1>Inscription</h1>

      <form
        onSubmit={onSubmit}
        className="card"
        style={{ maxWidth: 720 }}
        data-testid="register-form"
      >
        <label>Username</label>
        <input
          data-testid="register-username"
          value={form.username}
          onChange={(e) => update("username", e.target.value)}
          required
        />

        <label style={{ marginTop: 12 }}>Password</label>
        <input
          data-testid="register-password"
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 12,
          }}
        >
          <div>
            <label>Âge</label>
            <input
              data-testid="register-age"
              type="number"
              value={form.age}
              onChange={(e) => update("age", Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label>Genre</label>
            <input
              data-testid="register-genre"
              value={form.genre}
              onChange={(e) => update("genre", e.target.value)}
              required
            />
          </div>

          <div>
            <label>Taille (cm)</label>
            <input
              data-testid="register-taille"
              type="number"
              value={form.taille_cm}
              onChange={(e) =>
                update("taille_cm", Number(e.target.value))
              }
              required
            />
          </div>

          <div>
            <label>Poids (kg)</label>
            <input
              data-testid="register-poids"
              type="number"
              value={form.poids_kg}
              onChange={(e) =>
                update("poids_kg", Number(e.target.value))
              }
              required
            />
          </div>
        </div>

        <label style={{ marginTop: 12 }}>Objectif</label>
        <input
          data-testid="register-objectif"
          value={form.objectif}
          onChange={(e) => update("objectif", e.target.value)}
          required
        />

        <button
          className="btn"
          style={{ marginTop: 16 }}
          data-testid="register-submit"
        >
          Créer mon compte
        </button>

        {msg && (
          <pre
            style={{ marginTop: 10, whiteSpace: "pre-wrap" }}
            data-testid="register-msg"
          >
            {msg}
          </pre>
        )}

        <p style={{ marginTop: 10 }}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
