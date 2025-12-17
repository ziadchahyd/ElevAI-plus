import { test, expect } from "@playwright/test";

function uniq() {
  const t = Date.now();
  return {
    username: "ziad",
    password: "chahyd",
    age: 22,
    genre: "M",
    taille_cm: 173,
    poids_kg: 65,
    objectif: "Mieux dormir",
  };
}

async function registerAndLogin(page, user) {
  await page.goto("/register");

  await page.getByTestId("register-username").fill(user.username);
  await page.getByTestId("register-password").fill(user.password);
  await page.getByTestId("register-age").fill(String(user.age));
  await page.getByTestId("register-genre").fill(user.genre);
  await page.getByTestId("register-taille").fill(String(user.taille_cm));
  await page.getByTestId("register-poids").fill(String(user.poids_kg));
  await page.getByTestId("register-objectif").fill(user.objectif);

  await page.getByTestId("register-submit").click();

  // Après inscription tu rediriges vers "/" (dashboard) dans ton code
  await expect(page).toHaveURL(/\/$/);
}

async function addOneEntry(page) {
  await page.goto("/saisie");

  // Date obligatoire
  const today = new Date().toISOString().slice(0, 10);
  await page.getByTestId("addentry-date").fill(today);

  await page.getByTestId("addentry-submit").click();

  // message OK
  await expect(page.getByTestId("addentry-msg")).toContainText("✅");
}

test.describe("ElevAI+ - Playwright minima", () => {
  test("T1. Création d’un utilisateur → redirection profil/dashboard", async ({ page }) => {
    const user = uniq();
    await registerAndLogin(page, user);

    // dashboard visible
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
  });

  test("T2. Ajout d’une journée de données → présence dans l’historique (via compteur rows)", async ({ page }) => {
    const user = uniq();
    await registerAndLogin(page, user);

    // Avant ajout -> rows-count peut être absent si analysis non affiché
    // On force un ajout puis on vérifie rows-count sur dashboard
    await addOneEntry(page);

    await page.goto("/");
    await expect(page.getByTestId("dashboard-page")).toBeVisible();

    // rows-count est dans le DOM seulement quand analysis est rendu (quand rows > 0)
    await expect(page.getByTestId("rows-count")).toBeVisible();
    const count = Number(await page.getByTestId("rows-count").textContent());
    expect(count).toBeGreaterThan(0);
  });

  test("T3. Appel de l’analyse → affichage score + recommandations", async ({ page }) => {
    const user = uniq();
    await registerAndLogin(page, user);

    await addOneEntry(page);
    await page.goto("/");

    // ton dashboard affiche analysis seulement si rows.length > 0
    await expect(page.getByTestId("score-card")).toBeVisible();
    await expect(page.getByTestId("reco-card")).toBeVisible();
    await expect(page.getByTestId("evolution-chart")).toBeVisible();
  });

  test("T4. Graphe se met à jour après ajout d’une nouvelle journée (rows-count augmente)", async ({ page }) => {
    const user = uniq();
    await registerAndLogin(page, user);

    // 1er ajout
    await addOneEntry(page);
    await page.goto("/");
    await expect(page.getByTestId("rows-count")).toBeVisible();
    const before = Number(await page.getByTestId("rows-count").textContent());

    // 2e ajout avec date différente (demain)
    await page.goto("/saisie");
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);
    await page.getByTestId("addentry-date").fill(tomorrow);
    await page.getByTestId("addentry-submit").click();
    await expect(page.getByTestId("addentry-msg")).toContainText("✅");

    // retour dashboard
    await page.goto("/");
    await expect(page.getByTestId("rows-count")).toBeVisible();
    const after = Number(await page.getByTestId("rows-count").textContent());

    expect(after).toBeGreaterThan(before);
    await expect(page.getByTestId("evolution-chart")).toBeVisible();
  });
});
