const startingPage = "https://www.esselunga.it/area-utenti/applicationCheck?appName=esselungaEcommerce&daru=https%3A%2F%2Fwww.esselungaacasa.it%3A443%2Fecommerce%2Fnav%2Fauth%2Fsupermercato%2Fhome.html%3F&loginType=light";
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36';
const EventEmitter = require('events').EventEmitter;

const puppeteer = require('puppeteer-extra');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// const AirBrake = require('./airbrake');

puppeteer.use(AdblockerPlugin({blockTrackers: true}));
puppeteer.use(StealthPlugin());

const {
  Cluster
} = require('puppeteer-cluster');

const proxyUrl = process.env.PROXY_URL;

const puppeteerArgs = {
  executablePath: '/usr/bin/chromium-browser',
  ignoreHTTPSErrors: true,
  headless: true,
  args: [`--proxy-server=${proxyUrl}`, '--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--disable-gpu']
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
      puppeteer: puppeteer,
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

  emit() {
    let args = Array.prototype.slice(arguments, 0);
    this.botcluster.emit.apply(this.botcluster, args);
  }

}


module.exports = {BotCluster, Task};
