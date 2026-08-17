# CI/CD — CitizenPass

## Overview

The GitHub Actions workflow at `.github/workflows/ci.yml` runs on every push and pull request to `main`, and can also be triggered manually (`workflow_dispatch`).

## Jobs

1. **test** — installs dependencies, runs `npm run typecheck`, `npm run lint`, and `npm test`. Runs on every push and pull request.
2. **build-android** — builds an installable `.apk` via EAS Build (`preview` profile, `buildType: apk`), downloads it, and uploads it as a GitHub Actions artifact. Runs only on pushes to `main` (not on pull requests), after `test` succeeds.
3. **build-ios** — builds an ad-hoc `.ipa` via EAS Build (`preview` profile, `distribution: internal`), downloads it, and uploads it as a GitHub Actions artifact. Runs only on pushes to `main`, after `test` succeeds.

Both build jobs use EAS's cloud build infrastructure, so no local Android SDK or macOS/Xcode runner is required in GitHub Actions.

## One-time setup required (cannot be automated by CI)

### 1. Expo access token

1. Create an Expo account and an EAS project for this repository (`eas init` once, locally).
2. Generate an access token at https://expo.dev/accounts/[account]/settings/access-tokens.
3. Add it to the repository as a GitHub Actions secret named `EXPO_TOKEN` (**Settings → Secrets and variables → Actions**).

### 2. Android signing

EAS automatically generates and manages an Android keystore for the `preview` profile the first time you run a build (locally: `eas build --platform android --profile preview`). No manual keystore upload is required for ad-hoc/internal distribution APKs.

### 3. iOS signing and device registration (required for real-device install)

Apple requires ad-hoc builds to be signed with a distribution certificate and a provisioning profile that explicitly lists the UDIDs of test devices. This must be configured once, from a machine with access to your Apple Developer Program account:

1. Run `eas credentials` locally and let EAS manage your Apple distribution certificate and ad-hoc provisioning profile (stored securely on Expo's servers, not in this repository).
2. Register each real iOS test device's UDID with EAS: `eas device:create`.
3. Re-run credential setup any time a new device needs to be added, since Apple ad-hoc profiles only work on registered UDIDs.

Once credentials are configured on EAS, CI only needs `EXPO_TOKEN` — it does not need your Apple ID, certificates, or private keys, and none of those are ever stored in this repository or in GitHub Actions secrets.

## Installing the build artifacts

- **Android**: download the `citizenpass-android-apk` workflow artifact, transfer the `.apk` to an Android device, and install it (enable "Install unknown apps" for the source used).
- **iOS**: download the `citizenpass-ios-ipa` workflow artifact. Installing an ad-hoc `.ipa` on a real iPhone requires a device management tool (for example, installing via Apple Configurator, or hosting the `.ipa` through a service compatible with ad-hoc distribution). The device's UDID must already be registered in the ad-hoc provisioning profile (see setup step 3), or the install will fail with a provisioning error — this is an Apple platform restriction, not a CitizenPass limitation.

## Notes

- No secrets, certificates, or provisioning profiles are stored in this repository.
- `build-android` and `build-ios` are skipped for pull requests to avoid consuming EAS build credits on every PR; they run on pushes to `main` and on manual `workflow_dispatch`.
