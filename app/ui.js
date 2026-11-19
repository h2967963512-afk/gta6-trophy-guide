// Rendering for the Leonida Trophy Guide: the checklist rows, the guide pane,
// the roadmap page, the missables page and the sources page. All text comes
// from the trophy data file; nothing here is fetched from the network.
const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', other: 'Other' };
const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeDot(grade) {
  const dot = el('span', `grade-dot ${grade}`);
  dot.title = GRADE_LABELS[grade];
  return dot;
}

// Spoiler rule: with spoilers hidden, a story trophy the reader has not earned
// yet shows a placeholder name and description instead of the real ones.
export function displayName(trophy, earned, spoilers) {
  if (spoilers && trophy.kind === 'story' && !earned.has(trophy.id)) return 'Hidden story trophy';
  return trophy.name;
}

export function displayDescription(trophy, earned, spoilers) {
  if (spoilers && trophy.kind === 'story' && !earned.has(trophy.id)) return 'Hidden until earned — turn spoilers off to see it.';
  return trophy.description;
}

export function filterTrophies(trophies, earned, settings) {
  const query = settings.query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (settings.kind === 'missable' && !t.missable) return false;
    if (settings.kind === 'online') return false; // The official list has no online trophies.
    if (settings.kind !== 'all' && settings.kind !== 'missable' && t.kind !== settings.kind) return false;
    if (settings.grade !== 'all' && t.grade !== settings.grade) return false;
    if (settings.earnedOnly && !earned.has(t.id)) return false;
    if (query) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

export function renderProgress(trophies, earned) {
  document.getElementById('earnedCount').textContent = String(earned.size);
  document.getElementById('meterFill').style.width = `${(earned.size / trophies.length) * 100}%`;
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const total = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    return `${got}/${total} ${GRADE_LABELS[g].toLowerCase()}`;
  });
  document.getElementById('gradeCounts').textContent = parts.join(' · ');
}

