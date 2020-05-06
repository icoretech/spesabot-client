const IO = require('socket.io-client');
const {myRequire} = require('../loadremote');
const {BotCluster} = require('../task');


let IOClient = null;


function connect( chl ) {

  if ( isConnected() ) {
    disconnect();
  }

  IOClient = IO( /* URL */ `?channel=${chl}`, {
    transports: ['websocket'],
    autoConnect: false
  });



  IOClient.on('reconnect_attempt', () => {
    // TODO: log something
  });


  IOClient.on('startbot', (data) => {
    // receive message to start bot

    myRequire(data.js_url, data.bot_id).then( (klass) => {

      let task = new klass( /* ...config */ );

      BotCluster.queue( {} /* ...data */, task);

    });

  });


  IOClient.open();

}




function disconnect() {
  if ( isConnected() ) {
    IOClient.close();
  }
}


function isConnected() {
  return IOCLient && IOClient.connected;
}



module.exports = {
  connect,
  disconnect,
  isConnected
}
