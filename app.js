/* MyTV: static, remote-first prototype. It stores only the selected mode locally. */
const VIDEO_SOURCES = {
  bunny: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
  sintel: 'https://archive.org/download/Sintel/sintel-2048-surround.mp4',
  dream: 'https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4',
};

const channels = [
  { id: 'cartoons', number: 1, name: 'Cartoons', accent: '#f8c34e', kids: true, programs: [
    { title: 'Big Buck Bunny', source: 'bunny', duration: 596 }, { title: 'Sintel', source: 'sintel', duration: 888 }
  ]},
  { id: 'cinema', number: 2, name: 'Movie Night', accent: '#e46b8d', kids: false, programs: [
    { title: 'Sintel', source: 'sintel', duration: 888 }, { title: 'Elephants Dream', source: 'dream', duration: 653 }
  ]},
  { id: 'documentary', number: 3, name: 'Open Cinema', accent: '#70b9ff', kids: false, programs: [
    { title: 'Elephants Dream', source: 'dream', duration: 653 }, { title: 'Big Buck Bunny', source: 'bunny', duration: 596 }
  ]},
];
const modes = {
  normal: { label: 'Normal', description: 'All configured channels, guide and settings.' },
  kids: { label: 'Kids', description: 'Only channels approved for children.' },
  simple: { label: 'Simple', description: 'Large text and only selected channels.' },
};

// Do not use Object.fromEntries here: some TV browser builds lag desktop browsers.
const el = {};
['player','startup','hud','channel-number','channel-name','programme-title','programme-time','programme-progress','mode-label','channel-dial','guide','guide-list','settings','mode-list','toast','screen-play'].forEach(id => {
  el[id] = document.getElementById(id);
});
let mode = localStorage.getItem('mytv-mode') || 'normal';
let channelIndex = 0;
let selectedGuide = 0;
let selectedMode = Object.keys(modes).indexOf(mode);
let hudTimer;

