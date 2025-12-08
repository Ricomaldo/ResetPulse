# Protocole de Migration Next.js

> Méthodologie pour refonte de site sans casser l'existant.
> Principe : **Never Break What Works**

---

## Phase 0 — Sécurisation

```bash
# Vérifier état clean
git status

# Créer tag de sauvegarde
git tag -a v1.0-legacy -m "Avant migration - $(date +%Y-%m-%d)"

# Créer branche de travail
git checkout -b [nom-migration]
```

**Checkpoint :** Tag créé, nouvelle branche active.

---

## Phase 1 — Inventaire

Avant de toucher quoi que ce soit, lister :

### À GARDER (obligatoire)
- [ ] Providers (Theme, fonts) → `app/layout.tsx`
- [ ] Pages légales → `mentions-legales/`, `politique-confidentialite/`
- [ ] Styles globaux → `globals.css`, `tailwind.config`
- [ ] Composants essentiels → lister lesquels

### À ISOLER (pas supprimer)
- [ ] Pages à retirer temporairement
- [ ] Composants non utilisés

**Checkpoint :** Listes validées avant de continuer.

---

## Phase 2 — Isolation

```bash
# Créer dossier archive (ignoré par Next.js grâce au _)
mkdir -p src/app/_archive

# Déplacer les pages
mv src/app/(main)/[page] src/app/_archive/
```

**Pourquoi `_archive/`** : Le préfixe `_` fait que Next.js ignore ce dossier. Les fichiers restent accessibles mais ne sont plus routés.

**Checkpoint :** `npm run dev` → site tourne avec pages restantes.

---

## Phase 3 — Squelette

Remplacer la page cible par un squelette minimal :

```tsx
export default function Page() {
  return (
    <main className="min-h-screen">
      <h1>En construction</h1>
    </main>
  )
}
```

**Checkpoint :** Squelette visible, pas d'erreur.

---

## Phase 4 — Construction incrémentale

Ajouter section par section. Chaque étape = 1 commit.

| Étape | Contenu | Commit |
|-------|---------|--------|
| 4.1 | Section 1 | `feat: [description]` |
| 4.2 | Section 2 | `feat: [description]` |
| ... | ... | ... |

**Règle :** Si ça casse → `git reset --soft HEAD~1`

---

## Phase 5 — Nettoyage

Seulement APRÈS validation complète :

```bash
# Supprimer archive
rm -rf src/app/_archive

# Supprimer composants non utilisés
# (identifier avec ESLint warnings)
```

---

## Commandes de secours

```bash
# Revenir à l'état legacy
git checkout v1.0-legacy

# Annuler dernier commit (garder fichiers)
git reset --soft HEAD~1

# Voir historique
git log --oneline -10

# Comparer avec legacy
git diff v1.0-legacy
```

---

## Tracker associé

Copier dans `cockpit/active/current.md` :

```markdown
# Mission Active : [Nom]

**Branche** : `[branche]`
**Tag legacy** : `v1.0-legacy`

## Progression

### Phase 0 — Sécurisation
- [ ] git status clean
- [ ] Tag créé
- [ ] Branche créée

### Phase 1 — Inventaire
- [ ] Liste "À garder" validée
- [ ] Liste "À isoler" validée

### Phase 2 — Isolation
- [ ] _archive créé
- [ ] Pages déplacées
- [ ] npm run dev OK

### Phase 3 — Squelette
- [ ] Page remplacée
- [ ] Squelette visible

### Phase 4 — Construction
- [ ] 4.1 ...
- [ ] 4.2 ...

### Phase 5 — Nettoyage
- [ ] _archive supprimé
- [ ] Merge sur main
- [ ] Déploiement
```

---

**Créé** : 2025-12-06
**Auteur** : Eric + Merlin
