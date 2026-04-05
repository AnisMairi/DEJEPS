# Guide de déploiement - Escrime Avenir - DEMO

## Prérequis

1. **VPS OVH avec accès SSH**
2. **Node.js 20+** installé
3. **Nginx** installé et configuré
4. **PM2** pour la gestion du processus
5. **Certbot** pour les certificats SSL

## Étapes de déploiement

### 1. Configuration du sous-domaine dans OVH

1. Connectez-vous à votre espace client OVH
2. Allez dans **Domaines** > **anis-mairi.com** > **Zone DNS**
3. Ajoutez un enregistrement **A** :
   - **Sous-domaine** : `escrimetalents`
   - **Cible** : IP de votre VPS
   - **TTL** : 3600

### 2. Préparation du VPS

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2 globalement
sudo npm install -g pm2

# Installer Nginx
sudo apt install -y nginx

# Installer Certbot pour SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 3. Cloner le projet sur le VPS

```bash
# Créer le répertoire
sudo mkdir -p /var/www/escrime-avenir
sudo chown -R $USER:$USER /var/www/escrime-avenir

# Cloner le repo (remplacez par votre méthode de déploiement)
cd /var/www/escrime-avenir
git clone <votre-repo> .
# OU copier les fichiers via SCP/SFTP
```

### 4. Installation et build

```bash
cd /var/www/escrime-avenir

# Installer les dépendances
npm install --production

# Build de l'application
npm run build
```

### 5. Configuration PM2

```bash
# Démarrer l'application
pm2 start npm --name "escrime-avenir" -- start

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivre les instructions affichées
```

### 6. Configuration Nginx

1. Copier le fichier de configuration :
```bash
sudo cp deploy/nginx-config.example /etc/nginx/sites-available/escrime-avenir
```

2. Modifier le fichier avec votre sous-domaine :
```bash
sudo nano /etc/nginx/sites-available/escrime-avenir
# Vérifier que escrimetalents.anis-mairi.com est bien configuré
```

3. Créer le lien symbolique :
```bash
sudo ln -s /etc/nginx/sites-available/escrime-avenir /etc/nginx/sites-enabled/
```

4. Tester la configuration :
```bash
sudo nginx -t
```

5. Recharger Nginx :
```bash
sudo systemctl reload nginx
```

### 7. Configuration SSL avec Let's Encrypt

```bash
# Obtenir le certificat SSL
sudo certbot --nginx -d escrimetalents.anis-mairi.com

# Le certificat sera renouvelé automatiquement
```

### 8. Vérification

- Vérifier que l'application tourne : `pm2 status`
- Vérifier les logs : `pm2 logs escrime-avenir`
- Tester l'accès : `https://escrimetalents.anis-mairi.com`

## Commandes utiles

```bash
# Redémarrer l'application
pm2 restart escrime-avenir

# Voir les logs
pm2 logs escrime-avenir

# Arrêter l'application
pm2 stop escrime-avenir

# Recharger Nginx
sudo systemctl reload nginx

# Vérifier le statut Nginx
sudo systemctl status nginx
```

## Mise à jour de l'application

```bash
cd /var/www/escrime-avenir

# Pull les dernières modifications
git pull  # ou copier les nouveaux fichiers

# Réinstaller les dépendances si nécessaire
npm install --production

# Rebuild
npm run build

# Redémarrer
pm2 restart escrime-avenir
```

## Variables d'environnement (si nécessaire)

Créer un fichier `.env.local` dans `/var/www/escrime-avenir` si besoin :

```bash
# Pas nécessaire pour le mode démo actuel
# Mais peut être ajouté pour la production future
```

## Sécurité

- ✅ Firewall configuré (UFW recommandé)
- ✅ SSL/HTTPS activé
- ✅ Application en mode démo (pas de backend sensible)
- ✅ Ports fermés sauf 80, 443, 22

