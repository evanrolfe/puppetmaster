import CaptureFilters from '../../shared/models/CaptureFilters';

export default class CaptureFiltersController {
  async show() {
    const filters = await CaptureFilters.getFilters();

    return { status: 'OK', body: filters };
  }

  async update(args) {
    await CaptureFilters.setFilters(args);

    return { status: 'OK', body: {} };
  }
}
