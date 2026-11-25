# Self-hosted fonts

Bundled so builds never depend on Google Fonts being reachable.

| Family | Source package | License |
|---|---|---|
| Be Vietnam Pro 400/500/600 | `@fontsource/be-vietnam-pro@5.3.0` | SIL OFL 1.1 (`OFL-BeVietnamPro.txt`) |
| Lora variable (wght) | `@fontsource-variable/lora@5.3.0` | SIL OFL 1.1 (`OFL-Lora.txt`) |

Only the `latin` and `vietnamese` subsets are included; see `src/app/fonts.ts` for
the matching `unicode-range` values.
