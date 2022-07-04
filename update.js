const { exec } = require('child_process');

exec(
  'git add --all && git commit -m "Test" && git tag test && git push --tags',
  (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  }
);
