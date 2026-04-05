#!/bin/bash

# Script de déploiement complet pour Demo Fencing Vane
# Usage: ./deploy-complete.sh

set -e

echo "🚀 Déploiement de Demo Fencing Vane"
echo "===================================="

# Variables de configuration
APP_NAME="demo-fencing-vane"
APP_DIR="/var/www/demo-fencing-vane"
DOMAIN="escrimetalents.anis-mairi.com"
PORT=3000
REPO_URL="https://github.com/AnisMairi/demo-fencing-vane.git"

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

# 2. Création du répertoire de l'application
echo ""
echo "📁 Configuration du répertoire de l'application..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# 3. Cloner ou mettre à jour le repository
echo ""
echo "📥 Clonage/Mise à jour du repository..."
if [ -d "$APP_DIR/.git" ]; then
    info "Repository existant détecté, mise à jour..."
    cd $APP_DIR
    git pull origin main
else
    info "Clonage du repository..."
    cd /var/www
    sudo rm -rf $APP_DIR 2>/dev/null || true
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Naviguer dans le sous-dossier fencing-detection-demo
if [ -d "fencing-detection-demo" ]; then
    cd fencing-detection-demo
    info "Navigation dans fencing-detection-demo/"
fi

# 4. Installation des dépendances
echo ""
echo "📦 Installation des dépendances..."
if [ -f "package.json" ]; then
    npm install --production
    info "Dépendances installées"
else
    error "package.json introuvable dans $(pwd)"
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

    # Redirection HTTP vers HTTPS (sera activée après Certbot)
    # return 301 https://\$server_name\$request_uri;
    
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

# Configuration HTTPS (sera complétée par Certbot)
# server {
#     listen 443 ssl http2;
#     server_name $DOMAIN;
#
#     ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
#     
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
#     ssl_prefer_server_ciphers on;
#
#     access_log /var/log/nginx/$APP_NAME-access.log;
#     error_log /var/log/nginx/$APP_NAME-error.log;
#
#     client_max_body_size 500M;
#
#     location / {
#         proxy_pass http://localhost:$PORT;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade \$http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#         proxy_cache_bypass \$http_upgrade;
#         
#         proxy_connect_timeout 300s;
#         proxy_send_timeout 300s;
#         proxy_read_timeout 300s;
#     }
#
#     location /_next/static {
#         proxy_pass http://localhost:$PORT;
#         proxy_cache_valid 200 60m;
#         add_header Cache-Control "public, immutable";
#     }
# }
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
if [ -d "fencing-detection-demo" ]; then
    cd fencing-detection-demo
fi

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


