const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const clearSearchBtn = document.querySelector('#clear-search-btn');
const clearPicksBtn = document.querySelector('#clear-picks-btn');
const resultsGrid = document.querySelector('#results-grid');
const favoritesList = document.querySelector('#favorites-list');
const resultsMessage = document.querySelector('#results-message');
const favoritesMessage = document.querySelector('#favorites-message');
const quickFilters = document.querySelector('#quick-filters');
const favoritesFilters = document.querySelector('#favorites-filters');
const trackCardTemplate = document.querySelector('#track-card-template');
const favoriteCardTemplate = document.querySelector('#favorite-card-template');

const STORAGE_KEY = 'workout-music-picks';

const CATEGORY_OPTIONS = [
  { value: 'warm-up', label: 'Warm-Up' },
  { value: 'heavy-lifting', label: 'Heavy Lifting' },
  { value: 'heaviest-lifting', label: 'Heaviest Lifting' },
  { value: 'motivational-uplifting', label: 'Motivational / Uplifting' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'focus', label: 'Focus' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'endurance', label: 'Endurance' }
];

let allTracks = [];
let filteredTracks = [];
let activeTrackFilter = 'all';
let activeFavoritesFilter = 'all';
let favorites = loadFavorites();

buildFilterButtons();

async function loadTracks() {
  try {
    const response = await fetch('./tracks.json');

    if (!response.ok) {
      throw new Error('Track data could not load.');
    }

    allTracks = await response.json();
    filteredTracks = [...allTracks];
    updateResultsMessage();
    renderTracks(filteredTracks);
    renderFavorites();
  } catch (error) {
    resultsMessage.textContent = 'Something went wrong loading the track list.';
    resultsGrid.innerHTML =
      '<div class="empty-state">Check the file path for <strong>tracks.json</strong> or run the project with Live Server.</div>';
  }
}

function buildFilterButtons() {
  quickFilters.innerHTML = '';
  favoritesFilters.innerHTML = '';

  quickFilters.appendChild(createFilterButton('All Tracks', 'all', 'filter', true));
  favoritesFilters.appendChild(createFilterButton('All', 'all', 'category', true));

  for (const category of CATEGORY_OPTIONS) {
    quickFilters.appendChild(
      createFilterButton(category.label, category.value, 'filter', false)
    );

    favoritesFilters.appendChild(
      createFilterButton(category.label, category.value, 'category', false)
    );
  }
}

function createFilterButton(label, value, type, isActive) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = isActive ? 'chip chip--active' : 'chip';
  button.textContent = label;

  if (type === 'filter') {
    button.dataset.filter = value;
  } else {
    button.dataset.category = value;
  }

  return button;
}

function loadFavorites() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    return [];
  }
}

function saveFavorites() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

function handleSearch(event) {
  event.preventDefault();
  applyTrackFilters();
}

function applyTrackFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const matches = [];

  for (const track of allTracks) {
    const searchText = `${track.title} ${track.artist} ${track.album}`.toLowerCase();
    const matchesQuery = query === '' || searchText.includes(query);
    const matchesCategory =
      activeTrackFilter === 'all' || track.category === activeTrackFilter;

    if (matchesQuery && matchesCategory) {
      matches.push(track);
    }
  }

  filteredTracks = matches;
  updateResultsMessage(query);
  renderTracks(filteredTracks);
}

function updateResultsMessage(query = searchInput.value.trim()) {
  if (allTracks.length === 0) {
    resultsMessage.textContent = 'Loading tracks...';
    return;
  }

  if (filteredTracks.length === 0) {
    resultsMessage.textContent =
      'No tracks matched your search yet. Try a different artist, song, album, or category.';
    return;
  }

  if (query) {
    resultsMessage.textContent = `Showing ${filteredTracks.length} result(s) for “${query}”.`;
    return;
  }

  if (activeTrackFilter !== 'all') {
    resultsMessage.textContent = `Showing ${filteredTracks.length} ${formatCategoryLabel(
      activeTrackFilter
    )} track(s).`;
    return;
  }

  resultsMessage.textContent = `Showing ${filteredTracks.length} workout-ready track(s).`;
}

