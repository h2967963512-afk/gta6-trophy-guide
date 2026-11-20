# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/h2967963512-afk/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/h2967963512-afk/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — an offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI. Static files, no build step, no network at run time.

- **Checklist** — every trophy with its official name, description and grade; tick it off and the tick is saved in your browser (localStorage), with export to a JSON file and import back.
- **Filters** — by kind (story, missable, collectibles, activities, online — the official list has no online trophies, so that filter is empty on purpose), by grade, by earned, plus search.
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Platinum roadmap** — six stages in the order to play them, built from the official descriptions.
- **Missable trophies** — the 11 tied to a single story moment or a strand that may stop being offered, with the honest caveat that none is confirmed permanently missable.
- **A cited guide for every trophy**, in our own words. Sources are named beside each guide: the official list as Exophase and PSNProfiles publish it. The game released 2026-11-19, so where a method is not yet confirmed in play, the guide says so instead of inventing a location or a step.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored `buildDossier`.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

`?demo=1` loads thirteen sample ticks so you can see the guide with progress in it. `?spoilers=on` turns the spoiler setting on as well.

## Files

- `app/index.html`, `app/app.js`, `app/ui.js`, `app/store.js`, `app/style.css` — the guide
- `app/data/trophies.json` — the 55 trophies, their official details, the roadmap and the guides
- `main.ts` — the entry program; `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged
- `screenshots/` — renders of the guide in a browser (see `shots.json`)
- `shots.json` — the screenshot list: file order and captions used by the build

Unofficial fan guide, not affiliated with Rockstar Games. No Rockstar logo, artwork or game screenshots are used. MIT licensed.

---

<sub>Entered on [make.fun](https://make.fun/?ref=cj11yvbn&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
