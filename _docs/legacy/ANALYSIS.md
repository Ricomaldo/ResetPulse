---
created: '2025-12-14'
status: analysis
---

# Analyse .archives/ → Triage Legacy vs Trash

> Recommandations pour trier les 38 fichiers archivés

## 📊 Critères de Triage

### ✅ **Legacy/** (Référence utile)
- Contexte historique important
- Décisions techniques documentées
- Guides encore pertinents (même si partiellement obsolètes)
- Références mentionnées dans la doc actuelle

### 🗑️ **Trash/** (Obsolète)
- Complètement remplacé par nouvelle doc
- Doublons
- Informations périmées sans valeur historique
- README obsolètes

---

## 📋 Recommandations par Fichier

### 🟢 **→ Legacy/** (Référence utile - 15 fichiers)

#### Root Files (3)
| Fichier | Raison |
|---------|--------|
| `ROADMAP.md` | ✅ **Référence historique importante** - Timeline M1-M11+, vision projet |
| `SUPPORT.md` | ✅ **Référence utilisateur** - Peut être mis à jour plus tard |
| `README.md` | ⚠️ **Obsolète mais contexte** - Documente l'ancienne structure |

#### Decisions (3) - Contexte historique
| Fichier | Raison |
|---------|--------|
| `decisions-apple-provisioning-profile-iap-failure.md` | ✅ **ADR résolu mais contexte important** - Troubleshooting IAP iOS |
| `decisions-eas-to-native-ios-build.md` | ✅ **Décision technique documentée** - Migration EAS → Xcode |
| `decisions-monetization-decisions.md` | ✅ **Contexte stratégie** - Décisions monétisation (complément ADR) |

#### Guides Builds (4) - Référence technique
| Fichier | Raison |
|---------|--------|
| `guides-builds-ANDROID_BUILD_CONFIG.md` | ✅ **Config Android détaillée** - Référence technique |
| `guides-builds-IOS_BUILD_CONFIG.md` | ✅ **Config iOS détaillée** - Référence technique |
| `guides-builds-BUILDS_OVERVIEW.md` | ✅ **Vue d'ensemble builds** - Contexte historique |
| `guides-builds-README.md` | ✅ **Index builds** - Structure ancienne documentée |

#### Guides Autres (3) - Référence opérationnelle
| Fichier | Raison |
|---------|--------|
| `guides-STORE_SUBMISSION_CHECKLIST.md` | ✅ **Checklist stores** - Peut être mis à jour |
| `guides-android-submission-checklist.md` | ✅ **Checklist Android détaillée** - Référence |
| `guides-VERSIONING.md` | ✅ **Système versioning** - Référence technique |

#### Audits (2) - Contexte historique
| Fichier | Raison |
|---------|--------|
| `audits-revenuecat-analysis.md` | ✅ **Analyse RevenueCat détaillée** - Contexte stratégie (28KB) |
| `audits-AUDIT_APP_STORES_2025.md` | ✅ **Audit stores historique** - Baseline M3 |

---

### 🟡 **→ Legacy/** (Référence conditionnelle - 5 fichiers)

| Fichier | Raison | Condition |
|---------|--------|-----------|
| `guides-DEPLOYMENT_INFO.md` | Info déploiement | Si pas remplacé par nouvelle doc |
| `guides-versioning-automation-setup.md` | Setup automation | Si encore utilisé |
| `guides-REVENUECAT_ANDROID_AUDIT.md` | Audit Android RevenueCat | Si complémentaire aux nouveaux rapports |
| `decisions-resetpulse_dashboard.md` | Dashboard décisions | Si dashboard existe encore |
| `archive-todo-oct2025-full-m7-m11.md` | TODO historique | Si référence timeline utile |

---

### 🔴 **→ Trash/** (Obsolète - 18 fichiers)

#### README Obsolètes (3)
| Fichier | Raison |
|---------|--------|
| `archive-README.md` | ❌ **Obsolète** - Remplacé par TRACKER.md |
| `guides-README.md` | ❌ **Obsolète** - Structure changée, remplacé |
| `guides-features-README.md` | ❌ **Obsolète** - Index obsolète |
| `audits-README.md` | ❌ **Obsolète** - Structure changée |

