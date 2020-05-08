const IO = require('socket.io-client');
const {myRequire} = require('../loadremote');
const {BotCluster} = require('../task');


let IOClient = null;


function connect( url ) {

  if ( isConnected() ) {
    disconnect();
  }

  IOClient = IO( url, {
    transports: ['websocket'],
    autoConnect: false
  });



  IOClient.on('reconnect_attempt', () => {
    // TODO: log something
  });


  IOClient.on('startbot', (data) => {
    // receive message to start bot
    console.log('***** starting bot', data.bot_id);

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
  return IOClient && IOClient.connected;
}



module.exports = {
  connect,
  disconnect,
  isConnected
}
