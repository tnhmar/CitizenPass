# CI/CD — CitizenPass

## Overview

The GitHub Actions workflow at `.github/workflows/ci.yml` has two jobs:

1. **test** — runs automatically on every push to `main` and on every pull request. Installs dependencies, then runs `npm run typecheck`, `npm run lint`, and `npm test`.
2. **build-android** — runs **only** when the workflow is triggered manually (`workflow_dispatch`, via the "Run workflow" button in the GitHub Actions tab). It is never triggered automatically by a commit or pull request.

There is currently no iOS build job and no dependency on EAS Build, EAS cloud services, or an `EXPO_TOKEN` secret. Android builds are produced entirely locally on the GitHub-hosted runner using `expo prebuild` + Gradle — no Expo account, no cloud build queue, no token required.

## Why local-only Android, no EAS

- `npx expo prebuild --platform android` generates the native `android/` project directly in the workflow, from your Expo config (`app.json`).
- `./gradlew assembleDebug` then builds a debug APK using the Android SDK already preinstalled on GitHub's `ubuntu-latest` runners, with JDK 17 set up via `actions/setup-java`.
- The resulting `app-debug.apk` is uploaded as a workflow artifact you can download and sideload onto a real Android device (enable "Install unknown apps" for the source you use to transfer it).
- A debug APK is unsigned with a release key, so it is suitable for testing/sideloading but not for Google Play submission. Release signing (a real keystore) is a separate, deliberate step to add later if/when you need a Play Store build — it is intentionally not automated here.

## Why iOS is excluded for now

Apple does not allow real-device installs without either (a) EAS's cloud build + ad-hoc signing (which needs `EXPO_TOKEN` plus Apple Developer credentials configured with EAS), or (b) a macOS runner with Xcode and your own signing certificates. Since the goal right now is to avoid any cloud token requirement, the iOS build job has been removed. It can be reintroduced later as a separate, explicitly manual job once you're ready to set up Apple signing.

## Triggering an Android build

1. Go to the repository's **Actions** tab.
2. Select the **CI** workflow.
3. Click **Run workflow** (this is the `workflow_dispatch` trigger).
4. Once it completes, download the `citizenpass-android-debug-apk` artifact from the run's summary page.

Regular commits and pull requests will only run the **test** job — they will not build an APK.

## Notes

- No secrets, tokens, certificates, or provisioning profiles are required or stored for this pipeline.
- If native Android configuration ever needs to persist across prebuilds (custom Gradle changes, native modules, etc.), consider committing the generated `android/` folder instead of regenerating it on every manual build — that is a deliberate future decision, not the current setup.
- `eas.json` remains in the repository for optional, manual, non-CI EAS builds later (e.g., if you personally want a cloud-built iOS ad-hoc IPA); it is not used by this workflow.