#### Archive Builds (2) - Complétés
| Fichier | Raison |
|---------|--------|
| `archive-builds-TODO_APPLE_BUILD.md` | ❌ **Complété** - "résolu avec SDK 54" (archive-README.md) |
| `archive-builds-TODO-NewArchitecture-Testing.md` | ❌ **Complété** - "migration SDK 54 réussie" |

#### Archive Devlogs (2) - Historique sans valeur
| Fichier | Raison |
|---------|--------|
| `archive-devlogs-2025-09-23.md` | ❌ **Devlog temporaire** - Info extraite ailleurs |
| `archive-devlogs-2025-09-27-timer-refactor-lessons.md` | ❌ **Devlog temporaire** - Patterns extraits |

#### Archive Fixes (3) - Appliqués
| Fichier | Raison |
|---------|--------|
| `archive-fixes-FIX_MODE_25_60.md` | ❌ **Fix appliqué** - v1.0.4 terminée |
| `archive-fixes-NOTIFICATION_FIX_ANDROID_2025.md` | ❌ **Fix appliqué** - Info dans nouvelle doc |
| `archive-fixes-TIMER_FIX_REPORT.md` | ❌ **Fix appliqué** - Résolu |

#### Archive Frameworks (3) - Méthodologies établies
| Fichier | Raison |
|---------|--------|
| `archive-frameworks-manifesto_dev_update.md` | ❌ **Framework établi** - Plus besoin référence |
| `archive-frameworks-meta_learning_framework.md` | ❌ **Framework établi** - Plus besoin référence |
| `archive-frameworks-mobile_dev_framework.md` | ❌ **Framework établi** - Plus besoin référence |

#### Archive Decisions (1)
| Fichier | Raison |
|---------|--------|
| `archive-decisions-time_timer_priority_matrix.md` | ❌ **Matrice obsolète** - Décisions prises |

#### Audits Obsolètes (2)
| Fichier | Raison |
|---------|--------|
| `audits-WCAG_CONTRAST_AUDIT.md` | ❌ **Outdated** - Mentionné dans TRACKER comme outdated |
| `audits-ios-audit.md` | ❌ **Trop court (214B)** - Probablement vide/incomplet |

#### Guides Features (1)
| Fichier | Raison |
|---------|--------|
| `guides-features-onboarding-brief.md` | ❌ **V1 obsolète** - V2 en place, mentionné dans architecture.legacy.md |

---

## 📊 Résumé

| Destination | Nombre | Pourcentage |
|-------------|--------|------------|
| **Legacy/** (référence utile) | 15 | 39% |
| **Legacy/** (conditionnel) | 5 | 13% |
| **Trash/** (obsolète) | 18 | 47% |
| **Total** | 38 | 100% |

---

## 🎯 Actions Recommandées

### Phase 1 : Déplacer vers Legacy/ (15 fichiers)
```bash
# Root files
ROADMAP.md
SUPPORT.md
README.md

# Decisions
decisions-apple-provisioning-profile-iap-failure.md
decisions-eas-to-native-ios-build.md
decisions-monetization-decisions.md

# Guides Builds
guides-builds-ANDROID_BUILD_CONFIG.md
guides-builds-IOS_BUILD_CONFIG.md
guides-builds-BUILDS_OVERVIEW.md
guides-builds-README.md

# Guides Autres
guides-STORE_SUBMISSION_CHECKLIST.md
guides-android-submission-checklist.md
guides-VERSIONING.md

# Audits
audits-revenuecat-analysis.md
audits-AUDIT_APP_STORES_2025.md
```

### Phase 2 : Évaluer conditionnels (5 fichiers)
Vérifier si remplacés par nouvelle doc avant décision.

### Phase 3 : Déplacer vers Trash/ (18 fichiers)
Tous les fichiers marqués ❌ ci-dessus.

---

**Note** : Les fichiers dans Trash/ peuvent être supprimés définitivement après validation, ou conservés pour historique Git.

