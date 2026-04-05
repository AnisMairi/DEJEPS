#!/bin/bash

# Script de déploiement complet pour Demo Fencing Vane
# Usage: ./deploy.sh (depuis la racine du projet)

set -e

echo "🚀 Déploiement de Demo Fencing Vane"
echo "===================================="

# Variables de configuration
APP_NAME="demo-fencing-vane"
APP_DIR="/var/www/demo-fencing-vane"
DOMAIN="escrimetalents.anis-mairi.com"
PORT=3000
CURRENT_DIR=$(pwd)

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
info() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. Vérification des prérequis
echo ""
echo "📋 Vérification des prérequis..."
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
    exit 1
else
    info "Node.js: $(node --version)"
fi

if ! command -v pm2 &> /dev/null; then
    error "PM2 n'est pas installé"
    exit 1
else
    info "PM2: $(pm2 --version)"
fi

if ! command -v nginx &> /dev/null; then
    error "Nginx n'est pas installé"
    exit 1
else
    info "Nginx installé"
fi

if ! command -v certbot &> /dev/null; then
    error "Certbot n'est pas installé"
    exit 1
else
    info "Certbot installé"
fi

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    error "package.json introuvable. Assurez-vous d'être dans le répertoire du projet."
    exit 1
fi

# 2. Création du répertoire de l'application
echo ""
echo "📁 Configuration du répertoire de l'application..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# 3. Copier les fichiers vers /var/www
echo ""
echo "📥 Copie des fichiers vers $APP_DIR..."
if [ "$CURRENT_DIR" != "$APP_DIR" ]; then
    info "Copie des fichiers depuis $CURRENT_DIR vers $APP_DIR..."
    sudo rsync -av --exclude 'node_modules' --exclude '.next' --exclude '.git' \
        $CURRENT_DIR/ $APP_DIR/
    sudo chown -R $USER:$USER $APP_DIR
else
    info "Déjà dans le répertoire de déploiement"
fi

cd $APP_DIR

# 4. Installation des dépendances
echo ""
echo "📦 Installation des dépendances..."
if [ -f "package.json" ]; then
    npm install --production
    info "Dépendances installées"
else
    error "package.json introuvable dans $APP_DIR"
    exit 1
fi

# 5. Build de l'application
echo ""
echo "🔨 Build de l'application Next.js..."
npm run build
info "Build terminé"

# 6. Configuration Nginx
echo ""
echo "⚙️  Configuration de Nginx..."
NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"

# Créer la configuration Nginx
sudo tee $NGINX_CONFIG > /dev/null <<EOF
# Configuration Nginx pour $APP_NAME
# Domaine: $DOMAIN

server {
    listen 80;
    server_name $DOMAIN;

    # Configuration temporaire pour permettre Certbot
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts pour les uploads de vidéos
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Cache pour les assets statiques
    location /_next/static {
        proxy_pass http://localhost:$PORT;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Activer le site Nginx
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

# Tester la configuration Nginx
info "Test de la configuration Nginx..."
if sudo nginx -t; then
    info "Configuration Nginx valide"
    sudo systemctl reload nginx
    info "Nginx rechargé"
else
    error "Erreur dans la configuration Nginx"
    exit 1
fi

# 7. Configuration PM2
echo ""
echo "⚙️  Configuration de PM2..."

# Arrêter l'ancienne instance si elle existe
pm2 delete $APP_NAME 2>/dev/null || warn "Aucune instance PM2 existante à supprimer"

# Démarrer l'application avec PM2
info "Démarrage de l'application avec PM2..."
cd $APP_DIR

pm2 start npm --name $APP_NAME -- start
pm2 save
info "Application démarrée avec PM2"

# 8. Configuration SSL avec Certbot
echo ""
echo "🔒 Configuration SSL avec Certbot..."
echo ""
warn "Certbot va maintenant configurer le certificat SSL"
warn "Vous devrez peut-être entrer votre email"
echo ""
read -p "Voulez-vous configurer SSL maintenant? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[OoYy]$ ]]; then
    info "Configuration SSL en cours..."
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --redirect || {
        warn "Certbot a échoué. Vous pouvez le relancer manuellement avec:"
        echo "  sudo certbot --nginx -d $DOMAIN"
    }
else
    warn "SSL non configuré. Pour le configurer plus tard, exécutez:"
    echo "  sudo certbot --nginx -d $DOMAIN"
fi

# 9. Vérification finale
echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "📊 Informations de déploiement:"
echo "  - Application: $APP_NAME"
echo "  - Répertoire: $APP_DIR"
echo "  - Domaine: $DOMAIN"
echo "  - Port: $PORT"
echo ""
echo "🔧 Commandes utiles:"
echo "  - Vérifier le statut: pm2 status"
echo "  - Voir les logs: pm2 logs $APP_NAME"
echo "  - Redémarrer: pm2 restart $APP_NAME"
echo "  - Arrêter: pm2 stop $APP_NAME"
echo ""
echo "🌐 Accès:"
echo "  - HTTP: http://$DOMAIN"
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "  - HTTPS: https://$DOMAIN"
fi
echo ""


