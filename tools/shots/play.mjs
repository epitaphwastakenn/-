// FUNCTIONS
export async function run(page, shot) {
  await page.mouse.click(200, 500);
  await page.waitForTimeout(400);
  await page.evaluate(() => { window.purr.autoplay = true; window.purr.startRun('bigode', 0); });
  await page.waitForTimeout(12000);
  await shot('10-autoplay-zone1');
  await page.evaluate(() => window.purr.debugJump(0, 10, true));
  await page.waitForTimeout(6000);
  await shot('11-boss1');
  await page.evaluate(() => { window.purr.autoplay = false; window.purr.world.pendingLevelUps++; });
  await page.waitForTimeout(500);
  await shot('12-levelup');
  const info = await page.evaluate(() => {
    const w = window.purr.world;
    return { zone: w.zoneIndex, phase: w.phase, boss: w.boss ? Math.round(w.boss.hp) : null, enemies: w.enemies.length, level: w.player.level, hp: w.player.hp, weapons: w.weapons.map((x) => x.id + x.level).join(','), fps: 0 };
  });
  console.log(JSON.stringify(info));
}
