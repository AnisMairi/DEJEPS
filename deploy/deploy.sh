#!/bin/bash

# Script de déploiement pour Escrime Avenir - DEMO
# Usage: ./deploy.sh

set -e

echo "🚀 Déploiement de Escrime Avenir - DEMO"

# Variables
APP_NAME="escrime-avenir"
APP_DIR="/var/www/escrime-avenir"
SERVICE_NAME="escrime-avenir"
PORT=3000

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Installation..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Vérifier que PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installation de PM2..."
    sudo npm install -g pm2
fi

# Créer le répertoire de l'application
echo "📁 Création du répertoire de l'application..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Copier les fichiers (à faire manuellement ou via git)
echo "📋 Assurez-vous que les fichiers du projet sont dans $APP_DIR"

# Installer les dépendances
echo "📦 Installation des dépendances..."
cd $APP_DIR
npm install --production

# Build de l'application
echo "🔨 Build de l'application..."
npm run build

# Démarrer avec PM2
echo "▶️  Démarrage de l'application avec PM2..."
pm2 delete $SERVICE_NAME 2>/dev/null || true
pm2 start npm --name $SERVICE_NAME -- start
pm2 save
pm2 startup

echo "✅ Déploiement terminé!"
echo "🌐 L'application est accessible sur http://localhost:$PORT"
echo "📊 Gérer l'application: pm2 status, pm2 logs $SERVICE_NAME, pm2 restart $SERVICE_NAME"

