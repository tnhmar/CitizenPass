# CitizenPass

CitizenPass is a free, bilingual (English/French), offline-first Canadian citizenship exam preparation app for iOS and Android.

CitizenPass is an independent educational tool. It is **not affiliated with, endorsed by, or sponsored by the Government of Canada**.

## Status

Project scaffold only. Study content, question bank, and screens are being built incrementally. See `docs/content-governance.md` and `docs/source-register.md` for the source and citation policy.

## Tech Stack

- React Native + Expo (Managed Workflow)
- TypeScript (strict mode)
- Expo Router
- React Native Paper
- Zustand
- AsyncStorage (Expo SQLite for structured local data if needed)
- i18next / react-i18next + Expo Localization
- Expo Speech (optional text-to-speech)
- Expo EAS Build

## Non-Negotiable Constraints

- No backend, no server, no authentication, no cloud sync.
- No analytics SDK, no ads, no subscriptions, no in-app purchases.
- No collection, transmission, or sharing of user data.
- Fully usable offline after installation.
- All study content, questions, and translations are bundled with the app.
- All settings, progress, bookmarks, and history are stored locally on-device.

## Official Sources

- English guide: [Discover Canada](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada.html)
- French guide: [Découvrir le Canada](https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada.html)

See `docs/source-register.md` for full source metadata.

## Getting Started

```bash
npm install
npm start
```

Run on a platform:

```bash
npm run ios
npm run android
npm run web
```

## Testing

```bash
npm run typecheck
npm run lint
npm test
```

## Building

Build profiles are defined in `eas.json` (development, preview, production). Run:

```bash
eas build --profile preview --platform android
eas build --profile preview --platform ios
```

No signing credentials or secrets are stored in this repository.

## Project Structure

```text
app/            Expo Router screens
src/
  components/   Reusable UI components
  constants/    Shared constants
  data/         Bundled content, question manifests, question banks
  features/     Feature modules (chapters, exam, practice, progress, settings)
  hooks/        Shared React hooks
  i18n/         Localization resources (en.json, fr.json)
  services/     Persistence, question engine, source verification
  store/        Zustand stores
  theme/        Theming
  types/        Shared TypeScript types
  utils/        Utilities
assets/         Icons, images, fonts
docs/           Content governance and source register
tests/          Unit and component tests
```

## Privacy

See `PRIVACY.md`. CitizenPass does not collect, transmit, sell, or share personal data.

## Disclaimer

CitizenPass is an independent educational tool and is not affiliated with, endorsed by, or sponsored by the Government of Canada. Practice questions are original study questions based on the official guides and are not actual, leaked, or guaranteed citizenship-test questions.

## License

MIT — see `LICENSE`.
