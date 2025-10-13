# ResetPulse

Vision Projet
Première application iOS personnelle : Time Timer visuel pour utilisateurs neuroatypiques. Laboratoire d'apprentissage pour tout le cycle dev/marketing/publication. Focus : créer un outil utile pour soi et sa famille d'abord, explorer le marché ensuite.

Contexte Développeur
Eric, développeur freelance spécialisé outils neuro-adaptatifs. TDA/H personnel, contexte familial neurodivers (fils TSA+TDA/H, belle-fille TDA/H). Licence Apple Developer active depuis juin 2025. Base technique React existante à migrer React Native.

Application Technique (État Actuel)
Time Timer visuel avec personnalisation couleurs. Design minimaliste basé palette système IRIM. Presets 4min (ancrage) et 20min (méditation). Changement couleur pendant défilement. Interface épurée anti-surcharge cognitive.

---

## Développement

### Installation
```bash
npm install
```

### Run Local
```bash
npx expo start
```

### Build Production

**Android:**
```bash
cd android
./gradlew clean && ./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

**iOS (v1.1.0+):**
```bash
# Générer workspace Xcode (si modifs natives)
npx expo prebuild --platform ios
cd ios/ && pod install && cd ..

# Ouvrir Xcode et Archive
open ios/ResetPulse.xcworkspace
# Xcode: Product > Archive (⌘⇧B)
# Organizer: Distribute App > App Store Connect
```

**Documentation complète:** `docs/development/builds/BUILDS_OVERVIEW.md`

**Note:** iOS a migré d'EAS Build vers Xcode natif en v1.1.0 pour support In-App Purchase (voir ADR 002).

---

## Documentation

- **Builds:** `docs/development/builds/` - Configuration Android/iOS
- **Architecture:** `docs/architecture/` - Systèmes et patterns
- **Décisions:** `docs/decisions/` - ADRs (Architecture Decision Records)
- **Devlogs:** `docs/devlog/` - Guides techniques détaillés
- **Releases:** `docs/releases/` - Changelogs et rapports