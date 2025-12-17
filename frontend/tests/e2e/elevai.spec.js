import { test, expect } from "@playwright/test";

function uniq() {
  const t = Date.now();
  return {
    username: `u_${t}`,
    password: "Test12345!",
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

  
  await page.waitForURL("**/");
  await expect(page.getByTestId("dashboard-page")).toBeVisible();
}

async function addOneEntry(page) {
  await page.goto("/add"); 

  const today = new Date().toISOString().slice(0, 10);
  await page.getByTestId("addentry-date").fill(today);

  await page.getByTestId("addentry-submit").click();
  await expect(page.getByTestId("addentry-msg")).toContainText("✅");
}

test.describe("ElevAI+ - Playwright minima", () => {
  test("T1. Création d’un utilisateur → redirection profil/dashboard", async ({ page }) => {
    const user = uniq();
    await registerAndLogin(page, user);
  });

  test("T2. Ajout d’une journée de données → rows-count > 0", async ({ page }) => {
    const user = uniq();
    await registerAndLogin(page, user);

    await addOneEntry(page);

    await page.goto("/");
    await expect(page.getByTestId("rows-count")).toHaveText(/^\d+$/);
const count = Number(await page.getByTestId("rows-count").textContent());

    expect(count).toBeGreaterThan(0);
  });

  test("T3. Analyse → score + recommandations visibles", async ({ page }) => {
    const user = uniq();
    await registerAndLogin(page, user);

    await addOneEntry(page);
    await page.goto("/");

    await expect(page.getByTestId("score-card")).toBeVisible();
    await expect(page.getByTestId("reco-card")).toBeVisible();
    await expect(page.getByTestId("evolution-chart")).toBeVisible();
  });

  test("T4. Graphe s’update après nouvelle journée (rows-count augmente)", async ({ page }) => {
  const user = uniq();
  await registerAndLogin(page, user);

  // 1er ajout
  await addOneEntry(page);
  await page.goto("/");

  await expect(page.getByTestId("rows-count")).toHaveText(/^\d+$/);
  const before = Number(await page.getByTestId("rows-count").textContent());

  // 2e jour (demain)
  await page.goto("/add");
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);
  await page.getByTestId("addentry-date").fill(tomorrow);
  await page.getByTestId("addentry-submit").click();
  await expect(page.getByTestId("addentry-msg")).toContainText("✅");

  // retour dashboard
  await page.goto("/");

  await expect(page.getByTestId("rows-count")).toHaveText(/^\d+$/);
  const after = Number(await page.getByTestId("rows-count").textContent());

  expect(after).toBeGreaterThan(before);
  await expect(page.getByTestId("evolution-chart")).toBeVisible();
});

});
