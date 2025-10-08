# Session RevenueCat - Décisions Monétisation v1.1.0

**Date:** Session formation langage commercial  
**Contexte:** Analyse triangulaire 4 perspectives Claude Code + arbitrage pricing + formation messaging

---

## DÉCISION PRICING ✓ VALIDÉ

**Modèle:** One-time purchase 4,99€ (lifetime unlock)

**Rationale:**
- Timer = outil statique (pas service contenu renouvelé)
- Benchmarks pertinents: Forest 3,99€, Be Focused 4,99€ (vs meditation apps inadaptées)
- Calcul revenus: 1000 DL/mois × 3% conversion × 4,99€ = 1796€/an
- Subscription rejetée: pas de valeur récurrente justifiable v1.1.0, risque review bombing
- Sweet spot psychologique: "prix d'un café", standard marché timer apps

**Alternative considérée:** 3,99€ (pattern junior sous-valorisation identifié, décision maintenue 4,99€)

---

## MESSAGING PREMIUM MODAL ✓ VALIDÉ

**Texte corps modal:**
```
ResetPulse est gratuit et fonctionnel.
Pour plus d'activités et de palettes, débloquez premium.

15 palettes + 16 activités
4,99€ - Une fois, pour toujours

Trial gratuit 7 jours
```

**Rationale:** Connexion créateur-utilisateur (validation dev), nombres illustrent sans argumenter, transparence modèle économique.

**Boutons action:**
- CTA positif: "Commencer l'essai gratuit"
- CTA négatif: "Peut-être plus tard"

**Rationale:** Mot "gratuit" réduit friction engagement, "peut-être" non-culpabilisant sans être manipulatoire.

---

## TRIAL MANAGEMENT ✓ VALIDÉ

**Approche:** Minimaliste v1.1.0 - Apple/Google gèrent notifications expiration

**Rationale:** 
- RevenueCat + stores envoient message système standard J-1 expiration
- Focus apprentissage SDK simple, pas dev banner custom in-app
- Banner proactif J+5 reporté v1.2.0 si données montrent confusion users

---

## CONFIGURATION REVENUECAT

**Produit unique:**
```javascript
{
  "premium_lifetime": {
    "price": "4.99",
    "type": "non_consumable", 
    "trial": "7 days",
    "description": "Unlock all palettes & activities forever"
  }
}
```

**Config freemium maintenue:**
- Gratuit: 3 palettes + 6 activités (classique, softLaser, terre + none, work, break, breathing, reading, study)
- Premium 4,99€: 12 palettes + 12 activités supplémentaires (déblocage total)

---

## SCOPE v1.1.0 - LIMITATIONS STRICTES

**Implémentation:**
- PurchaseContext + hook usePremiumStatus
- PremiumModal MVP simple (pas messaging contextuel)
- Integration ActivityCarousel + PaletteCarousel (trigger locked items)
- Sandbox testing iOS/Android

**Exclus v1.1.0:**
- Subscription infrastructure (rejeté stratégiquement)
- A/B testing pricing (reporté v1.2.0 après baseline 3 mois)
- Banner trial custom in-app (minimaliste stores suffisant)
- Stats premium / Cloud sync (pas valeur récurrente)

**Learning objectif:** RevenueCat basics, dashboard familiarisation, one-time purchase flow. Préparation MoodCycle pricing plus complexe.

---

## CONFRONTATION DOC MARKETING

**Alignement validé:**
- Message onboarding "Choisissez, ajustez, lancez" = cohérent messaging premium fonctionnel
- Positionnement "personnalisation" = core value prop justifie 4,99€
- Usages identifiés (méditation, focus, cuisine) = freemium 6 activités couvre spectrum
- Ton authentique créateur-utilisateur = version C modal premium

**Ajustements requis doc marketing:**
- Ajouter section "Modèle économique: Freemium + achat unique 4,99€"
- Mentionner trial 7j dans description store (transparence)
- Screenshots: Potentiel badge "Premium" discret sur palettes verrouillées (à valider design)

---

**Timeline:** Implémentation v1.1.0 = 2-3 semaines post-validation 1.0.4 TestFlight  
**Prochaine étape:** Finaliser theme system logo avant intégration RevenueCat UI