// FUNCTIONS
export async function run(page, shot) {
  await page.mouse.click(200, 500);
  await page.waitForTimeout(300);
  await page.evaluate(() => { window.purr.autoplay = true; window.purr.startRun('bigode', 0); window.purr.world.options.godMode = true; });
  const levels = [10, 12, 10, 10, 10];
  for (let zone = 0; zone < 5; zone++) {
    await page.evaluate(([z, l]) => window.purr.debugJump(z, l, false), [zone, levels[zone]]);
    await page.evaluate(() => { window.purr.world.zoneTime = 150; });
    await page.waitForTimeout(5000);
    await shot('40-zone' + (zone + 1) + '-waves');
    await page.evaluate(() => { window.purr.world.zoneTime = window.purr.world.zone.duration - 0.2; });
    await page.waitForTimeout(7000);
    await shot('41-zone' + (zone + 1) + '-boss');
    const info = await page.evaluate(() => { const w = window.purr.world; return { zone: w.zoneIndex, phase: w.phase, boss: w.boss ? Math.round(w.boss.hp / w.boss.maxHp * 100) + '%' : null, enemies: w.enemies.length, bullets: w.bullets.length, hazards: w.hazards.length, level: w.player.level }; });
    console.log(JSON.stringify(info));
  }
}
