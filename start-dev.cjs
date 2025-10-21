const { spawn } = require("child_process");

spawn("npm", ["run", "dev"], {
  detached: true,
  stdio: "ignore",
  shell: true,
});