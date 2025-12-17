import { useMemo } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

function shortDateLabel(d) {
  // attend "YYYY-MM-DD" ou "DD/MM/YYYY" → on affiche plus court
  const s = String(d || "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.slice(5);      // MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s.slice(0, 5); // DD/MM
  return s;
}

export default function ScoreEvolutionChart({ rows }) {
  const clean = useMemo(() => {
    const arr = Array.isArray(rows) ? rows : [];
    // garde seulement les points valides
    return arr
      .filter(r => r && r.date != null && r.score != null && !Number.isNaN(Number(r.score)))
      .map(r => ({ date: String(r.date), score: Number(r.score) }));
  }, [rows]);

  if (!clean.length) return null;

  const data = useMemo(() => ({
    labels: clean.map(r => r.date),
    datasets: [
      {
        label: "Score de bien-être",
        data: clean.map(r => r.score),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.14)",
        tension: 0.35,
        pointRadius: (ctx) => (ctx.dataIndex === clean.length - 1 ? 4 : 0), // point seulement sur le dernier
        pointHoverRadius: 5,
        borderWidth: 2,
        fill: true,
      },
    ],
  }), [clean]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false, 
    animation: { duration: 700, easing: "easeOutQuart" },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          title: (items) => `Date: ${items?.[0]?.label ?? ""}`,
          label: (ctx) => `Score: ${Number(ctx.raw).toFixed(1)} / 100`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 7,
          callback: (val, idx) => shortDateLabel(clean[idx]?.date),
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
        grid: { color: "rgba(17,24,39,0.10)" },
      },
    },
  }), [clean]);

  return (
    <div data-testid="score-evolution-chart" style={{ height: 320 }}>
      <Line data={data} options={options} />
    </div>
  );
}
