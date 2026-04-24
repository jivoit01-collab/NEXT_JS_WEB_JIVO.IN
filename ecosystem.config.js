module.exports = {
  apps: [
    {
      name: "jivo-web",
      script: "npm",
      args: "start",
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