module.exports = {
    apps: [
      {
        name: 'ai_long _form_writing_tool',
        script: 'pnpm',
        args: 'start',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
          NODE_ENV: 'production',
        },
      },
    ],
  };