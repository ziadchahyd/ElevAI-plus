import { useEffect, useState } from "react";
import { analyzeMe, recommendMe, getMyData } from "../api/api";
import ScoreCard from "../components/ScoreCard";
import LineChart from "../components/LineChart";
import RadarCard from "../components/RadarCard";
import Recommendations from "../components/Recommendations";
import Explanations from "../components/Explanations";
import ScoreEvolutionChart from "../components/ScoreEvolutionChart";


export default function Dashboard() {
  const [analysis, setAnalysis] = useState(null);
  const [rows, setRows] = useState([]);
  const [reco, setReco] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");

    try {
      // 1) On charge d'abord les données
      const dRes = await getMyData();
      const dataRows = dRes.data || [];
      setRows(dataRows);

      // 2) Pas de data => on n'appelle PAS analyze/recommend
      if (dataRows.length === 0) {
        setAnalysis(null);
        setReco([]);
        setError(
          'Aucune donnée trouvée. Ajoute au moins une saisie dans “Saisie” pour voir l’analyse.'
        );
        return;
      }

      // 3) Seulement si data existe
      const [aRes, rRes] = await Promise.all([analyzeMe(), recommendMe()]);
      setAnalysis(aRes.data);
      setReco(rRes.data?.recommendations || []);
    } catch (e) {
      console.log("DASHBOARD ERROR:", e?.response?.status, e?.response?.data);
      setError("Erreur lors du chargement du dashboard.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const latest = rows && rows.length ? rows[rows.length - 1] : null;

  return (
    <div className="container" data-testid="dashboard-page">
      <h1
  style={{
    marginTop: 0,
    opacity: 0,
    transform: "translateY(10px)",
    animation: "dashTitleIn 2s ease-out forwards"
  }}
>
  ElevAI Dashboard
</h1>

      <button
        className="btn"
        onClick={load}
        style={{ marginBottom: 16 }}
        data-testid="dashboard-refresh"
      >
        Rafraîchir
      </button>

      {error && (
        <p style={{ color: "crimson" }} data-testid="dashboard-error">
          {error}
        </p>
      )}

      {!analysis && !error && (
        <p data-testid="dashboard-loading">Chargement…</p>
      )}

      {analysis && (
        <div className="grid2" data-testid="dashboard-grid">
          {/* GAUCHE */}
          <div className="stack">
            <div className="card" data-testid="score-card">
              <ScoreCard
                score={analysis.score}
                category={analysis.category}
                risk={analysis.risk_prediction}
              />
            </div>

            <div className="card" data-testid="reco-card">
              <Recommendations
                items={reco.length ? reco : analysis.recommendations}
              />
            </div>

            <div className="card" data-testid="explanations-card">
              <Explanations explanations={analysis.explanations} />
            </div>
          </div>

          {/* DROITE */}
          <div className="stack">
            <div className="card" data-testid="evolution-chart">
              <LineChart rows={rows} />
            </div>

            <div className="card" data-testid="radar-card">
              <RadarCard latest={latest} />
            </div>

            {/* utile pour Playwright : compter les points */}
            <div
              style={{ display: "none" }}
              data-testid="rows-count"
            >
              {rows.length}
            </div>
            <div className="card">
  <h3>Évolution du score</h3>
  <ScoreEvolutionChart rows={rows} />
</div>
          </div>
          
        </div>
      )}
    </div>
  );
}
