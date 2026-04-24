module.exports = {
  apps: [
    {
      name: "jivo-web",
      script: "server.js",
      cwd: "D:/LiveProject/NEXT_JS_WEB_JIVO.IN/.next/standalone",
      env: {
        PORT: "3001",
        NODE_ENV: "production"
      }
    }
  ]
};