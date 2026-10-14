#!/usr/bin/env bash
set -euo pipefail
# VARIABLES
root="$(cd "$(dirname "$0")/.." && pwd)"
workers="${WORKERS:-4}"
perWorker="${PER:-3}"
skill="${SKILL:-0.7}"
out="$root/build/campaigns"
# INITIALIZATION
mkdir -p "$out"
rm -f "$out"/*.txt
for i in $(seq 1 "$workers"); do
  node "$root/tools/campaign.mjs" --count="$perWorker" --seed=$((i * 100)) --skill="$skill" > "$out/w$i.txt" 2>&1 &
done
wait
cat "$out"/w*.txt | grep campaign
cat "$out"/w*.txt | grep campaign | python3 -c "
import sys,re
hours=[]; runs=[]
for line in sys.stdin:
    m=re.search(r'after (\d+) runs, (\d+) min', line)
    if 'WON' in line and m: runs.append(int(m.group(1))); hours.append(int(m.group(2))*1.2/60)
hours.sort()
if hours:
    print('won %d, median %.2f h, mean %.2f h, p25 %.2f, p75 %.2f, runs median %d' % (len(hours), hours[len(hours)//2], sum(hours)/len(hours), hours[len(hours)//4], hours[3*len(hours)//4], sorted(runs)[len(runs)//2]))
"
