import { App } from './app/app.js';

// FUNCTIONS
function showError(error) {
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;top:0;right:0;bottom:0;left:0;background:#1a1424;color:#fff3e3;padding:24px;font:14px monospace;white-space:pre-wrap;z-index:999;overflow:auto';
  box.textContent = 'Purrvivors error:\n' + ((error && (error.stack || error.message)) || error);
  document.body.appendChild(box);
}

// INITIALIZATION
window.addEventListener('error', (event) => console.error(event.error || event.message));
try {
  const app = new App();
  window.purr = app;
  app.boot().catch(showError);
} catch (error) {
  showError(error);
}
