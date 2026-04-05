#!/bin/bash

# Script de déploiement de l'application
# À exécuter après avoir copié les fichiers dans /var/www/escrime-avenir

set -e

APP_NAME="escrime-avenir"
APP_DIR="/var/www/escrime-avenir"
PORT=3000

echo "🚀 Déploiement de Escrime Avenir - DEMO"
echo "========================================"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "$APP_DIR/package.json" ]; then
    echo "❌ Erreur: package.json non trouvé dans $APP_DIR"
    echo "Assurez-vous d'avoir copié tous les fichiers du projet dans $APP_DIR"
    exit 1
fi

cd $APP_DIR

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
echo "   sudo certbot --nginx -d escrimetalents.anis-mairi.com"

