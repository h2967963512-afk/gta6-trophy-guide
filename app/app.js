// Leonida Trophy Guide: boot, state and routing. Loads the trophy data once,
// keeps the reader's ticks and settings, and re-renders on every change.
// Routing is by hash: #/ for the checklist, #/roadmap, #/missables, #/about,
// and #/trophy/<id> to open one trophy's guide beside the list.
// ?demo=1 loads thirteen sample ticks so a new reader can see the guide
// with progress in it; ?spoilers=on turns the spoiler setting on.
import {
  DEMO_EARNED,
  clearProgress,
  exportProgress,
  importProgressFile,
  loadProgress,
  loadSettings,
  saveProgress,
  saveSettings,
} from './store.js';
import {
  renderAbout,
  renderDetail,
  renderList,
  renderMissables,
  renderProgress,
  renderRoadmap,
} from './ui.js';

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = loadProgress();
let settings = loadSettings();
let selectedId = null;

const params = new URLSearchParams(location.search);
if (params.get('demo') === '1') {
  earned = new Set(DEMO_EARNED);
  saveProgress(earned);
}
if (params.get('spoilers') === 'on') settings.spoilers = true;

function currentView() {
  const hash = location.hash || '#/';
  if (hash.startsWith('#/trophy/')) return { view: 'trophy', id: Number(hash.slice(9)) };
  if (hash === '#/roadmap') return { view: 'roadmap' };
  if (hash === '#/missables') return { view: 'missables' };
  if (hash === '#/about') return { view: 'about' };
  return { view: 'checklist' };
}

function render() {
  const { view, id } = currentView();
  renderProgress(trophies, earned);
  document.querySelectorAll('.tabs a').forEach((a) => {
    a.classList.toggle('active', a.dataset.view === view || (view === 'trophy' && a.dataset.view === 'checklist'));
  });
  const toolbar = document.getElementById('toolbar');
  const layout = document.querySelector('.layout');
  const page = document.getElementById('pageCol');
  const isPage = view === 'roadmap' || view === 'missables' || view === 'about';
  toolbar.hidden = isPage;
  layout.hidden = isPage;
  page.hidden = !isPage;
  if (view === 'roadmap') renderRoadmap(data, earned, settings);
  if (view === 'missables') renderMissables(data, earned, settings);
  if (view === 'about') renderAbout(data);
  if (!isPage) {
    if (view === 'trophy' && byId.has(id)) selectedId = id;
    renderList(trophies, earned, settings, toggleEarned, selectTrophyAndShow, selectedId);
    renderDetail(selectedId ? byId.get(selectedId) : null, data, earned, settings, selectTrophy);
  }
  saveSettings(settings);
}

function toggleEarned(id, checked) {
  if (checked) earned.add(id);
  else earned.delete(id);
  saveProgress(earned);
  render();
}

function selectTrophy(id) {
  selectedId = id;
  if (location.hash !== `#/trophy/${id}`) {
    history.replaceState(null, '', `#/trophy/${id}`);
  }
  render();
}

// Keep the detail pane in view on small screens: when a trophy is picked
// from the list, scroll the guide into sight.
function selectTrophyAndShow(id) {
  selectTrophy(id);
  if (window.innerWidth <= 900) {
    document.getElementById('detailCol').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function bindControls() {
  const search = document.getElementById('search');
  search.value = settings.query;
  search.addEventListener('input', () => {
    settings.query = search.value;
    render();
  });
  document.querySelectorAll('#kindFilter button').forEach((button) => {
    button.classList.toggle('active', button.dataset.kind === settings.kind);
    button.addEventListener('click', () => {
      settings.kind = button.dataset.kind;
      document.querySelectorAll('#kindFilter button').forEach((b) => b.classList.toggle('active', b === button));
      render();
    });
  });
  const grade = document.getElementById('grade');
  grade.value = settings.grade;
  grade.addEventListener('change', () => {
    settings.grade = grade.value;
    render();
  });
  const spoilers = document.getElementById('spoilers');
  spoilers.checked = settings.spoilers;
  spoilers.addEventListener('change', () => {
    settings.spoilers = spoilers.checked;
    render();
  });
  const earnedOnly = document.getElementById('earnedOnly');
  earnedOnly.checked = settings.earnedOnly;
  earnedOnly.addEventListener('change', () => {
    settings.earnedOnly = earnedOnly.checked;
    render();
  });
  document.getElementById('exportBtn').addEventListener('click', () => exportProgress(earned));
  document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      earned = await importProgressFile(file);
      saveProgress(earned);
      render();
    } catch (error) {
      alert(`Could not read that file: ${error.message}`);
    }
    event.target.value = '';
  });
  document.getElementById('demoBtn').addEventListener('click', () => {
    earned = new Set(DEMO_EARNED);
    saveProgress(earned);
    render();
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all your earned ticks?')) {
      earned = new Set();
      clearProgress();
      render();
    }
  });
}

bindControls();
window.addEventListener('hashchange', render);
render();
