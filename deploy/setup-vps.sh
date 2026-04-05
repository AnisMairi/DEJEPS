#!/bin/bash

# Script de configuration complète pour Escrime Avenir - DEMO
# À exécuter sur le VPS Ubuntu

set -e

echo "🚀 Configuration du VPS pour Escrime Avenir - DEMO"
echo "=================================================="

# Variables
APP_NAME="escrime-avenir"
APP_DIR="/var/www/escrime-avenir"
DOMAIN="escrimetalents.anis-mairi.com"
PORT=3000

# 1. Mise à jour du système
echo ""
echo "📦 Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# 2. Installation de Node.js 20
echo ""
echo "📦 Vérification/Installation de Node.js..."
if ! command -v node &> /dev/null; then
    echo "Installation de Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js déjà installé: $(node --version)"
fi

# 3. Installation de PM2
echo ""
echo "📦 Installation de PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo "PM2 installé"
else
    echo "PM2 déjà installé: $(pm2 --version)"
fi

# 4. Installation de Nginx
echo ""
echo "📦 Vérification/Installation de Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    echo "Nginx installé"
else
    echo "Nginx déjà installé"
fi

# 5. Installation de Certbot
echo ""
echo "📦 Installation de Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    echo "Certbot installé"
else
    echo "Certbot déjà installé"
fi

# 6. Création du répertoire de l'application
echo ""
echo "📁 Création du répertoire de l'application..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# 7. Configuration Nginx
echo ""
echo "⚙️  Configuration de Nginx..."
sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Redirection HTTP vers HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # Certificats SSL (sera configuré par Certbot)
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Configuration SSL recommandée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/$APP_NAME-access.log;
    error_log /var/log/nginx/$APP_NAME-error.log;

    # Taille maximale des uploads (pour les vidéos)
    client_max_body_size 500M;

    # Proxy vers l'application Next.js
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

# Activer le site
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

# Tester la configuration Nginx
echo ""
echo "🔍 Test de la configuration Nginx..."
sudo nginx -t

echo ""
echo "✅ Configuration de base terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Copier les fichiers du projet dans $APP_DIR"
echo "2. Exécuter: cd $APP_DIR && npm install --production && npm run build"
echo "3. Démarrer avec PM2: pm2 start npm --name '$APP_NAME' -- start"
echo "4. Sauvegarder PM2: pm2 save && pm2 startup"
echo "5. Configurer SSL: sudo certbot --nginx -d $DOMAIN"
echo "6. Recharger Nginx: sudo systemctl reload nginx"

