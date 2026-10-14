// FUNCTIONS
export async function run(page, shot) {
  await page.mouse.click(200, 500);
  await page.waitForTimeout(300);
  const ids = ['claw', 'yarn', 'laser', 'fish', 'catnip', 'orbs', 'bell', 'milk', 'cranes', 'shuriken', 'drone', 'fireworks', 'frost', 'ghosts'];
  for (const evolved of [false, true]) {
    for (const id of ids) {
      await page.evaluate(([weaponId, evo]) => {
        const app = window.purr;
        app.autoplay = true;
        app.startRun('bigode', 0);
        const w = app.world;
        w.options.godMode = true;
        w.startZone(1);
        w.zoneTime = 120;
        w.weapons.length = 0;
        const weapon = w.addWeapon(weaponId);
        weapon.level = 5;
        if (evo) w.evolveWeapon(weapon);
        w.pendingLevelUps = 0;
        w.player.xpNext = 1e9;
      }, [id, evolved]);
      await page.waitForTimeout(3500);
      await page.evaluate(() => { window.purr.world.pendingLevelUps = 0; });
      await shot('60-' + (evolved ? 'evo-' : 'lv5-') + id);
    }
  }
}
