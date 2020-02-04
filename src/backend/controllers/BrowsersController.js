import BrowserUtils from '../lib/BrowserUtils';

export default class BrowsersController {
  // POST /browsers
  async create() {
    await BrowserUtils.createBrowser();

    return { status: 'OK' };
  }

  async index() {
    const browsers = await global.knex('browsers');

    return { status: 'OK', body: browsers };
  }

  async update(args) {
    await BrowserUtils.updateBrowser(args.browserId, args.title);

    return { status: 'OK', body: {} };
  }

  async open(args) {
    const browser = global.puppeteer_browsers.find(
      b => b.id === args.browserId
    );

    if (browser === undefined) {
      await BrowserUtils.openBrowser(args.browserId);
    } else {
      await this.bringToForeground(browser);
    }

    return { status: 'OK', body: {} };
  }

  async bringToForeground(browser) {
    const target = browser
      .targets()
      .find(targetEnum => targetEnum._targetInfo.type === 'page');
    console.log(`[Backend] opening the browser target ${target._targetId}`);
    console.log(target);

    const cdpSession = await target.createCDPSession();
    await cdpSession.send('Target.activateTarget', {
      targetId: target._targetId
    });
    console.log(`[Backend] opened!`);
  }
}