function renderTracks(tracks) {
  resultsGrid.innerHTML = '';

  if (tracks.length === 0) {
    resultsGrid.innerHTML =
      '<div class="empty-state">No tracks found. Try a broader search or another category filter.</div>';
    return;
  }

  for (const track of tracks) {
    const card = trackCardTemplate.content.cloneNode(true);
    const article = card.querySelector('.track-card');
    const art = card.querySelector('.track-card__art');
    const tag = card.querySelector('.track-card__tag');
    const title = card.querySelector('.track-card__title');
    const artist = card.querySelector('.track-card__artist');
    const album = card.querySelector('.track-card__album');
    const select = card.querySelector('.track-card__select');
    const saveButton = card.querySelector('.save-button');
    const viewLink = card.querySelector('.view-link');

    art.innerHTML = `<img src="${createCoverArt(track)}" alt="Album art for ${track.title} by ${track.artist}">`;
    tag.textContent = formatCategoryLabel(track.category);
    title.textContent = track.title;
    artist.textContent = track.artist;
    album.textContent = track.album;

    buildCategorySelectOptions(select, track.category);

    viewLink.href = buildTrackSearchLink(track);

    saveButton.addEventListener('click', function () {
      addFavorite(track, select.value);
    });

    article.dataset.id = track.id;
    resultsGrid.appendChild(card);
  }
}

function buildCategorySelectOptions(select, selectedValue) {
  select.innerHTML = '';

  for (const category of CATEGORY_OPTIONS) {
    const option = document.createElement('option');
    option.value = category.value;
    option.textContent = category.label;

    if (category.value === selectedValue) {
      option.selected = true;
    }

    select.appendChild(option);
  }
}

function addFavorite(track, category) {
  const existingIndex = findFavoriteIndex(track.id);
  const favoriteTrack = {
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    baseCategory: track.category,
    category: category
  };

  if (existingIndex !== -1) {
    favorites[existingIndex].category = category;
  } else {
    favorites.unshift(favoriteTrack);
  }

  saveFavorites();
  renderFavorites();
}

function findFavoriteIndex(trackId) {
  for (let i = 0; i < favorites.length; i += 1) {
    if (favorites[i].id === trackId) {
      return i;
    }
  }

  return -1;
}

function renderFavorites() {
  favoritesList.innerHTML = '';

  const visibleFavorites = [];

  for (const favorite of favorites) {
    if (activeFavoritesFilter === 'all' || favorite.category === activeFavoritesFilter) {
      visibleFavorites.push(favorite);
    }
  }

  if (favorites.length === 0) {
    favoritesMessage.textContent = 'Save tracks to build your workout soundtrack.';
    favoritesList.innerHTML =
      '<div class="empty-state">Your saved picks will show up here. Start by adding a few heavy or motivational tracks.</div>';
    return;
  }

  if (visibleFavorites.length === 0) {
    favoritesMessage.textContent = `You do not have any saved picks in ${formatCategoryLabel(
      activeFavoritesFilter
    )} yet.`;
    favoritesList.innerHTML =
      '<div class="empty-state">Try another filter or save a new track into this category.</div>';
    return;
  }

  favoritesMessage.textContent = `You have ${visibleFavorites.length} saved pick(s).`;

  for (const favorite of visibleFavorites) {
    const card = favoriteCardTemplate.content.cloneNode(true);
    const art = card.querySelector('.favorite-card__art');
    const title = card.querySelector('.favorite-card__title');
    const meta = card.querySelector('.favorite-card__meta');
    const badge = card.querySelector('.favorite-card__badge');
    const viewLink = card.querySelector('.view-link');
    const removeButton = card.querySelector('.remove-button');

    art.innerHTML = `<img src="${createCoverArt({
      title: favorite.title,
      artist: favorite.artist,
      category: favorite.baseCategory || favorite.category
    })}" alt="Album art for ${favorite.title} by ${favorite.artist}">`;

    title.textContent = favorite.title;
    meta.textContent = `${favorite.artist} • ${favorite.album}`;
    badge.textContent = formatCategoryLabel(favorite.category);
    viewLink.href = buildTrackSearchLink(favorite);

    removeButton.addEventListener('click', function () {
      removeFavorite(favorite.id);
    });

    favoritesList.appendChild(card);
  }
}

