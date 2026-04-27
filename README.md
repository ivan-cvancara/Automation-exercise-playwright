# Playwright training

Experimentální E2E projekt postavený kolem [Playwright Test](https://playwright.dev/). Scénáře pro [Automation Exercise](https://automationexercise.com) jsou refaktorované do sdílených vrstev (analogie k `WebCore` + `AutomationExercise.resource` v [Robot Framework](https://robotframework.org/) projektu).

## Rychlý start

```bash
npm install
npx playwright install
npm test
```

- `npm run test:ae` — pouze `tests/automation-exercise/`
- `npm run test:smoke` — krátké testy cizího webu (Playwright docs)
- `npm run test:examples` — ukázkový TodoMVC z Playwright
- `npm run test:ui` — režim s UI

## Struktura

| Cesta | Účel |
|--------|------|
| `src/core/web-core.ts` | Obecné kroky (navigace, klik, fill, assert) — *keyword-like* |
| `src/config/env.ts` | Sdílené konstanty (např. `baseURL` v `playwright.config.ts`) |
| `src/data/users.json` + `user-loader.ts` | Test data podle názvu testu (jako `Resources/Data` v Robotu) |
| `src/sites/automation-exercise/` | Konkrétní stránka: `locators`, `automation-exercise.app.ts` |
| `tests/fixtures/automation-exercise.fixture.ts` | `test` rozšířené o `ae` (page object) + `startAtAutomationExerciseHome` |
| `tests/automation-exercise/*.spec.ts` | Samotné scénáře — krátké, volají `ae` / sdílené kroky |
| `tests/smoke/` | Nezávislý kouřový běh mimo A.E. |
| `tests/examples/` | Oficiální demo spec (dlouhý) |
| `playwright.config.ts` | `testDir: tests`, `use.baseURL` = Automation Exercise |

Nové testy: přidávej metody do `AutomationExerciseApp` nebo do `web-core.ts`, doplň data do `users.json` (klíč = název testu) a v specu používej `import { test } from '../fixtures/automation-exercise.fixture'`.

## CI

GitHub Actions (`.github/workflows/playwright.yml`) spouští `npx playwright test` po `npm ci` a instalaci prohlížečů.
