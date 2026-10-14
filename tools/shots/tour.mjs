// FUNCTIONS
export async function run(page, shot) {
  await shot('01-title');
  await page.mouse.click(200, 500);
  await page.waitForTimeout(600);
  await shot('02-menu');
  await page.evaluate(() => window.purr.startRun('bigode', 0));
  await page.waitForTimeout(1500);
  await page.keyboard.down('d');
  await page.waitForTimeout(2500);
  await page.keyboard.up('d');
  await page.keyboard.down('s');
  await page.waitForTimeout(2000);
  await page.keyboard.up('s');
  await shot('03-run');
  const info = await page.evaluate(() => {
    const w = window.purr.world;
    return { enemies: w.enemies.length, level: w.player.level, hp: w.player.hp, modals: window.purr.modals.length, drawCalls: window.purr.renderer.drawCalls };
  });
  console.log(JSON.stringify(info));
}
