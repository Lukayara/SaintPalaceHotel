const CONTACT_EMAIL = 'tresjuice@hotmail.com';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const menuButton = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
const siteHeader = document.querySelector('.site-header');
function updateHeader() {
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 32);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? 'Sluiten' : 'Menu';
  primaryNav.classList.toggle('is-open', open);
});
primaryNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  primaryNav.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = 'Menu';
}));

if (!reduceMotion && 'IntersectionObserver' in window) {
  function prepareHeadingLines(heading) {
    const lines = [[]];
    [...heading.childNodes].forEach((node) => {
      if (node.nodeName === 'BR') lines.push([]);
      else lines[lines.length - 1].push(node);
    });
    heading.replaceChildren(...lines.map((nodes, index) => {
      const line = document.createElement('span');
      line.className = 'motion-line';
      line.style.setProperty('--line-index', index);
      const text = document.createElement('span');
      text.className = 'motion-line-inner';
      nodes.forEach((node) => text.append(node));
      line.append(text);
      return line;
    }));
  }

  document.querySelectorAll('.hero h1, .reveal h2').forEach(prepareHeadingLines);
  document.documentElement.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      primaryNav.querySelectorAll('a').forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-38% 0px -52% 0px' });
  document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
}

const scrollProgress = document.querySelector('#scroll-progress-fill');
const parallaxImages = reduceMotion ? [] : [...document.querySelectorAll('[data-parallax]')];
let scrollFramePending = false;
function updateScrollMotion() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  scrollProgress.style.transform = `scaleX(${progress})`;

  parallaxImages.forEach((image) => {
    const bounds = image.getBoundingClientRect();
    const speed = Number(image.dataset.parallax) || 0;
    const offset = Math.max(-42, Math.min(42, (window.innerHeight / 2 - (bounds.top + bounds.height / 2)) * speed));
    image.style.setProperty('--parallax-y', `${offset.toFixed(1)}px`);
  });
  scrollFramePending = false;
}
function requestScrollMotion() {
  if (scrollFramePending) return;
  scrollFramePending = true;
  window.requestAnimationFrame(updateScrollMotion);
}
requestScrollMotion();
window.addEventListener('scroll', requestScrollMotion, { passive: true });
window.addEventListener('resize', requestScrollMotion, { passive: true });

const gallery = document.querySelector('.gallery');
const galleryPhotos = [
  { src: 'assets/eterna/zee-raam.jpg', alt: 'De zee gezien door de ramen van het appartement', title: 'De zee, altijd dichtbij' },
  { src: 'assets/eterna/woonkamer.jpg', alt: 'Lichte woonkamer met uitzicht op zee', title: 'Woonkamer in het avondlicht' },
  { src: 'assets/eterna/woonkamer-uitzicht.jpg', alt: 'De woonkamer met grote ramen en een balkon aan zee', title: 'Wonen met uitzicht' },
  { src: 'assets/eterna/slaapkamer.jpg', alt: 'Slaapkamer met een tweepersoonsbed en extra bed', title: 'Slaapkamer' },
  { src: 'assets/eterna/slaapkamer-uitzicht.jpg', alt: 'Slaapkamer met openslaande deuren en uitzicht over Zandvoort', title: 'Een kamer boven de stad' },
  { src: 'assets/eterna/zandvoort-uitzicht.jpg', alt: 'Panoramisch uitzicht over Zandvoort vanaf het appartement', title: 'Zandvoort van boven' },
];
const lightbox = document.querySelector('#photo-lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxCaption = document.querySelector('#lightbox-caption');
const lightboxCount = document.querySelector('#lightbox-count');
let activePhoto = 0;
let lightboxTrigger = null;

function showLightboxPhoto(index) {
  activePhoto = (index + galleryPhotos.length) % galleryPhotos.length;
  const photo = galleryPhotos[activePhoto];
  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.alt;
  lightboxCaption.textContent = photo.title;
  lightboxCount.textContent = `${String(activePhoto + 1).padStart(2, '0')} / ${String(galleryPhotos.length).padStart(2, '0')}`;
}

function openLightbox(index, trigger) {
  lightboxTrigger = trigger;
  showLightboxPhoto(index);
  lightbox.showModal();
}

function closeLightbox() {
  lightbox.close();
  lightboxTrigger?.focus();
}

function makeGalleryGroup(track, duplicate = false) {
  const group = document.createElement('div');
  group.className = 'gallery-group';
  if (duplicate) {
    group.setAttribute('aria-hidden', 'true');
  }
  galleryPhotos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-card';
    button.setAttribute('aria-label', `Bekijk foto: ${photo.title}`);
    if (duplicate) button.tabIndex = -1;
    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = duplicate ? '' : photo.alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    const caption = document.createElement('span');
    caption.textContent = photo.title;
    button.append(image, caption);
    const originalButton = duplicate
      ? track.querySelector('.gallery-group:not([aria-hidden]) .gallery-card:nth-child(' + (index + 1) + ')')
      : button;
    button.addEventListener('click', () => openLightbox(index, originalButton));
    group.append(button);
  });
  track.append(group);
}

