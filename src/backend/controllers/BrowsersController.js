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
    // args.browserId
    const result = await global.knex('browsers').where({ id: args.browserId });
    const browser = result[0];

    if (browser.open === 1) {
      await this.bringToForeground(args);
    } else {
      await BrowserUtils.openBrowser(args.browserId);
    }

    return { status: 'OK', body: {} };
  }

  async bringToForeground(args) {
    const browser = global.puppeteer_browsers.find(
      browserEnum => browserEnum.id === args.browserId
    );
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
