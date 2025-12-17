import { useEffect, useMemo, useRef, useState } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function clamp01(x) {
  const n = Number(x);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

const LABELS = ["Sommeil", "Pas", "Sport", "Humeur", "Stress (inv.)", "FC repos (inv.)"];

export default function RadarCard({ latest }) {
  const chartRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const profile = useMemo(() => {
    if (!latest) return null;

    const sommeil = clamp01((latest.sommeil_h ?? 0) / 8);
    const pas = clamp01((latest.pas ?? 0) / 10000);
    const sport = clamp01((latest.sport_min ?? 0) / 45);
    const humeur = clamp01((latest.humeur_0_5 ?? 0) / 5);
    const stressInv = clamp01(1 - (latest.stress_0_5 ?? 0) / 5);
    const fcInv = clamp01(1 - ((latest.fc_repos ?? 70) - 50) / 50);

    return [sommeil, pas, sport, humeur, stressInv, fcInv];
  }, [latest]);

  // petit "insight" (top 2 / bottom 1)
  const insight = useMemo(() => {
    if (!profile) return null;
    const pairs = LABELS.map((lab, i) => ({ lab, v: profile[i] }));
    const sorted = [...pairs].sort((a, b) => b.v - a.v);
    return {
      top1: sorted[0],
      top2: sorted[1],
      low: sorted[sorted.length - 1],
    };
  }, [profile]);

  const data = useMemo(() => {
    return {
      labels: LABELS,
      datasets: [
        {
          label: "Profil (0–1)",
          data: profile ?? [0, 0, 0, 0, 0, 0],
          fill: true,
          pointRadius: 2,
          borderWidth: 2,
          backgroundColor: "rgba(96,165,250,0.18)",
          borderColor: "rgba(96,165,250,1)",
          pointBackgroundColor: "rgba(96,165,250,1)",
        },
      ],
    };
  }, [profile]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 650,
        easing: "easeOutQuart",
      },
      layout: { padding: 10 },
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: { size: 12 },
            color: "#6b7280", 
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.raw).toFixed(2)}`,
          },
        },
      },
      scales: {
        r: {
          min: 0,
          max: 1,
          ticks: {
            stepSize: 0.2,
            font: { size: 10 },
            backdropColor: "transparent",
          },
          pointLabels: {
            font: { size: 11 },
          },
          grid: {
            color: "rgba(17,24,39,0.10)", 
          },
          angleLines: {
            color: "rgba(17,24,39,0.10)",
          },
        },
      },
    }),
    []
  );

  // relancer l’animation quand latest change
  useEffect(() => {
    const chart = chartRef.current;
    if (chart) chart.update();
  }, [profile]);

  return (
    <section className={`radarCard ${mounted ? "show" : ""}`}>
      <header className="radarHeader">
        <div>
          <div className="radarEyebrow">Profil</div>
          <h3 className="radarTitle">Radar (0–1)</h3>
        </div>

        {latest ? (
          <span className="radarBadge">Dernière saisie</span>
        ) : (
          <span className="radarBadge ghost">Aucune donnée</span>
        )}
      </header>

      {!latest ? (
        <div className="radarEmpty">
          <div className="radarEmptyIcon">📡</div>
          <div>
            <div className="radarEmptyTitle">Ajoute une saisie</div>
            <div className="radarEmptySub">
              Le radar se remplit automatiquement avec tes dernières valeurs.
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="radarChartWrap">
            <Radar ref={chartRef} data={data} options={options} />
          </div>

          {insight && (
            <div className="radarFooter">
              <div className="radarMini">
                <span className="miniLabel">Forces</span>
                <span className="miniValue">
                  {insight.top1.lab}, {insight.top2.lab}
                </span>
              </div>
              <div className="radarMini">
                <span className="miniLabel">À améliorer</span>
                <span className="miniValue">{insight.low.lab}</span>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
