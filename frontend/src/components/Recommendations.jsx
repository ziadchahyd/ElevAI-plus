import { useEffect, useMemo, useState } from "react";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function pickIcon(text = "") {
  const t = text.toLowerCase();
  if (t.includes("marche") || t.includes("pas") || t.includes("sport") || t.includes("activité")) return "🏃";
  if (t.includes("resp") || t.includes("médit") || t.includes("stress") || t.includes("calme")) return "🧘";
  if (t.includes("sommeil") || t.includes("dorm") || t.includes("coucher")) return "🌙";
  if (t.includes("eau") || t.includes("hydrat")) return "💧";
  if (t.includes("musique") || t.includes("sortie") || t.includes("ami") || t.includes("appel")) return "🎵";
  return "✅";
}

export default function Recommendations({ items }) {
  const list = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  // animation "stagger"
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, [list.length]);

  // état done: Set d'index (simple)
  const [done, setDone] = useState(() => new Set());

  // reset done si la liste change
  useEffect(() => {
    setDone(new Set());
  }, [list.join("|")]);

  const toggleDone = (idx) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <section className="recoCard" aria-label="Recommandations">
      <header className="recoHeader">
        <div>
          <div className="recoEyebrow">Plan d’action</div>
          <h2 className="recoTitle">Recommandations</h2>
        </div>
        <span className="recoCount">{list.length ? `${list.length} actions` : "—"}</span>
      </header>

      {list.length === 0 ? (
        <div className="recoEmpty">
          <div className="recoEmptyIcon">✨</div>
          <div>
            <div className="recoEmptyTitle">Aucune recommandation</div>
            <div className="recoEmptySub">Ajoute une saisie pour générer des conseils personnalisés.</div>
          </div>
        </div>
      ) : (
        <ul className="recoList">
          {list.map((rec, idx) => {
            const isDone = done.has(idx);

            return (
              <li
                key={idx}
                className={cx("recoItem", show && "show", isDone && "done")}
                style={{ "--d": `${idx * 80}ms` }}
              >
                <div className="recoIcon" aria-hidden="true">
                  {pickIcon(String(rec))}
                </div>

                <div className="recoText">{rec}</div>

                <button
                  type="button"
                  className={cx("recoDone", isDone && "checked")}
                  title={isDone ? "Annuler" : "Marquer comme fait"}
                  onClick={() => toggleDone(idx)}
                >
                  {isDone ? "✓ Fait" : "Fait"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