document.querySelectorAll('.gallery-track').forEach((track) => {
  makeGalleryGroup(track);
  makeGalleryGroup(track, true);
});
document.querySelector('#gallery-motion-toggle').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const paused = button.getAttribute('aria-pressed') !== 'true';
  gallery.classList.toggle('is-paused', paused);
  button.setAttribute('aria-pressed', String(paused));
  button.innerHTML = `<span aria-hidden="true">${paused ? '▶' : 'Ⅱ'}</span> ${paused ? 'Beweging hervatten' : 'Beweging pauzeren'}`;
});
document.querySelector('#lightbox-close').addEventListener('click', closeLightbox);
document.querySelector('#lightbox-previous').addEventListener('click', () => showLightboxPhoto(activePhoto - 1));
document.querySelector('#lightbox-next').addEventListener('click', () => showLightboxPhoto(activePhoto + 1));
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
lightbox.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') showLightboxPhoto(activePhoto - 1);
  if (event.key === 'ArrowRight') showLightboxPhoto(activePhoto + 1);
});

const API_URL = String(window.AVAILABILITY_API_URL || '').trim();
const MAX_NIGHTS = 7;
const availability = new Map();
const calendar = document.querySelector('#calendar-days');
const monthLabel = document.querySelector('#calendar-month');
const calendarMessage = document.querySelector('#calendar-message');
const selectionLabel = document.querySelector('#calendar-selection-text');
const requestSelectedDates = document.querySelector('#calendar-request');
const bookingForm = document.querySelector('#booking-form');
const arrivalField = bookingForm.elements.arrival;
const departureField = bookingForm.elements.departure;
const adminDialog = document.querySelector('#admin-dialog');
const adminLogin = document.querySelector('#admin-login');
const adminEditor = document.querySelector('#admin-editor');
const localToday = new Date();
localToday.setHours(0, 0, 0, 0);
let displayedMonth = new Date(localToday.getFullYear(), localToday.getMonth(), 1);
let selectedArrival = '';
let selectedDeparture = '';
let adminCode = '';

function isoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromIso(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(value, amount) {
  const date = dateFromIso(value);
  date.setDate(date.getDate() + amount);
  return isoDate(date);
}

function prettyDate(value, options = { day: 'numeric', month: 'long' }) {
  if (!value) return '';
  return new Intl.DateTimeFormat('nl-NL', options).format(dateFromIso(value));
}

function apiJsonp(params) {
  if (!API_URL) return Promise.reject(new Error('De gedeelde agenda is nog niet gekoppeld.'));
  return new Promise((resolve, reject) => {
    const callbackName = `__availabilityCallback${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => finish(new Error('De agenda reageert niet.')), 12000);
    const finish = (error, data) => {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
      if (error) reject(error);
      else resolve(data);
    };
    window[callbackName] = (data) => finish(null, data);
    script.onerror = () => finish(new Error('De gedeelde agenda kan niet worden bereikt.'));
    const url = new URL(API_URL);
    Object.entries({ ...params, callback: callbackName, _: Date.now() }).forEach(([key, value]) => url.searchParams.set(key, value));
    script.src = url.href;
    document.head.append(script);
  });
}

function dateStatus(value) {
  const date = dateFromIso(value);
  if (date < localToday) return 'past';
  return availability.get(value) || 'unknown';
}

function setCalendarMessage(message, tone = 'info') {
  calendarMessage.textContent = message;
  calendarMessage.dataset.tone = tone;
  if (!reduceMotion && typeof calendarMessage.animate === 'function') {
    calendarMessage.animate(
      [{ opacity: 0.45, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 260, easing: 'cubic-bezier(.2,.75,.25,1)' },
    );
  }
}

function selectionIsAvailable(start, end) {
  let date = start;
  while (date < end) {
    if (dateStatus(date) !== 'available') return false;
    date = addDays(date, 1);
  }
  return true;
}

function renderCalendar(animate = false) {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  monthLabel.textContent = new Intl.DateTimeFormat('nl-NL', { month: 'long', year: 'numeric' }).format(displayedMonth);
  document.querySelector('#calendar-prev').disabled = year === localToday.getFullYear() && month <= localToday.getMonth();
  const cells = [];
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const numberOfDays = new Date(year, month + 1, 0).getDate();
  for (let pad = 0; pad < firstWeekday; pad += 1) cells.push({ empty: true });
  for (let day = 1; day <= numberOfDays; day += 1) cells.push({ day, value: isoDate(new Date(year, month, day)) });
  while (cells.length % 7) cells.push({ empty: true });

  calendar.replaceChildren();
  cells.forEach((cell, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'calendar-day';
    if (cell.empty) {
      button.classList.add('is-outside');
      button.tabIndex = -1;
      button.setAttribute('aria-hidden', 'true');
    } else {
      const state = dateStatus(cell.value);
      button.textContent = String(cell.day);
      button.dataset.date = cell.value;
      button.dataset.state = state;
      const isToday = cell.value === isoDate(localToday);
      if (isToday) {
        button.classList.add('is-today');
        button.setAttribute('aria-current', 'date');
      }
      button.setAttribute('aria-label', `${prettyDate(cell.value, { weekday: 'long', day: 'numeric', month: 'long' })}${isToday ? ', vandaag' : ''}: ${state === 'available' ? 'beschikbaar' : state === 'booked' ? 'bezet' : state === 'past' ? 'verstreken' : 'nog niet bijgewerkt'}`);
      button.title = `${prettyDate(cell.value, { weekday: 'long', day: 'numeric', month: 'long' })}${isToday ? ' · vandaag' : ''} · ${state === 'available' ? 'beschikbaar' : state === 'booked' ? 'bezet' : state === 'past' ? 'verstreken' : 'nog niet bijgewerkt'}`;
      const selected = cell.value === selectedArrival || cell.value === selectedDeparture;
      const inRange = selectedArrival && selectedDeparture && cell.value > selectedArrival && cell.value < selectedDeparture;
      if (selected) button.classList.add('is-selected');
      else if (inRange) button.classList.add('is-in-range');
      button.disabled = state === 'past';
      if (!button.disabled) button.addEventListener('click', () => chooseCalendarDate(cell.value));
      if (animate && !reduceMotion && typeof button.animate === 'function') {
        button.animate(
          [{ opacity: 0, transform: 'translateY(12px) scale(.9)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }],
          { duration: 420, delay: Math.min(index * 17, 340), easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'backwards' },
        );
      }
    }
    calendar.append(button);
  });
  updateSelection();
}

function chooseCalendarDate(value) {
  const state = dateStatus(value);
  if (!selectedArrival || selectedDeparture || value <= selectedArrival) {
    if (state === 'booked') {
      setCalendarMessage(`${prettyDate(value)} is al bezet. Kies een dag met een groene stip.`, 'error');
      return;
    }
    if (state !== 'available') {
      setCalendarMessage(`De beschikbaarheid van ${prettyDate(value)} is nog niet bevestigd. Mail tresjuice@hotmail.com om dit na te vragen.`, 'error');
      return;
    }
    selectedArrival = value;
    selectedDeparture = '';
    setCalendarMessage('Aankomst gekozen. Kies nu een beschikbare vertrekdag, maximaal zeven nachten later.', 'success');
  } else {
    const nights = Math.round((dateFromIso(value) - dateFromIso(selectedArrival)) / 86400000);
    if (nights < 1 || nights > MAX_NIGHTS) {
      setCalendarMessage('Een verblijf duurt minimaal één en maximaal zeven nachten.', 'error');
      return;
    }
    if (!selectionIsAvailable(selectedArrival, value)) {
      let checkDate = selectedArrival;
      let blockedState = 'unknown';
      while (checkDate < value) {
        const checkState = dateStatus(checkDate);
        if (checkState !== 'available') {
          blockedState = checkState;
          break;
        }
        checkDate = addDays(checkDate, 1);
      }
      setCalendarMessage(
        blockedState === 'booked'
          ? 'Deze periode bevat een bezette nacht. Kies een ander verblijf.'
          : 'Deze periode bevat een nacht waarvan de beschikbaarheid nog niet is bevestigd. Mail tresjuice@hotmail.com om dit na te vragen.',
        'error',
      );
      return;
    }
    selectedDeparture = value;
    setCalendarMessage(`${nights} ${nights === 1 ? 'nacht' : 'nachten'} geselecteerd. Vraag de periode aan per e-mail.`, 'success');
  }
  renderCalendar();
}

function updateSelection() {
  if (selectedArrival && selectedDeparture) {
    selectionLabel.textContent = `${prettyDate(selectedArrival)} t/m ${prettyDate(selectedDeparture)} · ${Math.round((dateFromIso(selectedDeparture) - dateFromIso(selectedArrival)) / 86400000)} nachten`;
    requestSelectedDates.disabled = false;
  } else if (selectedArrival) {
    selectionLabel.textContent = `Aankomst ${prettyDate(selectedArrival)} · kies je vertrekdag`;
    requestSelectedDates.disabled = true;
  } else {
    selectionLabel.textContent = 'Selecteer een beschikbare aankomstdag';
    requestSelectedDates.disabled = true;
  }
}

async function refreshAvailability() {
  if (!API_URL) {
    setCalendarMessage('De gedeelde agenda wordt nog gekoppeld. Vraag intussen actuele beschikbaarheid per e-mail.', 'error');
    renderCalendar();
    return;
  }
  setCalendarMessage('Beschikbaarheid laden…', 'loading');
  try {
    const data = await apiJsonp({ action: 'read' });
    if (!data || !data.ok || !Array.isArray(data.days)) throw new Error('De beschikbaarheid kon niet worden geladen.');
    availability.clear();
    data.days.forEach((entry) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(entry.date) && ['available', 'booked'].includes(entry.status)) availability.set(entry.date, entry.status);
    });
    setCalendarMessage('Groene stippen zijn beschikbaar. Een rode × is bezet; een vraagteken wacht nog op bevestiging.', 'success');
    renderCalendar(true);
    return data.days;
  } catch (error) {
    setCalendarMessage(error.message || 'De beschikbaarheid kon niet worden geladen.', 'error');
    renderCalendar();
    return null;
  }
}

function todayIsoDate() {
  return isoDate(localToday);
}

function updateDateMinimums() {
  const today = todayIsoDate();
  arrivalField.min = today;
  departureField.min = arrivalField.value || today;
  const scheduleForm = document.querySelector('#admin-schedule-form');
  scheduleForm.elements.start.min = today;
  scheduleForm.elements.end.min = scheduleForm.elements.start.value || today;
}

function syncLocalToday() {
  const nextToday = new Date();
  nextToday.setHours(0, 0, 0, 0);
  if (nextToday.getTime() === localToday.getTime()) return;

  const previousMonth = `${localToday.getFullYear()}-${localToday.getMonth()}`;
  const wasShowingCurrentMonth = `${displayedMonth.getFullYear()}-${displayedMonth.getMonth()}` === previousMonth;
  localToday.setTime(nextToday.getTime());
  if (wasShowingCurrentMonth) displayedMonth = new Date(localToday.getFullYear(), localToday.getMonth(), 1);

  if ((selectedArrival && selectedArrival < todayIsoDate()) || (selectedDeparture && selectedDeparture <= todayIsoDate())) {
    selectedArrival = '';
    selectedDeparture = '';
    arrivalField.value = '';
    departureField.value = '';
    departureField.max = '';
    setCalendarMessage('De datum is veranderd. Kies opnieuw je aankomst en vertrek.', 'info');
  }
  updateDateMinimums();
  renderCalendar();
  refreshAvailability();
}

function scheduleMidnightRefresh() {
  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 50, 0);
  window.setTimeout(() => {
    syncLocalToday();
    scheduleMidnightRefresh();
  }, Math.max(1000, nextMidnight.getTime() - Date.now()));
}

updateDateMinimums();
scheduleMidnightRefresh();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') syncLocalToday();
});
window.addEventListener('focus', syncLocalToday);
arrivalField.addEventListener('change', () => {
  departureField.min = arrivalField.value || todayIsoDate();
  departureField.max = arrivalField.value ? addDays(arrivalField.value, MAX_NIGHTS) : '';
  if (departureField.value && (departureField.value <= arrivalField.value || departureField.value > departureField.max)) departureField.value = '';
});
document.querySelector('#calendar-prev').addEventListener('click', () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
  renderCalendar(true);
});
document.querySelector('#calendar-next').addEventListener('click', () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
  renderCalendar(true);
});
requestSelectedDates.addEventListener('click', () => {
  if (selectedArrival && selectedDeparture) {
    arrivalField.value = selectedArrival;
    departureField.value = selectedDeparture;
    departureField.min = selectedArrival;
    departureField.max = addDays(selectedArrival, MAX_NIGHTS);
    bookingForm.requestSubmit();
  }
});
bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const arrival = arrivalField.value;
  const departure = departureField.value;
  const guests = bookingForm.elements.guests.value;
  const nights = Math.round((dateFromIso(departure) - dateFromIso(arrival)) / 86400000);
  const error = document.querySelector('#booking-error');
  if (!bookingForm.reportValidity() || !arrival || !departure || nights < 1 || nights > MAX_NIGHTS) {
    error.hidden = false;
    return;
  }
  error.hidden = true;
  const subject = 'Verblijfsaanvraag Appartement Eterna';
  const body = [
    'Ik informeer graag naar de mogelijkheden voor Appartement Eterna.',
    '',
    `Aankomst: ${arrival}`,
    `Vertrek: ${departure}`,
    `Aantal nachten: ${nights}`,
    `Aantal gasten: ${guests}`,
    '',
    'Kunt u laten weten of deze periode definitief beschikbaar is en wat de actuele voorwaarden zijn?',
  ].join('\n');
  document.querySelector('#booking-note').textContent = 'Je e-mailprogramma wordt geopend. Je verblijf is pas bevestigd na een antwoord.';
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.querySelector('#open-admin').addEventListener('click', () => {
  adminLogin.hidden = false;
  adminEditor.hidden = true;
  document.querySelector('#admin-login-error').hidden = true;
  document.querySelector('#admin-login-form').reset();
  if (typeof adminDialog.showModal === 'function') adminDialog.showModal();
});
function closeAdmin() {
  adminDialog.close();
  adminCode = '';
  document.querySelector('#admin-login-form').reset();
  document.querySelector('#admin-schedule-form').reset();
}
document.querySelector('#close-admin').addEventListener('click', closeAdmin);
document.querySelector('#admin-logout').addEventListener('click', closeAdmin);
adminDialog.addEventListener('click', (event) => { if (event.target === adminDialog) closeAdmin(); });
document.querySelector('#admin-login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const code = String(new FormData(event.currentTarget).get('code') || '').trim();
  const error = document.querySelector('#admin-login-error');
  error.hidden = true;
  error.textContent = 'De code klopt niet. Probeer het opnieuw.';
  try {
    const response = await apiJsonp({ action: 'auth', code });
    if (!response || !response.ok) throw new Error('De code klopt niet. Probeer het opnieuw.');
    adminCode = code;
    adminLogin.hidden = true;
    adminEditor.hidden = false;
    updateDateMinimums();
    document.querySelector('#admin-message').textContent = '';
  } catch (authError) {
    error.textContent = authError.message || 'Inloggen is mislukt.';
    error.hidden = false;
  }
});
document.querySelector('#admin-schedule-form').elements.start.addEventListener('change', (event) => {
  const end = document.querySelector('#admin-schedule-form').elements.end;
  end.min = event.currentTarget.value || todayIsoDate();
});
document.querySelector('#admin-schedule-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const start = form.elements.start.value;
  const end = form.elements.end.value;
  const status = form.elements.status.value;
  const error = document.querySelector('#admin-schedule-error');
  const message = document.querySelector('#admin-message');
  error.hidden = true;
  if (!start || !end || end <= start || Math.round((dateFromIso(end) - dateFromIso(start)) / 86400000) > 366) {
    error.textContent = 'Kies een geldige periode van maximaal één jaar.';
    error.hidden = false;
    return;
  }

  message.textContent = 'Periode wordt opgeslagen…';
  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ action: 'set', code: adminCode, start, end, status }),
    });
    let confirmed = false;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      const days = await refreshAvailability();
      const targetStatus = status;
      confirmed = Array.isArray(days);
      for (let date = start; confirmed && date < end; date = addDays(date, 1)) {
        if (!availability.has(date) || availability.get(date) !== targetStatus) confirmed = false;
      }
      if (confirmed) break;
    }
    if (!confirmed) throw new Error('De agenda heeft de wijziging niet bevestigd. Controleer de Apps Script-deployment.');
    message.textContent = 'De gedeelde agenda is bijgewerkt.';
  } catch (saveError) {
    message.textContent = saveError.message || 'Opslaan is mislukt. Probeer het opnieuw.';
  }
});

renderCalendar();
refreshAvailability();

const contactForm = document.querySelector('#contact-form');
contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const message = String(data.get('message') || '').trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const error = document.querySelector('#contact-error');
  if (!name || !validEmail || !message) {
    error.hidden = false;
    (!name ? contactForm.elements.name : !validEmail ? contactForm.elements.email : contactForm.elements.message).focus();
    return;
  }
  error.hidden = true;
  const subject = `Vraag over Appartement Eterna — ${name}`;
  const body = `Naam: ${name}\nE-mailadres: ${email}\n\n${message}`;
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
contactForm.querySelectorAll('input, textarea').forEach((field) => field.addEventListener('input', () => {
  field.removeAttribute('aria-invalid');
  document.querySelector('#contact-error').hidden = true;
}));
