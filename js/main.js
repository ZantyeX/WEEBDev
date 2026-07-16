(() => {
  'use strict';

  const menuButton = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? 'Close' : 'Menu';
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = 'Menu';
      });
    });
  }

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav] a').forEach((link) => {
    const linkFile = link.getAttribute('href')?.split('#')[0];
    if (linkFile === currentFile) link.classList.add('active');
  });

  document.querySelectorAll('[data-year]').forEach((item) => {
    item.textContent = new Date().getFullYear();
  });

  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  document.querySelectorAll('.faq-question').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const isOpen = item.classList.toggle('open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  });

  const quotes = [...document.querySelectorAll('.quote')];
  let quoteIndex = 0;
  const showQuote = (index) => {
    quotes.forEach((quote, i) => quote.classList.toggle('active', i === index));
  };
  document.querySelector('[data-quote-prev]')?.addEventListener('click', () => {
    quoteIndex = (quoteIndex - 1 + quotes.length) % quotes.length;
    showQuote(quoteIndex);
  });
  document.querySelector('[data-quote-next]')?.addEventListener('click', () => {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    showQuote(quoteIndex);
  });

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const programCards = [...document.querySelectorAll('[data-program-card]')];
  const programSearch = document.querySelector('[data-program-search]');
  const emptyState = document.querySelector('[data-empty-state]');
  let activeFilter = 'all';

  const filterPrograms = () => {
    const term = programSearch?.value.trim().toLowerCase() || '';
    let shown = 0;
    programCards.forEach((card) => {
      const ages = card.dataset.age || '';
      const text = card.textContent.toLowerCase();
      const filterMatch = activeFilter === 'all' || ages.includes(activeFilter);
      const searchMatch = !term || text.includes(term);
      const show = filterMatch && searchMatch;
      card.classList.toggle('hidden', !show);
      if (show) shown += 1;
    });
    if (emptyState) emptyState.style.display = shown ? 'none' : 'block';
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      filterButtons.forEach((item) => item.classList.toggle('active', item === button));
      filterPrograms();
    });
  });
  programSearch?.addEventListener('input', filterPrograms);

  const programSelect = document.querySelector('#program');
  if (programSelect) {
    const queryProgram = new URLSearchParams(window.location.search).get('program');
    if (queryProgram) {
      const matchingOption = [...programSelect.options].find((option) => option.value === queryProgram);
      if (matchingOption) programSelect.value = queryProgram;
    }
  }

  const saveForm = (form, storageKey) => {
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) {
          status.className = 'form-status error';
          status.textContent = 'Please check the marked boxes and try again.';
        }
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      const records = JSON.parse(localStorage.getItem(storageKey) || '[]');
      records.push({ ...data, sentAt: new Date().toISOString() });
      localStorage.setItem(storageKey, JSON.stringify(records));

      if (status) {
        status.className = 'form-status success';
        status.textContent = 'Thank you. Your message has been saved on this device. Connect this form to your email or server before the site goes live.';
      }
      form.reset();
      if (programSelect && new URLSearchParams(window.location.search).get('program')) {
        programSelect.value = new URLSearchParams(window.location.search).get('program');
      }
    });
  };

  document.querySelectorAll('form[data-save-form]').forEach((form) => {
    saveForm(form, form.dataset.saveForm || 'brightbotsForm');
  });
})();
