import { useEffect, useMemo, useState } from "react";

const LABELS = {
  sommeil_h: "Sommeil",
  pas: "Pas",
  sport_min: "Sport",
  calories: "Calories",
  humeur_0_5: "Humeur",
  stress_0_5: "Stress",
  fc_repos: "FC repos",
};

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

export default function Explanations({ explanations }) {
  const exp = explanations && typeof explanations === "object" ? explanations : null;

  const entries = useMemo(() => {
    if (!exp) return [];
    // On garde seulement les clés connues (optionnel) + tri stable
    const arr = Object.entries(exp).map(([k, v]) => [k, v === "+" ? "+" : "-"]);
    const order = Object.keys(LABELS);
    arr.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
    return arr;
  }, [exp]);

  // petite anim “stagger”
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 40);
    return () => clearTimeout(t);
  }, [entries.length]);

  return (
    <section className="expCard" aria-label="Indicateurs">
      <header className="expHeader">
        <div>
          <div className="expEyebrow">Analyse</div>
          <h2 className="expTitle">Indicateurs (+ / −)</h2>
        </div>
        <span className="expCount">{entries.length ? `${entries.length} signaux` : "—"}</span>
      </header>

      {entries.length === 0 ? (
        <div className="expEmpty">
          <div className="expEmptyIcon">🧩</div>
          <div>
            <div className="expEmptyTitle">Aucune explication</div>
            <div className="expEmptySub">Ajoute une saisie pour obtenir les signaux.</div>
          </div>
        </div>
      ) : (
        <div className="expGrid">
          {entries.map(([key, sign], idx) => {
            const label = LABELS[key] || key;
            return (
              <div
                key={key}
                className={cx("expItem", show && "show")}
                style={{ "--d": `${idx * 60}ms` }}
              >
                <span className="expLabel">{label}</span>

                <span className={cx("expBadge", sign === "+" ? "pos" : "neg")}>
                  {sign === "+" ? "↑ +" : "↓ −"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
