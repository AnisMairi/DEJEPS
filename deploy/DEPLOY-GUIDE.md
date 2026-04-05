# Guide de Déploiement - Demo Fencing Vane

## 📋 Informations de Configuration

- **Domaine**: `escrimetalents.anis-mairi.com`
- **IP VPS**: `51.75.160.211`
- **Nom App PM2**: `demo-fencing-vane`
- **Port**: `3000`
- **Répertoire**: `/var/www/demo-fencing-vane`

## 🚀 Déploiement Automatique (Recommandé)

### Étape 1: Connectez-vous au VPS

```bash
ssh ubuntu@51.75.160.211
```

### Étape 2: Téléchargez et exécutez le script de déploiement

```bash
# Créer le répertoire de travail
cd /tmp

# Télécharger le script depuis GitHub (ou copier via SCP)
# Option 1: Si vous avez déjà cloné le repo
cd /var/www/demo-fencing-vane/fencing-detection-demo/deploy
chmod +x deploy-complete.sh
./deploy-complete.sh

# Option 2: Télécharger directement depuis GitHub
curl -o deploy-complete.sh https://raw.githubusercontent.com/AnisMairi/demo-fencing-vane/main/fencing-detection-demo/deploy/deploy-complete.sh
chmod +x deploy-complete.sh
./deploy-complete.sh
```

Le script va automatiquement:
- ✅ Cloner/mettre à jour le repository
- ✅ Installer les dépendances
- ✅ Builder l'application Next.js
- ✅ Configurer Nginx
- ✅ Démarrer l'application avec PM2
- ✅ Proposer la configuration SSL avec Certbot

## 🔧 Déploiement Manuel (Alternative)

### 1. Cloner le repository

```bash
cd /var/www
sudo mkdir -p demo-fencing-vane
sudo chown -R $USER:$USER demo-fencing-vane
cd demo-fencing-vane
git clone https://github.com/AnisMairi/demo-fencing-vane.git .
cd fencing-detection-demo
```

### 2. Installer les dépendances et builder

```bash
npm install --production
npm run build
```

### 3. Configurer Nginx

```bash
# Copier la configuration
sudo cp deploy/nginx-config.example /etc/nginx/sites-available/demo-fencing-vane

# Éditer pour s'assurer que le domaine est correct
sudo nano /etc/nginx/sites-available/demo-fencing-vane
# Vérifier que server_name est bien: escrimetalents.anis-mairi.com

# Activer le site
sudo ln -s /etc/nginx/sites-available/demo-fencing-vane /etc/nginx/sites-enabled/

# Tester et recharger
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Démarrer avec PM2

```bash
cd /var/www/demo-fencing-vane/fencing-detection-demo
pm2 start npm --name "demo-fencing-vane" -- start
pm2 save
pm2 startup  # Suivre les instructions affichées
```

### 5. Configurer SSL

```bash
sudo certbot --nginx -d escrimetalents.anis-mairi.com
sudo systemctl reload nginx
```

## 🔄 Mise à jour de l'application

```bash
cd /var/www/demo-fencing-vane/fencing-detection-demo
git pull origin main
npm install --production
npm run build
pm2 restart demo-fencing-vane
```

## 📊 Commandes de gestion

```bash
# Vérifier le statut
pm2 status
pm2 logs demo-fencing-vane

# Redémarrer
pm2 restart demo-fencing-vane

# Arrêter
pm2 stop demo-fencing-vane

# Vérifier Nginx
sudo systemctl status nginx
sudo nginx -t

# Voir les logs Nginx
sudo tail -f /var/log/nginx/demo-fencing-vane-access.log
sudo tail -f /var/log/nginx/demo-fencing-vane-error.log
```

## ✅ Vérification

1. **Vérifier que l'application tourne**:
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

2. **Vérifier Nginx**:
   ```bash
   sudo systemctl status nginx
   curl http://escrimetalents.anis-mairi.com
   ```

3. **Vérifier SSL** (après configuration):
   ```bash
   curl https://escrimetalents.anis-mairi.com
   ```

## 🌐 Accès

- **HTTP**: http://escrimetalents.anis-mairi.com
- **HTTPS**: https://escrimetalents.anis-mairi.com (après configuration SSL)

## ⚠️ Notes importantes

- Le script de déploiement gère automatiquement le chemin `fencing-detection-demo/`
- Assurez-vous que le DNS pointe bien vers `51.75.160.211`
- Le port 3000 doit être accessible en localhost (pas besoin d'ouvrir le firewall)
- Nginx fait le proxy vers localhost:3000

## 🐛 Dépannage

### L'application ne démarre pas
```bash
pm2 logs demo-fencing-vane --lines 50
cd /var/www/demo-fencing-vane/fencing-detection-demo
npm run build  # Rebuild si nécessaire
```

### Erreur Nginx
```bash
sudo nginx -t  # Vérifier la configuration
sudo tail -f /var/log/nginx/error.log
```

### Problème de permissions
```bash
sudo chown -R $USER:$USER /var/www/demo-fencing-vane
```


