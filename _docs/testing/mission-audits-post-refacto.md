---
created: '2025-12-14'
updated: '2025-12-14'
status: active
---

# Mission : Audits Multi-Axes Post-Refacto

## Contexte

Suite aux changements majeurs :
- **Refactorisation** du codebase (architecture, structure)
- **Nouvel Onboarding** (OnboardingV2Prototype → screens séparés)
- **Nouvelle UI in-app** (theme tokens, design system)

**Objectif** : Valider la qualité, sécurité, accessibilité et conversion avant production.

---

## Audits à Piloter

### 1. **Code Quality Audit** 🧹
**Périmètre** : Assurer que la refacto n'a pas dégradé la qualité

- [ ] **Linting** : `npm run lint` (ESLint + Prettier)
- [ ] **Type Safety** : Vérifier couverture TypeScript/Flow (si utilisé)
- [ ] **Complexity** : Identifier fonctions trop complexes (cyclomatic complexity)
- [ ] **Dead Code** : Vérifier absence de code mort post-refacto
- [ ] **Code Duplication** : Mesurer DRY violations (duplicated code)
- [ ] **Imports** : Vérifier absence de circular dependencies

**Livrable** : Rapport qualité avec score, recommandations priorité

---

### 2. **Performance Audit** ⚡
**Périmètre** : Impact de la nouvelle UI/UX sur les perfs

- [ ] **Bundle Size** : Vérifier impact des changements UI (size-limit)
- [ ] **Runtime Performance** : Mesurer temps de démarrage app + écrans clés
- [ ] **Memory Leaks** : Profiling en test réel (iOS + Android)
- [ ] **Render Performance** : Vérifier absence de re-renders inutiles (React Profiler)
- [ ] **Animations** : Fluidity des transitions onboarding (60 fps)
- [ ] **Analytics Init** : Vérifier Mixpanel ne bloque pas UI

**Metrics** :
- App startup time (baseline vs. actuel)
- TimerScreen first render (msecs)
- Onboarding step transition (msecs)

**Livrable** : Dashboard de perfs, P95 latency par écran

---

### 3. **Accessibility Audit (A11a)** ♿️
**Périmètre** : WCAG 2.1 AA minimum (CRITIQUE pour neuroatypiques)

- [ ] **Color Contrast** : Vérifier ratios WCAG AA (4.5:1 min texte)
- [ ] **Screen Reader** : Test VoiceOver (iOS) + TalkBack (Android)
- [ ] **Touch Targets** : Min 44×44 pt (mobile accessibility)
- [ ] **Keyboard Navigation** : Navigabilité complète sans touch (si possible)
- [ ] **Font Sizing** : Scaling responsive (min 12pt readable)
- [ ] **Focus Indicators** : Visible sur tous les interactive elements
- [ ] **Text Alternatives** : Alt-text sur images, labels sur inputs
- [ ] **Motion/Animation** : Respecter `prefers-reduced-motion`

**Points spécifiques ResetPulse** :
- Cadran (DialDial) accessible pour navigation
- Carrousels (Activities, Palettes) navigables au clavier
- Modales (Premium, Discovery) fermetures accessibles
- Notifications toast lisibles

**Livrable** : Rapport A11y avec violations par sévérité (Critical, Major, Minor)

---

### 4. **Security Audit** 🔒
**Périmètre** : Vérifier sécurité des modifications

- [ ] **npm audit** : Zéro vulnerabilités haute+ (actuellement 5)
- [ ] **Input Validation** : Vérifier custom activities, timer inputs
- [ ] **Data Exposure** : Vérifier credentials (RevenueCat key, Mixpanel token) sécurisés
- [ ] **API Calls** : HTTPS enforced, headers sécurisés
- [ ] **Storage** : AsyncStorage data non-sensible only
- [ ] **Dependency Review** : Audit des nouvelles dépendances
- [ ] **OWASP Top 10** : XSS, injection, auth, crypto

**Livrable** : Rapport OWASP, plan remediation vulnerabilities

---

### 5. **UX/Conversion Audit** 📊
**Périmètre** : Mesurer impact nouvel onboarding sur conversion

- [ ] **Mixpanel Events** : Vérifier tous les events loggent correctement
  - `onboarding_started`, `onboarding_step_viewed`, `onboarding_step_completed`, `onboarding_completed`
  - Events premium discovery, IAP flow
- [ ] **Funnel Analysis** : Dropout rates par étape
  - Étape 0 (Opening) → Étape 1 (Needs) → ...
- [ ] **User Flow** : Vérifier navigation logique (pas de dead ends)
- [ ] **Micro-interactions** : Toast feedback, haptics, animations
- [ ] **First-Time User** : Parcours complet v0 → app
- [ ] **Premium Discovery** : CTR sur "More Activities", "More Palettes"

**Comparaison** (si possible) :
- Old OB conversion % vs. New OB
- Time-to-timer-creation (old vs. new)