export function renderList(trophies, earned, settings, onToggle, onSelect, selectedId) {
  const list = document.getElementById('trophyList');
  list.replaceChildren();
  const shown = filterTrophies(trophies, earned, settings);
  const meta = document.getElementById('listMeta');
  if (settings.kind === 'online') {
    meta.textContent = 'No online trophies: the official 55-trophy list has none, so this filter is empty on purpose.';
  } else {
    meta.textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${earned.size} earned`;
  }
  for (const t of shown) {
    const li = el('li', 'trophy-row' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : ''));
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('change', (event) => {
      event.stopPropagation();
      onToggle(t.id, box.checked);
    });
    const middle = el('div');
    const name = el('div', 'trophy-name', displayName(t, earned, settings.spoilers));
    middle.append(name);
    middle.append(el('div', 'trophy-desc', displayDescription(t, earned, settings.spoilers)));
    const tags = el('div', 'trophy-tags');
    tags.append(el('span', 'tag', KIND_LABELS[t.kind]));
    if (t.missable) tags.append(el('span', 'tag missable', 'Missable'));
    if (settings.spoilers && t.kind === 'story' && !earned.has(t.id)) tags.append(el('span', 'tag spoiler-hidden', 'Spoiler hidden'));
    middle.append(tags);
    const right = el('div');
    const gradeLine = el('div', 'grade-label');
    gradeLine.append(gradeDot(t.grade), document.createTextNode(GRADE_LABELS[t.grade]));
    right.append(gradeLine);
    if (t.target) right.append(el('div', 'target-count', `PSN counts to ${t.target.toLocaleString('en-US')}`));
    li.append(box, middle, right);
    li.addEventListener('click', () => onSelect(t.id));
    list.append(li);
  }
}

export function renderRoadmap(data, earned, settings) {
  const page = document.getElementById('pageCol');
  page.replaceChildren();
  page.append(el('h2', '', 'Road to the platinum'));
  const lede = el('p', 'lede');
  lede.textContent = 'Six stages, in the order to play them. Stage 1 first: the one-off story moments happen while the story runs, and the finale may close them off.';
  page.append(lede);
  for (const stage of data.roadmap) {
    const card = el('div', 'stage-card');
    const heading = el('h3', '');
    heading.append(el('span', 'stage-num', String(stage.stage)), document.createTextNode(stage.title));
    card.append(heading);
    card.append(el('p', '', stage.text));
    const members = data.trophies.filter((t) => t.stage === stage.stage);
    const got = members.filter((t) => earned.has(t.id)).length;
    const names = members.map((t) => displayName(t, earned, settings.spoilers)).join(', ');
    card.append(el('p', 'stage-trophies', `Stage ${stage.stage}: ${got} of ${members.length} earned — ${names}`));
    page.append(card);
  }
  const note = el('p', 'warn');
  note.textContent = 'Built from the official descriptions alone: which story chapters and missions, which collectibles and counts, in what order. No step here claims a location the sources do not name.';
  page.append(note);
}

export function renderMissables(data, earned, settings) {
  const page = document.getElementById('pageCol');
  page.replaceChildren();
  page.append(el('h2', '', 'Missable trophies'));
  const lede = el('p', 'lede');
  lede.textContent = 'Eleven trophies are tied to a single story moment or a strand that may stop being offered. Nothing in the official list is confirmed permanently missable — mission replay exists in GTA games — but these are the ones to do when the moment comes, not later.';
  page.append(lede);
  for (const t of data.trophies.filter((t) => t.missable)) {
    const card = el('div', 'miss-card');
    const hidden = settings.spoilers && t.kind === 'story' && !earned.has(t.id);
    const heading = el('h3', '');
    heading.append(gradeDot(t.grade), document.createTextNode(hidden ? 'Hidden story trophy' : `${t.name} — ${GRADE_LABELS[t.grade]}`));
    card.append(heading);
    card.append(el('p', '', hidden ? 'Hidden until earned — turn the spoiler setting off to see it.' : t.description));
    card.append(el('p', '', hidden ? 'This is a story trophy. Earn it in play to reveal its guide.' : t.guide));
    card.append(el('p', '', earned.has(t.id) ? '✓ Earned.' : 'Not earned yet.'));
    page.append(card);
  }
}

export function renderAbout(data) {
  const page = document.getElementById('pageCol');
  page.replaceChildren();
  page.append(el('h2', '', 'Sources & method'));
  page.append(el('p', 'lede', 'How this guide was put together, and what it does not claim.'));
  page.append(el('h3', '', 'The list'));
  page.append(el('p', '', data.list_note));
  page.append(el('h3', '', 'The guides'));
  page.append(el('p', '', data.guide_note));
  page.append(el('h3', '', 'Sources'));
  const list = el('ul', 'sources');
  for (const source of Object.values(data.sources)) {
    const item = el('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.name;
    link.target = '_blank';
    link.rel = 'noopener';
    item.append(link);
    list.append(item);
  }
  page.append(list);
  page.append(el('h3', '', 'Your progress'));
  page.append(el('p', '', 'Ticks are saved in this browser only (localStorage). Export writes a JSON file you can keep or move to another browser; import reads it back. Nothing leaves your machine, and the guide makes no network request at all.'));
  page.append(el('h3', '', 'What this is not'));
  page.append(el('p', '', 'An unofficial fan guide. Not affiliated with Rockstar Games. It shows no Rockstar logo, artwork or game screenshots — the look is its own.'));
}

export function renderDetail(trophy, data, earned, settings, onNext) {
  const col = document.getElementById('detailCol');
  col.replaceChildren();
  if (!trophy) {
    const empty = el('div', 'detail-card detail-empty');
    empty.append(el('h2', '', 'Pick a trophy'));
    empty.append(el('p', '', 'Select any trophy on the left to read its guide, its sources and when it can be missed. Tick the box when you have earned it — your progress is saved in this browser.'));
    col.append(empty);
    return;
  }
  const card = el('div', 'detail-card');
  const hidden = settings.spoilers && trophy.kind === 'story' && !earned.has(trophy.id);
  card.append(el('h2', '', hidden ? 'Hidden story trophy' : trophy.name));
  const official = el('p', 'official');
  official.append(gradeDot(trophy.grade), document.createTextNode(`${GRADE_LABELS[trophy.grade]} · ${hidden ? 'Hidden until earned' : trophy.description}`));
  card.append(official);
  card.append(el('h3', '', 'Guide'));
  card.append(el('p', 'guide-text', hidden ? 'This is a story trophy. Earn it in play to reveal its name and guide, or turn the spoiler setting off.' : trophy.guide));
  if (trophy.missable) {
    card.append(el('h3', '', 'When it can be missed'));
    card.append(el('p', '', 'Flagged missable: it is tied to a single story moment or a strand that may stop being offered. Do it when the moment comes rather than counting on a replay.'));
  }
  if (trophy.target) {
    card.append(el('h3', '', 'Progress target'));
    card.append(el('p', '', `PlayStation tracks this one to ${trophy.target.toLocaleString('en-US')}. The counter is the honest measure of how far along you are.`));
  }
  card.append(el('h3', '', 'Sources'));
  const sources = el('ul', 'sources');
  for (const key of trophy.sources) {
    const source = data.sources[key];
    const item = el('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.name;
    link.target = '_blank';
    link.rel = 'noopener';
    item.append(link);
    sources.append(item);
  }
  const method = el('li');
  method.textContent = 'Guide method: our own reading of the official description above. Where a step is not yet confirmed in play, the guide says so.';
  sources.append(method);
  card.append(sources);
  const earnedLine = el('p', '');
  earnedLine.textContent = earned.has(trophy.id) ? '✓ Earned — ticked off in your checklist.' : 'Not earned yet.';
  card.append(earnedLine);
  const next = data.trophies.find((t) => t.id > trophy.id && !earned.has(t.id));
  if (next) {
    const wrap = el('div', 'next-up');
    const button = el('button', '', `Next up: ${next.name}`);
    button.type = 'button';
    button.addEventListener('click', () => onNext(next.id));
    wrap.append(button);
    card.append(wrap);
  }
  col.append(card);
}
