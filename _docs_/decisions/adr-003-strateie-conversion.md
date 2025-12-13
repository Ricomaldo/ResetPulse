# ADR-003 : Stratégie Conversion ResetPulse

**Statut :** VALIDÉ
**Date :** 13 décembre 2025
**Décideurs :** Eric + Chrysalis
**Remplace :** `adr-monetization-v11.md`, `monetization-decisions.md`

---

## Contexte

ResetPulse est un timer visuel pour utilisateurs neuroatypiques. Le modèle économique doit respecter ce public sensible à la friction tout en générant des revenus durables.

L'onboarding v2 a introduit un funnel en 6 filtres orienté sympathie et explication. La stratégie de conversion doit s'aligner sur cette philosophie : **prouver la valeur avant de demander l'engagement**.

---

## Décision

### Philosophie Conversion

**Niveau d'agressivité : 3-4 / 10 (conversion douce)**

L'utilisateur paie quand il a prouvé à lui-même que l'app lui sert. Pas avant.

### Modèle Économique

| Élément   | Valeur                       |
| --------- | ---------------------------- |
| Type      | One-time purchase (lifetime) |
| Prix      | 4,99€                        |
| Trial     | 7 jours gratuits             |
| Palettes  | 2 gratuites + 13 premium     |
| Activités | 4 gratuites + 14 premium     |

**Activités gratuites :** Travail 💻, Pause ☕, Méditation 🧘, Créativité 🎨
**Palettes gratuites :** Classique, Soft Laser

### Funnel de Conversion

```
Onboarding (exposition)
    ↓
Usage (preuve)
    ↓
Trigger (2 timers complétés)
    ↓
Rappel (modale + notification)
    ↓
Discovery (modales in-app "+")
```

**Étape 1 — Onboarding (exposition)**
Le paywall onboarding plante la graine. Pas de conversion attendue ici.

Copy adouci :

> Toutes les couleurs. Toutes les activités.
> Essaie gratuitement pendant 7 jours.
> Puis 4,99€ une fois — à toi pour toujours.

CTA : "Essayer 7 jours gratuits"
Skip : "Découvrir l'app d'abord"

**Étape 2 — Usage (preuve)**
L'utilisateur utilise l'app en mode freemium. Les 4 activités et 2 palettes couvrent les usages principaux.

**Étape 3 — Trigger (2 timers)**
Après le 2e timer complété, l'app considère que l'utilisateur a validé la valeur.

**Étape 4 — Rappel**

- Modale immédiate après timer #2 : "Tu as créé 2 moments 🎉 Envie d'explorer plus ?"
- Si skip + pas d'achat : notification push J+1 ou J+2

**Étape 5 — Discovery ongoing**
Les modales Discovery (tap sur "+") restent le canal principal de conversion post-onboarding. L'utilisateur découvre le premium au moment où il ressent le manque.

### Permission Notifications

Écran pré-permission inséré après le test 60 sec (Filtre 3) :

> **Reste informé, même en arrière-plan**
>
> ResetPulse peut te notifier quand ton moment est terminé — même si tu utilises une autre app.
>
> Sans notifications, tu devras garder l'app ouverte.

CTA : "Activer les notifications" → déclenche popup iOS
Skip : "Continuer sans"

**Placement :** Filtre 3 → Filtre 3.5 (notif) → Filtre 4 (embranchement)

---

## Configuration RevenueCat

```javascript
{
  "premium_lifetime": {
    "identifier": "resetpulse_premium_lifetime",
    "price": "4.99",
    "type": "non_consumable",
    "trial": "7_days",
    "description": "Unlock all palettes & activities forever"
  }
}
```

---

## Métriques de Succès

| Métrique                       | Cible  | Seuil alerte    |
| ------------------------------ | ------ | --------------- |
| Paywall view rate (onboarding) | —      | Exposition only |
| Timer #2 completion rate       | > 40%  | < 25%           |
| Modale rappel → trial start    | > 15%  | < 8%            |
| Discovery tap → trial start    | > 20%  | < 10%           |
| Trial → Paid                   | > 50%  | < 30%           |
| Overall install → paid         | > 3.5% | < 2%            |

---

## Identité Visuelle (Brand)

Couleurs issues de l'icône app v2 :

| Élément     | Hex       |
| ----------- | --------- |
| Fond crème  | `#ebe8e3` |
| Corail rosé | `#e5a8a3` |
| Pêche doré  | `#edceb1` |

À intégrer : palette "Lotus" ou "Sérénité", Filtre 0 onboarding.

---

## Risques et Mitigations

| Risque                         | Impact           | Mitigation                          |
| ------------------------------ | ---------------- | ----------------------------------- |
| Trigger 2 timers trop tôt      | Friction         | Ajuster à 3-4 via analytics         |
| Notification ignorée           | Conversion basse | A/B test timing J+1 vs J+2          |
| Skip massif paywall onboarding | Normal           | Attendu, conversion via Discovery   |
| Permission notif refusée       | Timer oublié     | Écran pré-permission explique enjeu |

---

## Implémentation

**Phase 1 — Immédiat (CC peut faire) :**

- [ ] Écran pré-permission notifications (Filtre 3.5)
- [ ] Adoucir copy paywall onboarding
- [ ] Modifier CTA skip : "Découvrir l'app d'abord"

**Phase 2 — Post-analytics baseline :**

- [ ] Trigger modale après 2 timers
- [ ] Notification rappel J+1/J+2
- [ ] Palette "Lotus" avec couleurs brand

---

## Références

- Onboarding v2 specs (6 filtres)
- Max-Neef satisfacteurs (Liberté, Protection, Identité)
- Benchmark : Forest 3,99€, Be Focused 4,99€
