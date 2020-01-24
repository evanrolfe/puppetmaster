import Settings from '../../shared/models/settings';

export default class SettingsController {
  async show(args) {
    const setting = Settings.getSetting(args.key);
    return { status: 'OK', body: setting };
  }

  async index() {
    Settings.getSetting('interceptEnabled'); // Create a default if necessary
    const result = await global.knex('settings');

    return { status: 'OK', body: result };
  }

  async update(args) {
    const result = await global.knex('settings').where({ key: args.key });

    if (result.length === 0) {
      await global
        .knex('settings')
        .insert({ key: 'interceptEnabled', value: args.value });
    } else {
      await global
        .knex('settings')
        .where({ key: args.key })
        .update({ value: args.value });
    }

    return { status: 'OK', body: {} };
  }
}
