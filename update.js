/* eslint-disable no-console */
const { exec } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

const PACKAGE_JSON_PATH = path.join(__dirname, 'release/app/package.json');
const PACKAGE_LOCK_JSON_PATH = path.join(
  __dirname,
  'release/app/package-lock.json'
);
const version = process.argv[2] || '1.0.0';
const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH));
const packageLockJson = JSON.parse(readFileSync(PACKAGE_LOCK_JSON_PATH));

packageJson.version = version;
packageLockJson.version = version;

writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2));
writeFileSync(packageLockJson, JSON.stringify(PACKAGE_LOCK_JSON_PATH, null, 2));

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
