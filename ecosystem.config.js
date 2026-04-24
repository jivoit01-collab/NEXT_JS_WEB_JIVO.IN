module.exports = {
  apps: [
    {
      name: "jivo-web",
      script: ".next/standalone/server.js",
      instances: "max",   // 🔥 IMPORTANT
      exec_mode: "cluster",
      env: {
        PORT: "3001",
        NODE_ENV: "production"
      }
    }
  ]
};