function removeFavorite(trackId) {
  const nextFavorites = [];

  for (const favorite of favorites) {
    if (favorite.id !== trackId) {
      nextFavorites.push(favorite);
    }
  }

  favorites = nextFavorites;
  saveFavorites();
  renderFavorites();
}

function buildTrackSearchLink(track) {
  const term = encodeURIComponent(`${track.artist} ${track.title}`);
  return `https://www.youtube.com/results?search_query=${term}`;
}

function formatCategoryLabel(value) {
  for (const category of CATEGORY_OPTIONS) {
    if (category.value === value) {
      return category.label;
    }
  }

  return value;
}

function createCoverArt(track) {
  const categoryColors = {
    'warm-up': ['#7a1328', '#11d987'],
    'heavy-lifting': ['#5b0f1a', '#ce1f00'],
    'heaviest-lifting': ['#ff6a00', '#b31212'],
    'motivational-uplifting': ['#1df2a3', '#7a1328'],
    cardio: ['#7a1328', '#ff7f11'],
    focus: ['#5b0f1a', '#0ea5b7'],
    recovery: ['#2fbf71', '#7a1328'],
    endurance: ['#ff8a00', '#7a1328']
  };

  const colors = categoryColors[track.category] || ['#7a1328', '#23d18b'];
  const initials = `${track.artist.charAt(0)}${track.title.charAt(0)}`.toUpperCase();
  const safeArtist = escapeSvgText(track.artist);
  const safeTitle = escapeSvgText(track.title);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" role="img" aria-label="Album art for ${safeTitle} by ${safeArtist}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" rx="34" fill="url(#g)" />
      <circle cx="240" cy="58" r="44" fill="rgba(255,255,255,0.10)" />
      <circle cx="64" cy="246" r="54" fill="rgba(255,255,255,0.08)" />
      <text x="26" y="120" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="800" fill="white">${initials}</text>
      <text x="26" y="210" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="white">${safeTitle}</text>
      <text x="26" y="242" font-family="Inter, Arial, sans-serif" font-size="17" fill="rgba(255,255,255,0.85)">${safeArtist}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeSvgText(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

quickFilters.addEventListener('click', function (event) {
  const button = event.target.closest('.chip');

  if (!button) {
    return;
  }

  activeTrackFilter = button.dataset.filter;
  setActiveChip(quickFilters, button);
  applyTrackFilters();
});

favoritesFilters.addEventListener('click', function (event) {
  const button = event.target.closest('.chip');

  if (!button) {
    return;
  }

  activeFavoritesFilter = button.dataset.category;
  setActiveChip(favoritesFilters, button);
  renderFavorites();
});

function setActiveChip(container, clickedButton) {
  const buttons = container.querySelectorAll('.chip');

  for (const button of buttons) {
    button.classList.remove('chip--active');
  }

  clickedButton.classList.add('chip--active');
}

clearSearchBtn.addEventListener('click', function () {
  searchInput.value = '';
  activeTrackFilter = 'all';

  const allButton = quickFilters.querySelector('[data-filter="all"]');
  setActiveChip(quickFilters, allButton);

  applyTrackFilters();
});

clearPicksBtn.addEventListener('click', function () {
  favorites = [];
  saveFavorites();
  renderFavorites();
});

searchForm.addEventListener('submit', handleSearch);
searchInput.addEventListener('input', applyTrackFilters);

loadTracks();
