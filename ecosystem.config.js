module.exports = {
  apps: [
    {
      name: "jivo-web",
      script: "node",
      args: "node_modules/next/dist/bin/next start -p 3001",
      cwd: "D:/LiveProject/NEXT_JS_WEB_JIVO.IN",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3001"
      }
    }
  ]
};