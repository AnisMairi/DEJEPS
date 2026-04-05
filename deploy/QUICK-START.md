# Guide de démarrage rapide - Escrime Avenir - DEMO

## 🚀 Déploiement en 5 étapes

### 1. Configuration DNS dans OVH ⚙️

1. Connectez-vous à OVH > Domaines > anis-mairi.com > Zone DNS
2. Ajoutez un enregistrement **A** :
   - Sous-domaine : `escrimetalents`
   - Cible : `51.75.160.211`
   - TTL : 3600
3. Attendez 5-10 minutes

### 2. Configuration initiale du VPS 🔧

Connectez-vous au VPS :
```bash
ssh ubuntu@51.75.160.211
```

Copiez le script de configuration depuis votre machine locale :
```bash
# Depuis votre machine locale (dans le répertoire du projet)
scp deploy/setup-vps.sh ubuntu@51.75.160.211:~/
```

Sur le VPS, exécutez :
```bash
chmod +x setup-vps.sh
./setup-vps.sh
```

### 3. Cloner le repository 📥

**Option 1 : Si le repo est public sur GitHub**
```bash
cd /var/www
sudo mkdir -p escrime-avenir
sudo chown -R $USER:$USER escrime-avenir
cd escrime-avenir
git clone https://github.com/VOTRE-USERNAME/fencing-federation-frontend.git .
```

**Option 2 : Si le repo est privé**
```bash
# Générer une clé SSH sur le VPS si nécessaire
ssh-keygen -t ed25519 -C "vps@escrimetalents"
# Ajouter la clé publique à GitHub (Settings > SSH Keys)

# Puis cloner
cd /var/www
sudo mkdir -p escrime-avenir
sudo chown -R $USER:$USER escrime-avenir
cd escrime-avenir
git clone git@github.com:VOTRE-USERNAME/fencing-federation-frontend.git .
```

**Option 3 : Copier depuis votre machine locale**
```bash
# Depuis votre machine locale
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ ubuntu@51.75.160.211:/var/www/escrime-avenir/
```

### 4. Déployer l'application 🚀

Sur le VPS :
```bash
cd /var/www/escrime-avenir

# Installer et build
npm install --production
npm run build

# Démarrer avec PM2
pm2 start npm --name "escrime-avenir" -- start
pm2 save
pm2 startup  # Suivre les instructions affichées
```

### 5. Configurer SSL 🔒

```bash
sudo certbot --nginx -d escrimetalents.anis-mairi.com
sudo systemctl reload nginx
```

## ✅ Vérification

```bash
# Vérifier que l'app tourne
pm2 status

# Vérifier les logs
pm2 logs escrime-avenir

# Tester dans le navigateur
# https://escrimetalents.anis-mairi.com
```

## 🔄 Mise à jour future

Si vous avez cloné depuis GitHub :
```bash
cd /var/www/escrime-avenir
git pull
npm install --production
npm run build
pm2 restart escrime-avenir
```

Si vous avez copié les fichiers :
```bash
# Depuis votre machine locale
rsync -avz --exclude 'node_modules' --exclude '.next' \
  ./ ubuntu@51.75.160.211:/var/www/escrime-avenir/

# Sur le VPS
cd /var/www/escrime-avenir
npm install --production
npm run build
pm2 restart escrime-avenir
```

