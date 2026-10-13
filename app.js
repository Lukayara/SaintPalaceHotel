const CONTACT_EMAIL = 'tresjuice@hotmail.com';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const ScrollSmoother = window.ScrollSmoother;

if (gsap && ScrollTrigger && ScrollSmoother) {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  if (!reduceMotion) {
    window.siteSmoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.05,
      smoothTouch: 0.12,
      effects: true,
    });
    document.documentElement.classList.add('motion-enhanced');
    gsap.from('.hero-content > *', {
      autoAlpha: 0,
      y: 26,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out',
      delay: 0.2,
    });
    gsap.utils.toArray('.reveal').forEach((element) => {
      const x = element.classList.contains('reveal-left') ? -38 : element.classList.contains('reveal-right') ? 38 : 0;
      const y = x === 0 ? 24 : 10;
      gsap.fromTo(element, { autoAlpha: 0, x, y }, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.88,
        ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 86%', once: true },
      });
    });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  }
}

const menuButton = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
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

const bookingForm = document.querySelector('#booking-form');
const arrivalField = bookingForm.elements.arrival;
const departureField = bookingForm.elements.departure;
const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
arrivalField.min = today.toISOString().slice(0, 10);
arrivalField.addEventListener('change', () => {
  departureField.min = arrivalField.value || arrivalField.min;
  if (departureField.value && departureField.value <= arrivalField.value) departureField.value = '';
});
bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const arrival = arrivalField.value;
  const departure = departureField.value;
  const guests = bookingForm.elements.guests.value;
  const error = document.querySelector('#booking-error');
  if (!bookingForm.reportValidity() || !arrival || !departure || departure <= arrival) {
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
    `Aantal gasten: ${guests}`,
    '',
    'Kunt u laten weten of deze periode beschikbaar is en wat de actuele voorwaarden zijn?',
  ].join('\n');
  document.querySelector('#booking-note').textContent = 'Je e-mailprogramma wordt geopend. Verstuur je bericht daar om de aanvraag te verzenden.';
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

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
