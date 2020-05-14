const EventEmitter = require('events').EventEmitter;

const Request = require('request');
const FS = require('fs');

const puppeteer = require('puppeteer-extra');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const chromium = require('chromium');

// const AirBrake = require('./airbrake');

puppeteer.use(AdblockerPlugin({blockTrackers: true}));
puppeteer.use(StealthPlugin());

const {
  Cluster
} = require('puppeteer-cluster');

const proxyUrl = process.env.PROXY_URL;

// chronium.path may or may provide a path in an asar archive.  If it does
// it is unusable, and we'll attempt to swap it out for the unarchived version
// const chromiumPath = chromium.path.replace('app.asar', 'app.asar.unpacked');
function getChromiumExecPath() {
  return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
}
// const chromiumPath = puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');

const puppeteerArgs = {
  // executablePath: '/usr/bin/chromium-browser',
  executablePath: chromiumPath,
  ignoreHTTPSErrors: true,
  headless: true,
  // args: [`--proxy-server=${proxyUrl}`, '--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--disable-gpu']
  args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--disable-gpu']
};

class BotClusterClass extends EventEmitter {
  constructor() {
    super();
    this.clusterReady = false;
    this.__task_queue = [];
    this.startCluster();
  }

  queue(userdata, task) {
    if ( this.clusterReady ) {
      this.__cluster.queue(userdata, task.execute.bind(task) );
    } else {
      this.__task_queue.push({userdata, task});
    }
  }

  async startCluster() {
    Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: process.env.CONCURRENCY || 2,
      puppeteer: getChromiumExecPath(),
      puppeteerOptions: puppeteerArgs,
      monitor: false,
      timeout: 130000
    }).then( (clust) => {
      this.__cluster = clust;
      this.clusterReady = true;
      this.startTasks();
    });
  }

  startTasks() {
    // double check (just to be sure)
    this.clusterReady = true;
    while( this.__task_queue.length > 0 ) {
      let obj = this.__task_queue.shift();
      this.queue(obj.userdata, obj.task);
    }
  }
}


let BotCluster = new BotClusterClass();


class Task {
  constructor(config){
    this.config = config;
    this.botcluster = BotCluster;
  }

  execute() {
    throw new Error('method not implemented');
  }

  notify() {
    // TODO: notify external listener
  }

  emit(eventName, user, filePath, url) {
    const formData = {
      screenshot: FS.createReadStream(filePath)
    };
    Request.post({
        url: url,
        formData: formData
    }, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);
    });

    let args = Array.prototype.slice(arguments, 0);
    this.botcluster.emit.apply(this.botcluster, args);
  }

}


module.exports = {BotCluster, Task};
