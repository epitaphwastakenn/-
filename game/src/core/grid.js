// FUNCTIONS
export class SpatialGrid {
  constructor(cellSize = 32, columns = 96, rows = 96) {
    this.cellSize = cellSize;
    this.columns = columns;
    this.rows = rows;
    this.originX = 0;
    this.originY = 0;
    this.cellStart = new Int32Array(columns * rows + 1);
    this.cellCount = new Int32Array(columns * rows);
    this.items = [];
    this.sorted = [];
    this.cellOf = new Int32Array(4096);
  }

  rebuild(items, count, centerX, centerY) {
    const size = this.cellSize;
    this.originX = Math.floor(centerX / size) - (this.columns >> 1);
    this.originY = Math.floor(centerY / size) - (this.rows >> 1);
    this.cellCount.fill(0);
    if (this.cellOf.length < count) this.cellOf = new Int32Array(count * 2);
    const columns = this.columns;
    const rows = this.rows;
    for (let i = 0; i < count; i++) {
      const item = items[i];
      let cx = Math.floor(item.x / size) - this.originX;
      let cy = Math.floor(item.y / size) - this.originY;
      cx = cx < 0 ? 0 : cx >= columns ? columns - 1 : cx;
      cy = cy < 0 ? 0 : cy >= rows ? rows - 1 : cy;
      const cell = cy * columns + cx;
      this.cellOf[i] = cell;
      this.cellCount[cell]++;
    }
    let running = 0;
    for (let c = 0; c < columns * rows; c++) {
      this.cellStart[c] = running;
      running += this.cellCount[c];
    }
    this.cellStart[columns * rows] = running;
    if (this.sorted.length < count) this.sorted.length = count;
    const fill = this.cellCount;
    fill.fill(0);
    for (let i = 0; i < count; i++) {
      const cell = this.cellOf[i];
      this.sorted[this.cellStart[cell] + fill[cell]] = items[i];
      fill[cell]++;
    }
    this.items = items;
  }

  gather(x, y, radius, out) {
    const size = this.cellSize;
    const columns = this.columns;
    const rows = this.rows;
    let x0 = Math.floor((x - radius) / size) - this.originX;
    let x1 = Math.floor((x + radius) / size) - this.originX;
    let y0 = Math.floor((y - radius) / size) - this.originY;
    let y1 = Math.floor((y + radius) / size) - this.originY;
    let count = 0;
    if (x1 < 0 || y1 < 0 || x0 >= columns || y0 >= rows) return 0;
    x0 = x0 < 0 ? 0 : x0;
    y0 = y0 < 0 ? 0 : y0;
    x1 = x1 >= columns ? columns - 1 : x1;
    y1 = y1 >= rows ? rows - 1 : y1;
    const sorted = this.sorted;
    for (let cy = y0; cy <= y1; cy++) {
      const rowBase = cy * columns;
      for (let cx = x0; cx <= x1; cx++) {
        const cell = rowBase + cx;
        const start = this.cellStart[cell];
        const end = start + this.cellCount[cell];
        for (let i = start; i < end; i++) out[count++] = sorted[i];
      }
    }
    return count;
  }

  query(x, y, radius, callback) {
    const size = this.cellSize;
    const columns = this.columns;
    const rows = this.rows;
    let x0 = Math.floor((x - radius) / size) - this.originX;
    let x1 = Math.floor((x + radius) / size) - this.originX;
    let y0 = Math.floor((y - radius) / size) - this.originY;
    let y1 = Math.floor((y + radius) / size) - this.originY;
    if (x1 < 0 || y1 < 0 || x0 >= columns || y0 >= rows) return;
    x0 = x0 < 0 ? 0 : x0;
    y0 = y0 < 0 ? 0 : y0;
    x1 = x1 >= columns ? columns - 1 : x1;
    y1 = y1 >= rows ? rows - 1 : y1;
    const sorted = this.sorted;
    for (let cy = y0; cy <= y1; cy++) {
      const rowBase = cy * columns;
      for (let cx = x0; cx <= x1; cx++) {
        const cell = rowBase + cx;
        const start = this.cellStart[cell];
        const end = start + this.cellCount[cell];
        for (let i = start; i < end; i++) {
          if (callback(sorted[i]) === true) return;
        }
      }
    }
  }
}
