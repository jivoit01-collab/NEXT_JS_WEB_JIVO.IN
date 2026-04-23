module.exports = {
  apps: [
    {
      name: "jivo-web",
      script: ".next/standalone/server.js",
      env: {
        PORT: "3001",
        NODE_ENV: "production"
      }
    }
  ]
};