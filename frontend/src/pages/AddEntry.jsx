import { useState } from "react";
import { addMyData } from "../api/api";

export default function AddEntry() {
  const [form, setForm] = useState({
    date: "",
    sommeil_h: 7,
    pas: 8000,
    sport_min: 20,
    calories: 2200,
    humeur_0_5: 3,
    stress_0_5: 2,
    fc_repos: 70,
  });

  const [msg, setMsg] = useState("");
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      await addMyData(form);
      setMsg("✅ Données enregistrées !");
    } catch (err) {
      console.error(err);
      setMsg("❌ Erreur : token invalide ou champs incorrects.");
    }
  };

  return (
    <div className="container" data-testid="addentry-page">
      <h1>Saisie quotidienne</h1>

      <form
        className="card"
        onSubmit={submit}
        style={{ maxWidth: 720 }}
        data-testid="addentry-form"
      >
        <label>Date (YYYY-MM-DD) ou (DD/MM/YYYY)</label>
        <input
          data-testid="addentry-date"
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
          placeholder="2025-12-16"
          required
        />

        <label>Sommeil (h)</label>
        <input
          data-testid="addentry-sommeil"
          type="number"
          step="0.1"
          value={form.sommeil_h}
          onChange={(e) => update("sommeil_h", Number(e.target.value))}
        />

        <label>Pas</label>
        <input
          data-testid="addentry-pas"
          type="number"
          value={form.pas}
          onChange={(e) => update("pas", Number(e.target.value))}
        />

        <label>Sport (min)</label>
        <input
          data-testid="addentry-sport"
          type="number"
          value={form.sport_min}
          onChange={(e) => update("sport_min", Number(e.target.value))}
        />

        <label>Calories</label>
        <input
          data-testid="addentry-calories"
          type="number"
          value={form.calories}
          onChange={(e) => update("calories", Number(e.target.value))}
        />

        <label>Humeur (0–5)</label>
        <input
          data-testid="addentry-humeur"
          type="number"
          min="0"
          max="5"
          value={form.humeur_0_5}
          onChange={(e) => update("humeur_0_5", Number(e.target.value))}
        />

        <label>Stress (0–5)</label>
        <input
          data-testid="addentry-stress"
          type="number"
          min="0"
          max="5"
          value={form.stress_0_5}
          onChange={(e) => update("stress_0_5", Number(e.target.value))}
        />

        <label>FC repos</label>
        <input
          data-testid="addentry-fc"
          type="number"
          value={form.fc_repos}
          onChange={(e) => update("fc_repos", Number(e.target.value))}
        />

        <button
          className="btn"
          style={{ marginTop: 16 }}
          data-testid="addentry-submit"
        >
          Enregistrer
        </button>

        {msg && (
          <p style={{ marginTop: 10 }} data-testid="addentry-msg">
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}
