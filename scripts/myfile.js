import { exec } from "child_process";

// Function to run a shell command and log output
function runCommand(command) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️ Stderr: ${stderr}`);
      return;
    }
    console.log(stdout);
  });
}

// Check GitHub CLI auth status
console.log("🔑 Checking GitHub CLI authentication...");
runCommand("gh auth status");

// Optionally authenticate using GITHUB_TOKEN
if (process.env.GITHUB_TOKEN) {
  console.log("🔐 Logging in with GITHUB_TOKEN...");
  runCommand(`echo "${process.env.GITHUB_TOKEN}" | gh auth login --with-token`);
} else {
  console.log("💡 No GITHUB_TOKEN found. To authenticate manually, run: gh auth login");
}
