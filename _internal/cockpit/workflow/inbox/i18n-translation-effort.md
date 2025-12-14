---
created: '2025-12-14'
updated: '2025-12-14'
status: active
type: analysis
---

# Estimation Effort Traduction i18n

> Analyse des fallbacks français et estimation de l'effort pour finaliser les 13 langues

## 📊 État Actuel

### Complétude par Langue

| Langue | Clés | Manquantes | Complétude | Statut |
|--------|------|------------|-----------|--------|
| **fr** | 294 | 0 | 100% | ✅ Source |
| **en** | 294 | 0 | 100% | ✅ Complet |
| **it** | 294 | 0 | 100% | ✅ Complet |
| **es** | 294 | 0 | 100% | ✅ Complet |
| **de** | 294 | 0 | 100% | ✅ Complet |
| **pt** | 294 | 0 | 100% | ✅ Complet |
| **ja** | 161 | 133 | 55% | ⚠️ Fallback FR |
| **ko** | 161 | 133 | 55% | ⚠️ Fallback FR |
| **ar** | 161 | 133 | 55% | ⚠️ Fallback FR |
| **ru** | 161 | 133 | 55% | ⚠️ Fallback FR |
| **sv** | 161 | 133 | 55% | ⚠️ Fallback FR |
| **no** | 161 | 133 | 55% | ⚠️ Fallback FR |
| **nl** | 161 | 133 | 55% | ⚠️ Fallback FR |
| **zh-Hans** | 161 | 133 | 55% | ⚠️ Fallback FR |
| **zh-Hant** | 161 | 133 | 55% | ⚠️ Fallback FR |

**Total clés manquantes** : 133 × 9 langues restantes = **1,197 traductions à faire** (it, es, de, pt ✅ complétés)

---

## 🔍 Analyse des Clés Manquantes

### Répartition par Catégorie

| Catégorie | Clés | % | Complexité |
|-----------|------|---|------------|
| `onboarding.v2.*` | ~40 | 30% | ⚠️ Moyenne (UX copy) |
| `customActivities.*` | ~35 | 26% | ⚠️ Moyenne (formulaires) |
| `premium.*` | ~25 | 19% | 🔴 Haute (monétisation) |
| `discovery.*` | ~15 | 11% | ⚠️ Moyenne (marketing) |
| `activities.*` | 2 | 2% | ✅ Basse (noms simples) |
| `purchase.*` | ~10 | 8% | 🔴 Haute (erreurs, support) |
| Autres | ~6 | 4% | ⚠️ Variable |

### Volume de Texte

- **Total caractères à traduire** : ~3,010 chars par langue
- **Total toutes langues** : ~39,130 chars (3,010 × 13)
- **Mots estimés** : ~6,500 mots (estimation 6 chars/mot)

---

## 💰 Estimation Effort

### Option 1 : Traduction Manuelle (Vous)

**Temps estimé** : 2-3 heures par langue
- Lecture contexte : 15 min
- Traduction : 90-120 min
- Relecture : 15-30 min

**Total** : 26-39 heures pour 13 langues

**Avantages** :
- ✅ Qualité maximale (contexte projet)
- ✅ Cohérence terminologie
- ✅ Pas de coût

**Inconvénients** :
- ❌ Temps important
- ❌ Langues non maîtrisées (ar, ja, ko, zh)

---

### Option 2 : Traduction Assistée (DeepL/Google Translate + Review)

**Temps estimé** : 30-45 min par langue
- Traduction automatique : 5 min
- Review et corrections : 25-40 min

**Total** : 6.5-9.75 heures pour 13 langues

**Avantages** :
- ✅ Rapide
- ✅ Bonne base pour langues non maîtrisées
- ✅ Coût faible (DeepL free tier suffit)

**Inconvénients** :
- ⚠️ Review nécessaire (qualité variable)
- ⚠️ Contextes spécifiques à vérifier

---

### Option 3 : Traduction Professionnelle (Service)

