// Configuration PM2 pour le déploiement
module.exports = {
  apps: [
    {
      name: 'escrime-avenir',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/escrime-avenir',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/escrime-avenir-error.log',
      out_file: '/var/log/pm2/escrime-avenir-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
    },
  ],
}

