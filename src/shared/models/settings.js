const DEFAULT_SETTINGS = {
  interceptEnabled: false
};

export default class Settings {
  static async getSetting(key) {
    let result = await global.knex('settings').where({ key: key });

    if (result.length === 0) {
      console.log(`No settings found, so creating default..`);
      await this.createDefault(key);

      result = await global
        .knex('settings')
        .where({ key: key })
        .select();
    }

    return result[0];
  }

  static async createDefault(key) {
    console.log(`Creating default setting for ${key}...`);
    return global
      .knex('settings')
      .insert({ key: key, value: DEFAULT_SETTINGS[key] });
  }
}
