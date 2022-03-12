module.exports = {
  apps : [{
    name   : "dashboard-app",
    script : "./src/server.js",
    instances : "3",
    exec_mode : "cluster",
    watch: "true"
  }]
}
