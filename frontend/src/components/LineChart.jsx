import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function LineChart({ rows = [] }) {
  const rows14 = useMemo(() => (rows?.length ? rows.slice(-14) : []), [rows]);

  const labels = rows14.map((r) => String(r.date));

  const data = {
    labels,
    datasets: [
  {
    label: "Sommeil (h)",
    data: rows.map(r => r.sommeil_h),
    borderColor: "#60a5fa",
    backgroundColor: "rgba(96,165,250,0.25)",
    tension: 0.4,
    pointRadius: 3,
  },
  {
    label: "Stress (0-5)",
    data: rows.map(r => r.stress_0_5),
    borderColor: "#fbbf24", 
    backgroundColor: "rgba(251,191,36,0.25)",
    tension: 0.4,
    pointRadius: 3,
  },
  {
    label: "Humeur (0-5)",
    data: rows.map(r => r.humeur_0_5),
    borderColor: "#34d399", 
    backgroundColor: "rgba(52,211,153,0.25)",
    tension: 0.4,
    pointRadius: 3,
  },
],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ✅ crucial pour respecter le wrapper
    layout: {
      padding: { left: 10, right: 10, top: 10, bottom: 10 },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          font: { size: 12 },
        },
      },
      tooltip: {
        intersect: false,
        mode: "index",
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 6, 
          maxRotation: 0,
          minRotation: 0,
          font: { size: 11 },
        },
        grid: {
          drawTicks: true,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Évolution Des Indicateur</h3>

      <div className="chart-wrapper" data-testid="evolution-chart">
        <Line data={data} options={options} />
      </div>

      {/* utile pour Playwright (T4) */}
      <div
        data-testid="rows-count"
        style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}
      >
        {rows?.length ?? 0}
      </div>
    </div>
  );
}
