// VARIABLES
const bridge = typeof window !== 'undefined' ? window.AndroidBridge : null;

// FUNCTIONS
export const isAndroid = !!bridge;

export function vibrate(ms) {
  try {
    if (bridge) bridge.vibrate(ms);
    else if (navigator.vibrate) navigator.vibrate(ms);
  } catch (error) {
    return;
  }
}

export function storageLoad(key) {
  let value = null;
  try {
    if (bridge) value = bridge.load(key);
  } catch (error) {
    value = null;
  }
  if (value === null || value === undefined) {
    try {
      value = window.localStorage.getItem(key);
    } catch (error) {
      value = null;
    }
  }
  return value;
}

export function storageSave(key, value) {
  try {
    if (bridge) bridge.save(key, value);
  } catch (error) {
    console.warn('bridge save failed', error);
  }
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn('local save failed', error);
  }
}

export function storageRemove(key) {
  try {
    if (bridge) bridge.remove(key);
  } catch (error) {
    console.warn('bridge remove failed', error);
  }
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn('local remove failed', error);
  }
}

export function safeInsets() {
  try {
    if (bridge) return JSON.parse(bridge.insets());
  } catch (error) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
  return { top: 0, bottom: 0, left: 0, right: 0 };
}

export function exitApp() {
  try {
    if (bridge) bridge.exitApp();
  } catch (error) {
    return;
  }
}
