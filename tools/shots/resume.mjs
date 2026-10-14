// FUNCTIONS
export async function run(page, shot) {
  await page.mouse.click(200, 500);
  await page.waitForTimeout(300);
  await page.evaluate(() => { window.purr.autoplay = true; window.purr.startRun('bigode', 0); window.purr.world.options.godMode = true; window.purr.debugJump(0, 8, true); });
  await page.waitForTimeout(3000);
  await page.evaluate(() => { const b = window.purr.world.boss; if (b) b.hp = 1; });
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);
    const z = await page.evaluate(() => window.purr.world.zoneIndex);
    if (z === 1) break;
  }
  const before = await page.evaluate(() => ({ zone: window.purr.world.zoneIndex, weapons: window.purr.world.weapons.map((w) => w.id + w.level).join(','), level: window.purr.world.player.level, saved: !!window.purr.savedRun }));
  console.log('before reload', JSON.stringify(before));
  await page.reload();
  await page.waitForTimeout(2500);
  await page.mouse.click(200, 500);
  await page.waitForTimeout(500);
  await shot('50-menu-continue');
  await page.evaluate(() => window.purr.promptContinue());
  await page.waitForTimeout(400);
  await shot('51-continue-modal');
  await page.evaluate(() => { window.purr.closeAllModals(); window.purr.continueRun(); });
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => ({ zone: window.purr.world.zoneIndex, weapons: window.purr.world.weapons.map((w) => w.id + w.level).join(','), level: window.purr.world.player.level, mode: window.purr.mode }));
  console.log('after resume', JSON.stringify(after));
  await shot('52-resumed');
}
