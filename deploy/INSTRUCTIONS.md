# Instructions de déploiement - Escrime Avenir - DEMO

## Sous-domaine : escrimetalents.anis-mairi.com

## Étape 1 : Configuration DNS dans OVH

1. Connectez-vous à votre espace client OVH
2. Allez dans **Domaines** > **anis-mairi.com** > **Zone DNS**
3. Ajoutez un enregistrement **A** :
   - **Sous-domaine** : `escrimetalents`
   - **Cible** : `51.75.160.211` (IP de votre VPS)
   - **TTL** : 3600
4. Attendez quelques minutes pour la propagation DNS

## Étape 2 : Configuration initiale du VPS

Connectez-vous au VPS :
```bash
ssh ubuntu@51.75.160.211
```

Exécutez le script de configuration :
```bash
# Télécharger ou copier le script setup-vps.sh sur le VPS
chmod +x setup-vps.sh
./setup-vps.sh
```

Ce script va :
- Mettre à jour le système
- Installer Node.js 20
- Installer PM2
- Installer Nginx
- Installer Certbot
- Créer le répertoire de l'application
- Configurer Nginx

## Étape 3 : Cloner ou copier les fichiers du projet

### Option A : Cloner depuis GitHub (Recommandé)

Si votre repo est sur GitHub, clonez-le directement sur le VPS :

```bash
# Sur le VPS
cd /var/www
sudo mkdir -p escrime-avenir
sudo chown -R $USER:$USER escrime-avenir
cd escrime-avenir

# Cloner le repo (remplacez par votre URL GitHub)
git clone https://github.com/VOTRE-USERNAME/fencing-federation-frontend.git .

# OU si vous utilisez SSH
git clone git@github.com:VOTRE-USERNAME/fencing-federation-frontend.git .
```

### Option B : Copier depuis votre machine locale

Depuis votre machine locale, copiez les fichiers vers le VPS :

```bash
# Depuis le répertoire du projet
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ ubuntu@51.75.160.211:/var/www/escrime-avenir/
```

OU utilisez SCP :
```bash
scp -r . ubuntu@51.75.160.211:/var/www/escrime-avenir/
```

## Étape 4 : Déployer l'application

Sur le VPS, exécutez :
```bash
cd /var/www/escrime-avenir
chmod +x deploy/deploy-app.sh
./deploy/deploy-app.sh
```

OU manuellement :
```bash
cd /var/www/escrime-avenir
npm install --production
npm run build
pm2 start npm --name "escrime-avenir" -- start
pm2 save
pm2 startup  # Suivre les instructions
```

## Étape 5 : Configurer SSL avec Let's Encrypt

```bash
sudo certbot --nginx -d escrimetalents.anis-mairi.com
```

Répondez aux questions :
- Email : votre email
- Accepter les conditions : O
- Redirection HTTP vers HTTPS : 2 (Recommandé)

## Étape 6 : Recharger Nginx

```bash
sudo systemctl reload nginx
```

## Étape 7 : Vérification

1. Vérifier que l'application tourne :
   ```bash
   pm2 status
   ```

2. Vérifier les logs :
   ```bash
   pm2 logs escrime-avenir
   ```

3. Tester l'accès :
   - Ouvrir dans le navigateur : `https://escrimetalents.anis-mairi.com`
   - Devrait rediriger vers `/login`

## Commandes utiles

```bash
# Redémarrer l'application
pm2 restart escrime-avenir

# Voir les logs en temps réel
pm2 logs escrime-avenir --lines 50

# Arrêter l'application
pm2 stop escrime-avenir

# Recharger Nginx après modification
sudo systemctl reload nginx

# Vérifier le statut Nginx
sudo systemctl status nginx

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/escrime-avenir-access.log
sudo tail -f /var/log/nginx/escrime-avenir-error.log
```

## Mise à jour de l'application

```bash
cd /var/www/escrime-avenir

# Copier les nouveaux fichiers (depuis votre machine locale)
# rsync -avz --exclude 'node_modules' --exclude '.next' ./ ubuntu@51.75.160.211:/var/www/escrime-avenir/

# Sur le VPS
npm install --production
npm run build
pm2 restart escrime-avenir
```

## Dépannage

### L'application ne démarre pas
```bash
pm2 logs escrime-avenir
# Vérifier les erreurs dans les logs
```

### Nginx ne fonctionne pas
```bash
sudo nginx -t  # Tester la configuration
sudo systemctl status nginx  # Vérifier le statut
```

### Le certificat SSL ne fonctionne pas
```bash
sudo certbot certificates  # Vérifier les certificats
sudo certbot renew --dry-run  # Tester le renouvellement
```

### Port déjà utilisé
```bash
# Vérifier quel processus utilise le port 3000
sudo lsof -i :3000
# Modifier le port dans ecosystem.config.js si nécessaire
```

