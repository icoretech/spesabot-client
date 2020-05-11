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
    console.warn('*** reconnecting');
  });


  IOClient.on('startbot', (data) => {
    // receive message to start bot
    console.log('***** starting bot', data.bot_id);

    myRequire(data.js_url, data.bot_id).then( (klass) => {

      let task = new klass( /* ...config */ );

      BotCluster.queue( {} /* ...data */, task);

    });

  });

  IOClient.on('connect', () => {
    console.log('!! socket connected !!');
  })
  IOClient.on('connect_error', (err) => {
    console.error('!! socket connection error !!', err);
  })
  IOClient.on('connect_timeout', (timeout) => {
    console.error('!! connect timeout !!', timeout);
  })

  IOClient.on('error', (err) => {
    console.error('!! error !!', err);
  })

  IOClient.on('disconnect', () => {
    console.warn('!! disconnect !!');
  })

  IOClient.on('reconnect', () => {
    console.log('!! reconnect !!');
  })

  IOClient.on('reconnecting', () => {
    console.log('!! reconnecting !!');
  })

  IOClient.on('reconnect_error', (err) => {
    console.error('!! reconnect_error !!', err);
  })

  IOClient.on('reconnect_failed', () => {
    console.warn('!! reconnect_failed !!');
  })

  // IOClient.on('ping', () => {
  //   console.log('!! ping !!');
  // })

  // IOClient.on('pong', () => {
  //   console.log('!! pong !!');
  // })

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
