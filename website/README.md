# ResetPulse - Site Marketing

Site vitrine et support pour l'application mobile ResetPulse.

## Structure du site

```
website/
├── index.html          # Page d'accueil
├── 1.png              # Screenshot 1
├── 2.png              # Screenshot 2
├── 3.png              # Screenshot 3
└── README.md          # Cette documentation
```

## Contenu

Le site présente :
- **Hero section** : Présentation de l'application avec CTA vers l'App Store
- **Screenshots** : 3 captures d'écran de l'application
- **Features** : 3 caractéristiques principales de l'application
- **Support** : Section contact avec email de support
- **Footer** : Liens vers mentions légales et politique de confidentialité

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
cd /Users/irimwebforge/Projets/apps/ResetPulse/website

# Copier les fichiers vers le VPS
scp * vps:/srv/www/internal/resetpulse.irimwebforge.com/

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
- Design responsive
- Aucune dépendance JavaScript

## Support navigateurs

- Chrome/Edge (dernières versions)
- Firefox (dernières versions)
- Safari (dernières versions)
- Mobile responsive (iOS, Android)

## Maintenance

### Mettre à jour les screenshots

1. Remplacer les fichiers `1.png`, `2.png`, `3.png` dans le dossier website
2. Déployer les modifications via `scp`

### Modifier le contenu

1. Éditer le fichier `index.html`
2. Tester localement (ouvrir dans un navigateur ou utiliser un serveur local)
3. Déployer les modifications via `scp`

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
- Pas de cookies ni de tracking
- Optimisé pour la performance (cache 30 jours sur les assets)
- Encodage UTF-8 configuré