**Coût estimé** : 0.10-0.15€ par mot
- 6,500 mots × 0.12€ = **~780€** pour 13 langues

**Temps** : 1-2 semaines (selon service)

**Avantages** :
- ✅ Qualité professionnelle
- ✅ Pas de temps investi
- ✅ Native speakers

**Inconvénients** :
- ❌ Coût significatif
- ❌ Moins de contrôle

---

## 🎯 Recommandation

### Approche Hybride (Recommandée)

**Phase 1 : Langues maîtrisées** (it, es, de, pt, nl, sv, no, ru)
- **Méthode** : DeepL + Review manuel
- **Temps** : 4-6 heures (8 langues × 30-45 min)
- **Qualité** : Très bonne (vous pouvez valider)

**Phase 2 : Langues asiatiques** (ja, ko, zh-Hans, zh-Hant)
- **Méthode** : DeepL + Review approfondi ou service pro
- **Temps** : 2-3 heures (4 langues × 30-45 min) ou service
- **Qualité** : Bonne avec review, excellente avec service

**Phase 3 : Arabe** (ar)
- **Méthode** : Service professionnel recommandé (RTL complexe)
- **Coût** : ~60€ (500 mots)
- **Temps** : 3-5 jours

**Total estimé** :
- **Temps** : 6-9 heures (sans arabe)
- **Coût** : 0-60€ (selon option arabe)

---

## 📋 Clés Critiques à Prioriser

### P0 - Bloquant UX (Premium)
- `premium.*` (25 clés) - **Impact conversion**
- `purchase.*` (10 clés) - **Erreurs critiques**

### P1 - Important (Onboarding)
- `onboarding.v2.*` (40 clés) - **Première impression**

### P2 - Nice-to-have
- `customActivities.*` (35 clés) - **Feature avancée**
- `discovery.*` (15 clés) - **Marketing**

---

## 🚀 Plan d'Action Recommandé

### Sprint 1 : Premium (P0)
1. Traduire `premium.*` + `purchase.*` (35 clés)
2. **Langues** : it, es, de, pt (langues principales)
3. **Temps** : 2-3 heures
4. **Impact** : Conversion immédiat

### Sprint 2 : Onboarding (P1)
1. Traduire `onboarding.v2.*` (40 clés)
2. **Toutes langues** (13)
3. **Temps** : 4-5 heures
4. **Impact** : UX première utilisation

### Sprint 3 : Features (P2)
1. Traduire `customActivities.*` + `discovery.*` (50 clés)
2. **Toutes langues** (13)
3. **Temps** : 3-4 heures
4. **Impact** : Features complètes

---

## 📝 Notes Techniques

### Fichiers Concernés
- `locales/*.json` (13 fichiers à compléter)

### Format
- JSON avec clés hiérarchiques
- Support variables : `{price}`, `{duration}`
- Support pluriels : À gérer selon langue

### Validation
- Vérifier toutes les clés présentes
- Tester fallback si clé manquante
- Valider longueur textes (UI responsive)

---

## 🔄 Alternative : Traduction Progressive

Si l'effort complet est trop important, prioriser :

1. **Langues principales** : it, es, de, pt (4 langues) ✅ **TERMINÉ**
   - **Effort** : 2-3 heures
   - **Couverture** : ~60% utilisateurs internationaux
   - **Statut** : Toutes les 133 clés traduites et ajoutées (2025-12-14)

2. **Ajouter progressivement** : ja, ko, zh (3 langues)
   - **Effort** : 1.5-2 heures
   - **Couverture** : +25% utilisateurs

3. **Compléter si ROI positif** : ar, ru, sv, no, nl (5 langues)
   - **Effort** : 2-3 heures

---

**Dernière mise à jour** : 2025-12-14
**Statut Sprint 1** : ✅ **TERMINÉ** - it, es, de, pt complétés (133 clés × 4 = 532 traductions)
**Prochaine révision** : Sprint 2 (Onboarding pour langues restantes)

