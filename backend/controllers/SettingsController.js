const Settings = require('../models/Settings');

class SettingsController {
  async show(args) {
    const setting = Settings.getSetting(args.key);
    return { status: 'OK', body: setting };
  }

  async index() {
    Settings.getSetting('interceptEnabled'); // Create a default if necessary
    const result = await global.dbStore.connection('settings');

    return { status: 'OK', body: result };
  }

  async update(args) {
    const result = await global.dbStore
      .connection('settings')
      .where({ key: args.key });

    if (result.length === 0) {
      await global.dbStore
        .connection('settings')
        .insert({ key: 'interceptEnabled', value: args.value });
    } else {
      await global.dbStore
        .connection('settings')
        .where({ key: args.key })
        .update({ value: args.value });
    }

    return { status: 'OK', body: {} };
  }
}

module.exports = SettingsController;
