// const ipc = require('../server-ipc');
// const { setupDatabaseStore } = require('../lib/database.js');

class ProjectsController {
  async open(args) {
    console.log(`[Backend] opening project: ${args.filePath}`);

    global.dbStore.close(() => {
      console.log('[Backend] connection closed');
      // global.dbStore = await setupDatabaseStore(args.filePath);
    });

    console.log(`[Backend] Done.`);
  }
}

module.exports = ProjectsController;
