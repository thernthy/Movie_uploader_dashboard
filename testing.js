const { exec } = require("child_process");

exec(
  'powershell -Command "Get-PSDrive -PSProvider FileSystem"',
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing PowerShell command: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`PowerShell command stderr: ${stderr}`);
      return;
    }
    console.log(`Disk Space Information:\n${stdout}`);
  },
);
