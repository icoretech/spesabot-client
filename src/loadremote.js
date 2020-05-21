const HTTPs = require('https');
const {Task} = require('./task');
const MODULES = {};
const VM = require('vm');
const {Log} = require('./utils');

function myRequire(url, name) {

  Log.log(`loading external module ${name}`);

  // if ( MODULES[name] ) {
  //   // Log.info(`Remote file code already loaded: ${name}`);
  //   return Promise.resolve( MODULES[name] );
  // }

  Log.log(`loading module from remote url`);

  return new Promise( (resolve, reject) => {
    function getFileCode(code) {
      code = `(function(){
        return function(process, console, Task){
          ${code}
          return module.exports;
        }
      })();`
      // Log.info(`got remote file code: ${name}`);
      let context = VM.createContext({global, require, module: {exports: {} }});
      let fn = VM.runInContext( code, context, {filename: name});
      let _exports = fn(process, console, Task);
      // Log.info('LOADING REMOTE CODE', name);
      return resolve( MODULES[name] = _exports );
    }

    Req(url, getFileCode);
  });
}


function Req(url, cb) {
  let req = HTTPs.request(url, (res) => {
    res.setEncoding('utf8');

    let file_code = [];
    res.on('data', (chunk) => {
      file_code.push(chunk);
    });
    res.on('end', () => {
      cb( file_code.join('') );
    });
  });
  req.end();
}


module.exports = {myRequire}
