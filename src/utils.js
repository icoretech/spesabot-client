const Path = require('path');
const FS = require('fs');
const ElectronLog = require('node-log-rotate');
const Package = require('../package.json');
const OS = require('os');


ElectronLog.setup({
  appName: Package.name,  // require for directory name
  maxSize: 10 * 1024 * 1024
})

// delete log before 2 days old
ElectronLog.deleteLog(2);


const TEMP_FOLDER = OS.tmpdir(); // Path.join(process.env.TMPDIR, '.spesabot');
console.log('temp folder is', TEMP_FOLDER);
// if ( ! FS.existsSync( TEMP_FOLDER ) ) {
//   console.log(`creating folder ${TEMP_FOLDER}`);
//   ElectronLog.log(`creating folder ${TEMP_FOLDER}`);
//   try {
//     FS.mkdirSync(TEMP_FOLDER, { recursive: true } );
//   } catch( e ) {
//     ElectronLog.log(`error ${e}`);
//     throw e;
//   }

// }


module.exports = {
  Log: {
    log: ElectronLog.log
  },
  TempFolder: TEMP_FOLDER,
  Name: Package.name
};
