import { useEffect, useMemo, useState } from "react";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function toneFromScore(score) {
  if (score >= 75) return "good";
  if (score >= 50) return "mid";
  return "bad";
}

function toneFromRisk(risk) {
  const r = String(risk || "").toLowerCase();
  if (r.includes("faible") || r.includes("low") || r.includes("stable")) return "good";
  if (r.includes("moyen") || r.includes("medium")) return "mid";
  if (r.includes("élev") || r.includes("high") || r.includes("crit")) return "bad";
  return "neutral";
}

export default function ScoreCard({ score = 0, category = "—", risk = "—" }) {
  const s = clamp(Number(score) || 0, 0, 100);

  // animation progressive (0 -> score)
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const to = s;
    const duration = 900;

    const tick = (t) => {
      const p = clamp((t - start) / duration, 0, 1);
      // easing
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [s]);

  const scoreTone = useMemo(() => toneFromScore(s), [s]);
  const riskTone = useMemo(() => toneFromRisk(risk), [risk]);

  return (
    <div className="scoreCard">
      <div className="scoreHeader">
        <div>
          <div className="scoreEyebrow">Score</div>
          <h2 className="scoreTitle">Score global</h2>
        </div>

        <div className="scoreBadges">
          <span className={`pill ${scoreTone}`}>{category}</span>
          <span className={`pill outline ${riskTone}`}>Risque: {risk}</span>
        </div>
      </div>

      <div className="scoreBody">
        <div
          className={`ring ${scoreTone}`}
          style={{
            "--p": `${display}`, // 0..100
          }}
          aria-label={`Score global ${s.toFixed(2)} sur 100`}
          role="img"
        >
          <div className="ringInner">
            <div className="ringValue">{display.toFixed(2)}</div>
            <div className="ringSub">/ 100</div>
          </div>
        </div>

        <div className="scoreMeta">
          <div className="metaRow">
            <div className="metaLabel">Catégorie</div>
            <div className="metaValue">{category}</div>
          </div>
          <div className="metaRow">
            <div className="metaLabel">Risque</div>
            <div className="metaValue">{risk}</div>
          </div>

          <div className="scoreHint">
            Astuce : vise <strong>+5 points</strong> cette semaine (sommeil + régularité).
          </div>
        </div>
      </div>
    </div>
  );
}
