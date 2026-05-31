module.exports = {
  apps: [
    {
      name: 'orthoplus-backend',
      script: './backend/dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3005
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      restart_delay: 3000,
      max_restarts: 5,
      min_uptime: '10s',
      listen_timeout: 10000,
      kill_timeout: 5000,
      wait_ready: true
    }
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: ['tsiapp.io'],
      ref: 'origin/main',
      repo: 'https://github.com/B0yZ4kr14/OrthoPlus-Enterprise.git',
      path: '/var/www/orthoplus',
      'post-deploy': 'pnpm install --frozen-lockfile && pnpm build && pm2 reload ecosystem.config.cjs --env production'
    }
  }
};
