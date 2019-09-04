const modals = {};

export function registerModal(instance) {
  if (instance === null) {
    // Modal was unmounted
    return;
  }
  modals[instance.constructor.name] = instance;
}

export function showModal(modalCls, ...args) {
  return _getModal(modalCls).show(...args);
}

export function hideAllModals() {
  for (const key of Object.keys(modals)) {
    const modal = modals[key];
    if (modal.hide) {
      modal.hide();
    }
  }
}

function _getModal(modalCls) {
  const m = modals[modalCls.name];
  if (!m) {
    throw new Error('Modal was not registered with the app');
  }

  return m;
}
