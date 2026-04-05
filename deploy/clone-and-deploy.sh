#!/bin/bash

# Script complet : Cloner le repo et déployer
# À exécuter sur le VPS

set -e

echo "🚀 Clonage et déploiement de Escrime Avenir - DEMO"
echo "===================================================="

# Variables
APP_NAME="escrime-avenir"
APP_DIR="/var/www/escrime-avenir"
DOMAIN="escrimetalents.anis-mairi.com"
PORT=3000
GIT_REPO=""  # À remplir avec l'URL du repo GitHub

# Demander l'URL du repo si non fournie
if [ -z "$GIT_REPO" ] || [ "$GIT_REPO" == "" ]; then
    echo ""
    echo "📋 Veuillez fournir l'URL du repository GitHub :"
    echo "   Exemple: https://github.com/votre-username/fencing-federation-frontend.git"
    echo "   Ou: git@github.com:votre-username/fencing-federation-frontend.git"
    read -p "URL du repo: " GIT_REPO
fi

# Vérifier que git est installé
if ! command -v git &> /dev/null; then
    echo "📦 Installation de Git..."
    sudo apt update
    sudo apt install -y git
fi

# Créer le répertoire parent si nécessaire
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www

# Cloner ou mettre à jour le repo
if [ -d "$APP_DIR" ]; then
    echo ""
    echo "📁 Le répertoire existe déjà. Mise à jour..."
    cd $APP_DIR
    git pull
else
    echo ""
    echo "📥 Clonage du repository..."
    cd /var/www
    git clone $GIT_REPO $APP_NAME
    cd $APP_DIR
fi

# Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."
npm install --production

# Build de l'application
echo ""
echo "🔨 Build de l'application Next.js..."
npm run build

# Arrêter l'ancienne instance si elle existe
echo ""
echo "🛑 Arrêt de l'ancienne instance..."
pm2 delete $APP_NAME 2>/dev/null || true

# Démarrer avec PM2
echo ""
echo "▶️  Démarrage de l'application avec PM2..."
pm2 start npm --name "$APP_NAME" -- start

# Sauvegarder la configuration PM2
echo ""
echo "💾 Sauvegarde de la configuration PM2..."
pm2 save

# Configurer PM2 pour démarrer au boot
echo ""
echo "⚙️  Configuration du démarrage automatique..."
pm2 startup | grep "sudo" | bash || echo "Démarrage automatique déjà configuré"

# Afficher le statut
echo ""
echo "📊 Statut de l'application:"
pm2 status

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "🌐 L'application devrait être accessible sur http://localhost:$PORT"
echo "📊 Gérer l'application:"
echo "   - pm2 status"
echo "   - pm2 logs $APP_NAME"
echo "   - pm2 restart $APP_NAME"
echo ""
echo "🔒 N'oubliez pas de configurer SSL avec:"
echo "   sudo certbot --nginx -d $DOMAIN"

