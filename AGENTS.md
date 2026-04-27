# AI / agent: úpravy v tomto repozitáři

## Konvence

- **Obecné kroky** patří do `src/core/web-core.ts` (žádné pevné URL ani selektory konkrétního e-shopu).
- **Automation Exercise** — lokátory v `src/sites/automation-exercise/locators.ts` (`Ae.*`), chování stránky v `AutomationExerciseApp` v `automation-exercise.app.ts`.
- **Test data** — `src/data/users.json`; v testu `getUserByTestName('…')` musí odpovídat názvu testu v souboru; pro jednorázovou registraci `withUniqueEmail(user)`.
- **Fixtury** — importovat `test` z `tests/fixtures/automation-exercise.fixture.ts`, nepoužívat holý `@playwright/test` u A.E. scénářů, pokud potřebuješ `ae`.
- **`baseURL`** — nastaveno v `playwright.config.ts`; u cizích webů (docs, demo) volej `page.goto('https://…')` s plnou URL.
- Hlavičkový odkaz „Signup / Login“ bývá křehký po redirectech; pro stabilní otevření registrace/přihlášení preferuj `ae.goToLoginPage()` (`/login`).

## Kontroly po změnách

```bash
npx playwright test tests/automation-exercise --project=chromium
```

Při přidání závislostí: `npx playwright install` (CI už má krok s prohlížeči).
