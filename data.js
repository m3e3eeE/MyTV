/* Shared, versioned local data store for the TV and Channel Manager. */
(function () {
  const KEY = 'mytv-channels-v1';
  const DEFAULT_CHANNELS = [
    { id: 'cartoons', number: 1, name: 'Cartoons', color: '#f8c34e', icon: '🐰', kids: true, simple: true, programs: [{ title: 'Big Buck Bunny', source: 'bunny', duration: 596 }, { title: 'Open Movie Short', source: 'short', duration: 180 }] },
    { id: 'kids-club', number: 2, name: 'Kids Club', color: '#70b9ff', icon: '🎈', kids: true, simple: true, programs: [{ title: 'Open Movie Short', source: 'short', duration: 180 }, { title: 'Big Buck Bunny', source: 'bunny', duration: 596 }] },
    { id: 'family', number: 3, name: 'Family Cinema', color: '#b18cff', icon: '🍿', kids: true, simple: true, programs: [{ title: 'Big Buck Bunny', source: 'bunny', duration: 596 }, { title: 'Open Movie Short', source: 'short', duration: 180 }] },
    { id: 'cinema', number: 4, name: 'Movie Night', color: '#e46b8d', icon: '🎬', kids: false, simple: false, programs: [{ title: 'Open Movie Short', source: 'short', duration: 180 }, { title: 'Big Buck Bunny', source: 'bunny', duration: 596 }] },
    { id: 'open-cinema', number: 5, name: 'Open Cinema', color: '#70b9ff', icon: '📽️', kids: false, simple: false, programs: [{ title: 'Big Buck Bunny', source: 'bunny', duration: 596 }, { title: 'Open Movie Short', source: 'short', duration: 180 }] },
  ];
  const FALLBACK_SOURCES = { bunny: ['https://media.w3.org/2010/05/bunny/trailer.mp4', 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4'], short: ['https://media.w3.org/2010/05/video/movie_300.mp4', 'https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4'] };
  const clone = (value) => JSON.parse(JSON.stringify(value));
  function valid(channels) { return Array.isArray(channels) && channels.length && channels.every((channel) => channel && typeof channel.name === 'string' && Array.isArray(channel.programs)); }
  function loadChannels() { try { const channels = JSON.parse(localStorage.getItem(KEY)); return valid(channels) ? channels : clone(DEFAULT_CHANNELS); } catch (_) { return clone(DEFAULT_CHANNELS); } }
  function saveChannels(channels) { if (!valid(channels)) throw new Error('Invalid channel data'); localStorage.setItem(KEY, JSON.stringify(channels)); }
  function sourceUrls(program) { return program.url ? [program.url] : (FALLBACK_SOURCES[program.source] || []); }
  window.MyTVData = { KEY, DEFAULT_CHANNELS, loadChannels, saveChannels, sourceUrls, clone };
}());
