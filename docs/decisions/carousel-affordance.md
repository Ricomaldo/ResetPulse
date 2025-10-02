# 🎯 SPÉCIFICATIONS AFFORDANCE CAROUSELS

## Décision : Approche Différenciée

**ActivityCarousel** : Peek effect pertinent
**PaletteCarousel** : Dots de pagination (pas de peek)

---

## 1. ActivityCarousel - Peek Effect

### Objectif
Montrer ~20% de l'activité suivante pour indiquer qu'il y a plus de contenu scrollable.

### Implémentation
```js
// Ajuster le container pour permettre le peek
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{
    paddingHorizontal: spacing.lg,
    gap: spacing.md
  }}
  // Largeur activité réduite pour voir partiellement la suivante
/>
```

### Détails techniques
- Réduire légèrement la largeur des ActivityButton
- Garder le snap actuel si existant
- Pas d'animation hint (pattern obsolète)

---

## 2. PaletteCarousel - Dots de Pagination

### Objectif
Indiquer le nombre de palettes disponibles et la position actuelle.

### Implémentation
```js
// Dots sous le carousel
<View style={styles.paginationDots}>
  {palettes.map((_, index) => (
    <View
      key={index}
      style={[
        styles.dot,
        index === currentIndex && styles.dotActive,
        !palette.available && styles.dotLocked // Grisé si premium
      ]}
    />
  ))}
</View>
```

### Styles
```js
dot: {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: theme.colors.neutral,
  marginHorizontal: 4,
}
dotActive: {
  backgroundColor: theme.colors.brand.primary,
  width: 8,
  height: 8,
}
dotLocked: {
  backgroundColor: theme.colors.border,
  opacity: 0.4,
}
```

---

## 3. Gestion Freemium sur les Dots

### Question posée
"Au départ 2 palettes free, puis 10+ en premium. On grise les dots premium ?"

### Recommandation
**Phase 1 (pré-monétisation)** : Ne montre QUE les dots des palettes disponibles
- 2 palettes free = 2 dots visibles
- Interface simple et claire

**Phase 2 (post-RevenueCat)** : Affiche tous les dots avec états
- Dots actifs : palettes free (colorés)
- Dots grisés : palettes premium locked (avec icône cadenas optionnelle)
- Tap sur dot grisé → Modal upgrade premium

### Implémentation progressive
```js
// Phase 1 (actuel)
const availablePalettes = palettes.filter(p => p.available);
{availablePalettes.map(...)} // Seulement 2 dots

// Phase 2 (avec RevenueCat)
{palettes.map((palette, index) => (
  <TouchableOpacity
    onPress={() => palette.premium ? showUpgradeModal() : selectPalette(index)}
  >
    <View style={[
      styles.dot,
      !palette.available && styles.dotLocked
    ]} />
  </TouchableOpacity>
))}
```

---

## 4. Ce qu'on N'implémente PAS

❌ Animation "hint" au montage (pattern obsolète)
❌ Gradients fade sur les bords (surcharge visuelle)
❌ Peek sur PaletteCarousel (moche avec cercles coupés)

---

## 5. Priorité d'implémentation

1. **ActivityCarousel peek** - Maintenant
2. **PaletteCarousel dots (version simple)** - Maintenant
3. **Dots freemium avancés** - Plus tard avec RevenueCat

Garde le système actuel de snap parfait pour les palettes. Ajoute juste les dots pour l'indication visuelle.

---

## Validation
Tester avec la famille avant d'ajouter plus de complexité. Ces deux changements suffisent probablement à résoudre le problème d'affordance.
