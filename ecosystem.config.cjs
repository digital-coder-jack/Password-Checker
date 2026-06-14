// PM2 process config for serving the production build in the sandbox.
// Vite's preview server statically serves the `dist/` output on port 3000.
module.exports = {
  apps: [
    {
      name: 'securepass',
      script: 'npm',
      args: 'run preview -- --host 0.0.0.0 --port 3000',
      cwd: '/home/user/webapp',
      env: { NODE_ENV: 'production' },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
}
