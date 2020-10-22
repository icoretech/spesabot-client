const IO = require('socket.io-client');
const { myRequire } = require('./loadremote');
const { BotCluster } = require('./task');
const { Log } = require('./utils');

let IOClient = null;


function connect(url) {

  if (isConnected()) {
    disconnect();
  }

  IOClient = IO(url, {
    transports: ['websocket'],
    autoConnect: false
  });



  IOClient.on('reconnect_attempt', () => {
    // TODO: log something
    Log.log('*** reconnecting');
  });


  IOClient.on('startbot', (data) => {
    // receive message to start bot
    Log.log('*** starting bot', data.bot_id);

    myRequire(data.js_url, data.bot_id).then((klass) => {

      let task = new klass( /* ...config */);

      BotCluster.queue({} /* ...data */, task);

    });

  });

  IOClient.on('connect', () => {
    Log.log('!! socket connected !!');
  })
  IOClient.on('connect_error', (err) => {
    Log.log('!! socket connection error !!', `${err}`);
  })
  IOClient.on('connect_timeout', (timeout) => {
    Log.log('!! connect timeout !!', timeout);
  })

  IOClient.on('error', (err) => {
    Log.log('!! error !!', `${err}`);
  })

  IOClient.on('disconnect', () => {
    Log.log('!! disconnect !!');
  })

  IOClient.on('reconnect', () => {
    Log.log('!! reconnect !!');
  })

  IOClient.on('reconnecting', () => {
    Log.log('!! reconnecting !!');
  })

  IOClient.on('reconnect_error', (err) => {
    Log.log('!! reconnect_error !!', `${err}`);
  })

  IOClient.on('reconnect_failed', () => {
    Log.log('!! reconnect_failed !!');
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
  if (isConnected()) {
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
