const CaptureFilters = require('../models/CaptureFilters');

class CaptureFiltersController {
  async update(args) {
    await CaptureFilters.setFilters(args);

    return { status: 'OK', body: {} };
  }
}

module.exports = CaptureFiltersController;