**Livrable** : Rapport conversion, funnels, heatmaps

---

### 6. **Test Coverage Audit** 🧪
**Périmètre** : Vérifier couverture des nouvelles features

- [ ] **Unit Tests** : Coverage des hooks refactorisés (useTimer, useNotificationTimer)
- [ ] **Component Tests** : Onboarding screens, modales, carrousels
- [ ] **Integration Tests** : OB → App transition, premium flows
- [ ] **Test Suites Pass** : `npm test` zéro échecs
- [ ] **Coverage Goals** : Min 80% pour logique métier

**Cibles spécifiques** :
- OnboardingV2 screens (needs, creation, etc.)
- ActivityCarousel + PaletteCarousel (free vs. premium rendering)
- PremiumModal, DiscoveryModal
- RevenueCat entitlement checks

**Livrable** : Coverage report, test results, gaps identifiés

---

### 7. **Architecture Review** 🏗️
**Périmètre** : Vérifier respect standards + conventions

- [ ] **ADR Compliance** : Respect Architecture V2 (`_ref/standards/ADR-01`)
- [ ] **Naming Conventions** : kebab-case (files), PascalCase (components), camelCase (functions) — ADR-02
- [ ] **Folder Structure** : Respect du layout défini (components, hooks, contexts, screens)
- [ ] **Context API Usage** : Props drilling vs. context (pas over-engineered)
- [ ] **Frontmatter** : Tous les `.md` ont frontmatter valide
- [ ] **i18n Consistency** : Tous textes visibles utilisent `t()`, pas de hardcoded strings

**Livrable** : Checklist compliance, recommandations refactoring

---

### 8. **Design System Consistency** 🎨
**Périmètre** : Vérifier nouvelle UI respecte design tokens

- [ ] **Color Tokens** : Usage cohérent des `theme/tokens`
- [ ] **Typography** : Font sizes, weights, line heights consistent
- [ ] **Spacing** : Margins, padding suivent rhythm (8px grid, ex.)
- [ ] **Component Library** : Réutilisabilité des composants
- [ ] **Palette System** : `timerPalettes.js` intégration correcte
- [ ] **Onboarding Design** : Cohérence visuelle (old OB vs. new OB)

**Livrable** : Design system audit, gaps, recommandations

---

### 9. **Analytics Implementation Audit** 📈
**Périmètre** : Vérifier Mixpanel + RevenueCat tracking

- [ ] **Mixpanel Events Logged** :
  - Onboarding funnel complète
  - Timer creation + start/stop
  - Premium discovery CTR
  - Activity/palette selections
- [ ] **Event Properties** : Champs attendus (timestamp, user_id, properties custom)
- [ ] **RevenueCat Entitlements** : Vérifier premium unlock tracking
- [ ] **Event Flushing** : Vérifier flush avant app close
- [ ] **Analytics Initialization** : Non-blocking, silent failures

**Livrable** : Event taxonomy audit, implementation gaps, test plan

---

### 10. **Premium Feature Integration Audit** 💎
**Périmètre** : Vérifier fonctionnement IAP + premium flows

- [ ] **RevenueCat SDK** : Initialization, listener setup
- [ ] **Paywall Modals** : PremiumModal, DiscoveryModal affichage correct
- [ ] **Free vs. Premium** : Carrousels masquent items premium (free), affichent bouton "+"
- [ ] **Entitlement Checks** : Premium status reflété UI correctement
- [ ] **Purchase Flow** : Complète et sans erreurs (dev + staging)
- [ ] **Fallback Behavior** : Graceful degradation si RevenueCat unavailable

**Livrable** : Rapport premium integration, test matrix (dev/staging/prod)

---

## Planning

| Phase | Duration | Audits | Owner |
|-------|----------|--------|-------|
| **P1 - Blocking** | 2-3 jours | Code Quality, Performance, Security, Test Coverage | Dev |
| **P2 - Core** | 2-3 jours | A11y, UX/Conversion, Analytics | Dev + QA |
| **P3 - Polish** | 1-2 jours | Architecture, Design System, Premium Integration | Dev |

---

## Checklist Final

### Avant Release
- [ ] Tous audits P1 + P2 complétés
- [ ] Zéro vulnerabilités sécurité haute+
- [ ] Tests passants 100%
- [ ] Coverage > 80%
- [ ] A11y WCAG 2.1 AA atteint
- [ ] Performance baselines établies
- [ ] Conversion funnels validées

### Sign-Off
- [ ] Code review approval
- [ ] QA sign-off
- [ ] Product verification (conversion, OB funnel)

---

## Notes

- **Neuroatypiques** : A11y est **critical** (TDAH, TSA users)
- **Freemium** : Premium integration flows doivent être fluides
- **Analytics** : Foundation pour post-launch metrics
- **Performance** : Crucial pour retention sur low-end devices

