# ResetPulse - Site Marketing

Site vitrine et support pour l'application mobile ResetPulse.

## Structure du site

```
website/
├── index.html          # Page d'accueil (multilingue FR/EN + iOS/Android)
├── assets/
│   ├── fr/             # Screenshots français
│   │   ├── ios/        # Screenshots iPhone
│   │   │   ├── 1.png
│   │   │   ├── 2.png
│   │   │   ├── 3.png
│   │   │   ├── 4.png
│   │   │   └── 5.png
│   │   └── android/    # Screenshots Android
│   │       ├── 1.png
│   │       ├── 2.png
│   │       ├── 3.png
│   │       ├── 4.png
│   │       └── 5.png
│   └── en/             # Screenshots anglais
│       ├── ios/        # Screenshots iPhone
│       │   ├── 1.png
│       │   ├── 2.png
│       │   ├── 3.png
│       │   ├── 4.png
│       │   └── 5.png
│       └── android/    # Screenshots Android
│           ├── 1.png
│           ├── 2.png
│           ├── 3.png
│           ├── 4.png
│           └── 5.png
└── README.md          # Cette documentation
```

## Contenu

Le site présente :
- **Toggle de langue** : Basculement FR/EN avec sauvegarde de préférence (localStorage)
- **Toggle device** : Basculement iOS/Android avec détection automatique + sauvegarde (localStorage)
- **Hero section** : Présentation de l'application avec badges App Store et Google Play
- **Screenshots** : 5 captures d'écran adaptés selon la langue ET le device (iOS/Android)
- **Features** : 3 caractéristiques principales de l'application
- **Support** : Section contact avec email de support
- **Footer** : Liens vers mentions légales et politique de confidentialité

## Fonctionnalités

### Multilingue (FR/EN) + Multi-device (iOS/Android)
- **Toggle de langue** en haut à droite (FR/EN)
- **Toggle device** en haut à droite (📱 iOS / 🤖 Android)
- **Détection automatique** du device au chargement (user agent)
- Traductions complètes de tous les textes
- **Screenshots adaptés selon la langue ET le device** (assets/{lang}/{device}/)
- Badges stores adaptés selon la langue
- Meta tags SEO dynamiques selon la langue
- Préférences sauvegardées dans localStorage (lang + device)

### Design moderne
- Animations fluides au scroll
- Effets hover sur les cartes et screenshots
- Design responsive (mobile, tablette, desktop)
- Gradients et effets visuels subtils
- Transitions CSS optimisées

## Email de support

L'email de support configuré est : `resetpulse@irimwebforge.com`

## Déploiement

### URL de production

Le site est déployé sur : **http://resetpulse.irimwebforge.com**

### Configuration DNS

Record A configuré :
- Sous-domaine : `resetpulse`
- Type : `A`
- TTL : `1h`
- IP : `69.62.107.136`

### Serveur VPS

**Chemin sur le serveur** : `/srv/www/internal/resetpulse.irimwebforge.com/`

**Configuration nginx** : `/etc/nginx/sites-available/resetpulse.irimwebforge.com`

### Déployer les modifications

Pour déployer de nouvelles modifications :

```bash
# Depuis le dossier local du projet
cd /Users/irimwebforge/projects/dev/apps/resetpulse/website

# Copier les fichiers vers le VPS (inclure le dossier assets/)
scp -r * vps:/srv/www/internal/resetpulse.irimwebforge.com/

# Se connecter au VPS (si nécessaire de recharger nginx)
ssh vps

# Tester la configuration nginx
nginx -t

# Recharger nginx (si modification de config)
systemctl reload nginx
```

### Ajouter HTTPS (optionnel)

Pour sécuriser le site avec Let's Encrypt :

```bash
# Se connecter au VPS
ssh vps

# Installer le certificat SSL
certbot --nginx -d resetpulse.irimwebforge.com

# Suivre les instructions de Certbot
# Le renouvellement automatique est configuré par défaut
```

## Technologies utilisées

- HTML5
- CSS3 (inline dans le HTML)
- JavaScript vanilla (multilingue, localStorage)
- Design responsive
- Aucune dépendance externe

## Support navigateurs

- Chrome/Edge (dernières versions)
- Firefox (dernières versions)
- Safari (dernières versions)
- Mobile responsive (iOS, Android)

## Maintenance

### Mettre à jour les screenshots

1. Remplacer les fichiers dans les dossiers appropriés :
   - Screenshots français iPhone : `assets/fr/ios/1.png` à `5.png`
   - Screenshots français Android : `assets/fr/android/1.png` à `5.png`
   - Screenshots anglais iPhone : `assets/en/ios/1.png` à `5.png`
   - Screenshots anglais Android : `assets/en/android/1.png` à `5.png`
2. **Important** : Les screenshots changent automatiquement selon :
   - La langue sélectionnée (FR/EN)
   - Le device sélectionné (iOS/Android)
   - Détection automatique au premier chargement
3. Déployer les modifications via `scp` (inclure le dossier `assets/` complet)

### Modifier le contenu

1. Éditer le fichier `index.html`
2. Pour modifier les traductions, éditer l'objet `translations` dans le `<script>` (sections `fr` et `en`)
3. Tester localement (ouvrir dans un navigateur ou utiliser un serveur local)
4. Tester le toggle de langue (FR/EN)
5. Déployer les modifications via `scp`

### Logs nginx

Pour consulter les logs du site :

```bash
ssh vps

# Logs d'accès
tail -f /var/log/nginx/resetpulse.irimwebforge.com.access.log

# Logs d'erreur
tail -f /var/log/nginx/resetpulse.irimwebforge.com.error.log
```

## Notes

- Site statique sans backend
- Pas de cookies ni de tracking (utilise uniquement localStorage pour la préférence de langue)
- Optimisé pour la performance (cache 30 jours sur les assets)
- Encodage UTF-8 configuré
- Multilingue : FR (par défaut) et EN
- Multi-device : iOS (par défaut) et Android avec détection automatique
- Badges stores officiels Apple et Google (URLs dynamiques selon la langue)
- **4 combinaisons de screenshots** : FR/iOS, FR/Android, EN/iOS, EN/Android
