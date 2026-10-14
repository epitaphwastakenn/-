// VARIABLES
let atlasMeta = null;

// FUNCTIONS
export function setAtlas(meta) {
  atlasMeta = meta;
}

export function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined && content !== null) {
    if (Array.isArray(content)) content.forEach((child) => child && node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child));
    else if (content instanceof Node) node.appendChild(content);
    else node.textContent = String(content);
  }
  return node;
}

export function frameInfo(name) {
  if (!atlasMeta) return null;
  return atlasMeta.frames[name] || atlasMeta.frames[name + '_0'] || null;
}

export function icon(name, scale = 3, className = '') {
  const node = el('div', 'sprite ' + className);
  const frame = frameInfo(name);
  if (!frame) {
    node.style.width = 16 * scale + 'px';
    node.style.height = 16 * scale + 'px';
    return node;
  }
  const [x, y, w, h] = frame;
  node.style.width = w * scale + 'px';
  node.style.height = h * scale + 'px';
  node.style.backgroundImage = 'url(atlas.png)';
  node.style.backgroundPosition = `-${x * scale}px -${y * scale}px`;
  node.style.backgroundSize = `${atlasMeta.w * scale}px ${atlasMeta.h * scale}px`;
  return node;
}

export function animatedIcon(name, scale = 3, fps = 4) {
  const first = frameInfo(name + '_0');
  if (!first) return icon(name, scale);
  const node = icon(name + '_0', scale);
  let frame = 0;
  const frames = [];
  while (frameInfo(name + '_' + frames.length) && atlasMeta.frames[name + '_' + frames.length]) frames.push(atlasMeta.frames[name + '_' + frames.length]);
  if (frames.length < 2) return node;
  const timer = setInterval(() => {
    if (!node.isConnected) {
      clearInterval(timer);
      return;
    }
    frame = (frame + 1) % frames.length;
    const [x, y] = frames[frame];
    node.style.backgroundPosition = `-${x * scale}px -${y * scale}px`;
  }, 1000 / fps);
  return node;
}

export function button(label, className, onClick) {
  const node = el('button', 'btn ' + (className || ''), label);
  node.addEventListener('click', (e) => {
    e.stopPropagation();
    if (node.disabled) return;
    onClick(e);
  });
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function coinLabel(amount, scale = 2) {
  const wrap = el('span', 'row');
  wrap.style.gap = '4px';
  wrap.style.display = 'inline-flex';
  wrap.appendChild(icon('ic_coin', scale, 'coinIcon'));
  wrap.appendChild(el('span', '', String(amount)));
  return wrap;
}
