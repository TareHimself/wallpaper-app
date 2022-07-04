const { exec } = require('child_process');

const version = process.argv[2] || '1.0.0';
console.log(version);
exec(
  `git add --all && git commit -m "test" && git tag v${version} && git push --tags`,
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
