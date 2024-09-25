const { exec } = require('child_process');
const path = require('path');

async function runCommand(command, desiredDirectory) {

  const cwd = desiredDirectory ? desiredDirectory : __dirname;

  console.log("running command in cwd:", cwd);
  return new Promise((resolve, reject) => {
    exec(command, { cwd, maxBuffer: 1024 * 10000 }, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
//      console.log('stdout: ', stdout);
      console.log('stderr: ', stderr);

      resolve();
    });
  });
}

async function buildMupen64PlusWithArgs(args) {
  await runCommand('make clean-web', path.join(__dirname, '../../'));
  await runCommand('make ' + args, path.join(__dirname, '../../'));
}

async function prepareBenchmark() {

  const benchmarkDirectory = path.join(__dirname, '../../mupen64plus-web-benchmark');
  
  await runCommand('npm install', benchmarkDirectory);
  await runCommand('npm run build', benchmarkDirectory);
}


module.exports = {
  runCommand,
  buildMupen64PlusWithArgs,
  prepareBenchmark
}
