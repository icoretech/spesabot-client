

class Esselunga extends Task {

  constructor(config) {
    super(config);
  }


  async execute({page, data: userdata}) {
    let user = JSON.parse(userdata);
    // data.find(_item => _item.email === email);
    let email = user.email;
    let password = user.password;
    let botId = user.botId;
    let screenshotFile = `screenshots/${Date.now()}.png`;
    const screenshotPath = this.computePath( screenshotFile );

    this.Log(`starting job for ${email} / ${password} / ${botId}`);

    // const navigationPromise = page.waitForNavigation({ waitUntil: ['domcontentloaded'] });

    await page.setViewport({ width: 1280, height: 800 })
    // await page.setUserAgent(userAgent);
    // const ua = await page.evaluate('navigator.userAgent');
    // await page.setExtraHTTPHeaders({
    //   'Accept-Language': 'en-US,en;q=0.9,it-IT;q=0.8,it;q=0.7'
    // });

    await page.goto(startingPage, { waitUntil: 'domcontentloaded' });
    await page.type('#gw_username', email);
    await page.type('#gw_password', password);
    const [response] = await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }), // The promise resolves after navigation has finished
      page.$eval('#loginForm', form => form.submit())
    ]);
    // await page.$eval('#loginForm', form => form.submit());
    // await navigationPromise;
    this.Log(`${email} signed in`);

    try {
      await page.waitForSelector('li[aria-labelledby="deliveryTabPanelLabel"]', {
        timeout: 15000
      });
    } catch (err) {
      this.Log(`${email} cannot find delivery tab after 15s: ${err}`);
      await page.screenshot({
        fullPage: true,
        path: screenshotPath
      });
      this.emit('failure', user, screenshotPath);
      return;
    }

    try {
      this.Log(`${email} evaluating bad stuff`);
      await page.evaluate(() => {

        let scrollTop = document.querySelector('#scroll-top');
        scrollTop.parentNode.removeChild(scrollTop);

        let chatBot = document.getElementsByTagName('esselunga-chatbot'),
          chatBotIndex;
        for (chatBotIndex = chatBot.length - 1; chatBotIndex >= 0; chatBotIndex--) {
          chatBot[chatBotIndex].parentNode.removeChild(chatBot[chatBotIndex]);
        }

        let cookiePolicy = document.getElementsByTagName('cookie-policy'),
          cookiePolicyIndex;
        for (cookiePolicyIndex = cookiePolicy.length - 1; cookiePolicyIndex >= 0; cookiePolicyIndex--) {
          cookiePolicy[cookiePolicyIndex].parentNode.removeChild(cookiePolicy[cookiePolicyIndex]);
        }
      });
    } catch (err) {
      this.Log(`${email} cannot remove bad stuff from page: ${err}`);
    }


    try {
      await page.waitFor(6000);
      this.Log(`${email} clicking delivery tab panel`);
      await page.click('li[aria-labelledby="deliveryTabPanelLabel"]');
      await page.waitForSelector('div[aria-labelledby=slotPanelTitle]', { timeout: 15000 });
    } catch (err) {
      this.Log(`${email} there was an error clicking the delivery tab panel ${err}`);
      await page.screenshot({
        fullPage: true,
        path: screenshotPath
      });
      this.emit('failure', user, screenshotPath);
      return;
    }

    // console.log(`${email} delivery tab panel clicked, waiting for slotPanelTitle`);
    // await page.waitFor(3000);

    await page.waitFor(6000);
    // this.Log(`${email} screenshotting delivery tab panel`);
    const el = await page.$('div[aria-labelledby=slotPanelTitle]');
    // await el.screenshot({ path: 'screenshots/capture.png'});
    // await page.screenshot({
    //   fullPage: true,
    //   path: `screenshots/${Date.now()}_deliveryTabPanelLabel.png`
    // });

    this.Log(`${email} clicking delivery slots...`);
    const deliverySlots = await page.$$('div[aria-labelledby=slotPanelTitle] form table tbody tr td label');

    for (let i = 0; i < deliverySlots.length; i++) {
      try {
        await (await deliverySlots[i].click());
      } catch (err) {
        this.Log(`${email} there was an error clicking a slot ${err}`);
        await page.screenshot({
          fullPage: true,
          path: screenshotPath
        });
        this.emit('failure', user, screenshotPath);
        return;
      }

      try {
        await page.waitForSelector('html.remodal-is-locked', {
          timeout: 10
        });

        // await page.waitForSelector('a[data-remodal-action=close]', {
        //   timeout: 100
        // });
        this.Log(`${email} found confirmation`);
        // await page.screenshot({
        //   fullPage: true,
        //   path: `screenshots/${Date.now()}_remodal_open.png`
        // });
        // console.log(`${email} confirming`);
        // await page.click('a[data-remodal-action=close]');

        await page.waitFor(6000);
        await page.screenshot({
          fullPage: true,
          path: screenshotPath
        });
        this.Log(`${email} signaling success`);

        this.emit('success', user, screenshotPath);
        return;
      } catch (err) {
        this.Log(`${email} no delivery slot for index ${i} ${err}`);
      }
    }
    await el.screenshot({ path: screenshotPath });
    // await page.screenshot({
    //   fullPage: true,
    //   path: screenshotPath
    // });
    this.emit('no_slots', user, screenshotPath);
  }

}


module.exports = Esselunga;