function secondsSinceMidnight() { const now = new Date(); return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds(); }
function scheduleFor(channel, at = secondsSinceMidnight()) {
  const total = channel.programs.reduce((sum, p) => sum + p.duration, 0);
  let cursor = at % total;
  for (const program of channel.programs) { if (cursor < program.duration) return { ...program, offset: cursor }; cursor -= program.duration; }
  return { ...channel.programs[0], offset: 0 };
}
function visibleChannels() { return mode === 'kids' ? channels.filter(c => c.kids) : mode === 'simple' ? channels.slice(0, 2) : channels; }
function currentChannel() { const list = visibleChannels(); channelIndex = ((channelIndex % list.length) + list.length) % list.length; return list[channelIndex]; }
function formatClock(seconds) { return new Date(seconds * 1000).toISOString().slice(14,19); }
function showToast(text) { el.toast.textContent = text; el.toast.classList.add('show'); clearTimeout(el.toast.timer); el.toast.timer = setTimeout(() => el.toast.classList.remove('show'), 2600); }
function showHud() { el.hud.classList.add('is-visible'); clearTimeout(hudTimer); hudTimer = setTimeout(() => el.hud.classList.remove('is-visible'), 5200); }
function renderDial() { el.channelDial.innerHTML = visibleChannels().map((channel, index) => `<button class="channel-dot ${index === channelIndex ? 'active' : ''}" data-index="${index}" aria-label="Channel ${channel.number}, ${channel.name}">${channel.number}</button>`).join(''); el.channelDial.querySelectorAll('button').forEach(button => button.addEventListener('click', () => tune(Number(button.dataset.index)))); }
function updateNow() { const channel = currentChannel(), program = scheduleFor(channel); el['channel-number'].textContent = String(channel.number).padStart(2,'0'); el['channel-name'].textContent = channel.name; el['programme-title'].textContent = program.title; el['programme-time'].textContent = `${formatClock(program.offset)} into this programme`; el['programme-progress'].style.width = `${Math.round(program.offset / program.duration * 100)}%`; }
function tune(index) {
  channelIndex = index; const channel = currentChannel(), program = scheduleFor(channel); updateNow(); renderDial();
  el.player.src = VIDEO_SOURCES[program.source]; el.player.load();
  el.player.onloadedmetadata = () => { const safeOffset = Math.min(program.offset, Math.max(0, el.player.duration - 2)); if (Number.isFinite(safeOffset)) el.player.currentTime = safeOffset; el.player.play().then(() => el['screen-play'].classList.add('hidden')).catch(() => el['screen-play'].classList.remove('hidden')); };
  showToast(`${channel.number}. ${channel.name} — ${program.title}`); showHud();
}
function renderGuide() { const list = visibleChannels(); selectedGuide = Math.min(selectedGuide, list.length - 1); el['guide-list'].innerHTML = list.map((channel, index) => { const program = scheduleFor(channel); return `<button class="guide-row ${index === selectedGuide ? 'selected' : ''}" data-index="${index}"><span class="number">${String(channel.number).padStart(2,'0')}</span><span><strong>${channel.name}</strong><small>Now: ${program.title} · ${formatClock(program.offset)} in</small></span><time>${Math.round((program.duration-program.offset)/60)} min left</time></button>`; }).join(''); el['guide-list'].querySelectorAll('button').forEach(button => button.addEventListener('click', () => { tune(Number(button.dataset.index)); closePanels(); })); }
function renderModes() { const entries = Object.entries(modes); el['mode-list'].innerHTML = entries.map(([key, info], index) => `<button class="mode-row ${index === selectedMode ? 'selected' : ''}" data-mode="${key}"><span>${index + 1}</span><span><strong>${info.label}</strong><small>${info.description}</small></span></button>`).join(''); el['mode-list'].querySelectorAll('button').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode))); }
function setMode(next) { mode = next; localStorage.setItem('mytv-mode', mode); document.body.classList.toggle('simple', mode === 'simple'); el['mode-label'].textContent = mode.toUpperCase(); channelIndex = 0; selectedMode = Object.keys(modes).indexOf(mode); closePanels(); tune(0); showToast(`${modes[mode].label} mode enabled`); }
function openPanel(name) { closePanels(); el[name].classList.remove('hidden'); if (name === 'guide') renderGuide(); else renderModes(); }
function closePanels() { el.guide.classList.add('hidden'); el.settings.classList.add('hidden'); showHud(); }
function panelOpen() { return !el.guide.classList.contains('hidden') ? 'guide' : !el.settings.classList.contains('hidden') ? 'settings' : null; }
function handleKey(event) { const key = event.keyCode || event.which; const panel = panelOpen(); if ([37,38,39,40,13,461,27].includes(key)) event.preventDefault(); if (panel === 'guide') { if (key === 38) { selectedGuide = Math.max(0, selectedGuide-1); renderGuide(); } else if (key === 40) { selectedGuide = Math.min(visibleChannels().length-1, selectedGuide+1); renderGuide(); } else if (key === 13) { tune(selectedGuide); closePanels(); } else if (key === 461 || key === 27) closePanels(); return; } if (panel === 'settings') { if (key === 38) { selectedMode = Math.max(0, selectedMode-1); renderModes(); } else if (key === 40) { selectedMode = Math.min(Object.keys(modes).length-1, selectedMode+1); renderModes(); } else if (key === 13) setMode(Object.keys(modes)[selectedMode]); else if (key === 461 || key === 27) closePanels(); return; } if (key === 37) tune(channelIndex - 1); else if (key === 39) tune(channelIndex + 1); else if (key === 38) openPanel('guide'); else if (key === 40) openPanel('settings'); else if (key === 13 || key === 415) { if (el.player.paused) el.player.play().catch(() => el['screen-play'].classList.remove('hidden')); else el.player.pause(); showHud(); } else if (key === 461 || key === 27) showHud(); }
el['screen-play'].addEventListener('click', () => el.player.play().then(() => el['screen-play'].classList.add('hidden')));
el.player.addEventListener('ended', () => tune(channelIndex));
document.addEventListener('keydown', handleKey);
document.body.classList.toggle('simple', mode === 'simple'); el['mode-label'].textContent = mode.toUpperCase();
// Remove the opening screen before requesting remote media. A slow/unavailable
// video must never make the TV look as though MyTV itself is still loading.
el.startup.classList.add('gone');
tune(0); setInterval(updateNow, 1000);
