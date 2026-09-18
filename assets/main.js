document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // header scroll state + progress bar
  const header = document.getElementById('siteHeader');
  const progress = document.getElementById('progress');
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
    if (progress) {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100;
      progress.style.width = pct + '%';
    }
  });

  // reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  revealEls.forEach(el => io.observe(el));

  // active nav link = current page
  const current = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.navlinks a, #mnav a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const page = href.split('/').pop();
    if (page === current || (current === '' && page === 'index.html')) {
      link.classList.add('active');
    }
  });

  // mobile menu
  const burger = document.getElementById('burgerBtn');
  const mnav = document.getElementById('mnav');
  if (burger && mnav) {
    burger.addEventListener('click', () => mnav.classList.toggle('open'));
    mnav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mnav.classList.remove('open')));
  }

  // theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem('theme');
    if (saved) root.setAttribute('data-theme', saved);
  } catch (e) {}
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // TC1 / TC2 tabs (parcours.html only)
  const tcTabs = document.getElementById('tcTabs');
  if (tcTabs) {
    const tabBtns = tcTabs.querySelectorAll('.tc-tab-btn');
    const panels = document.querySelectorAll('[data-tab-panel]');
    const showTab = (tab) => {
      tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
      panels.forEach(p => p.classList.toggle('tab-active', p.dataset.tabPanel === tab));
    };
    tabBtns.forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.tab)));
    const initialActive = tcTabs.querySelector('.tc-tab-btn.active');
    showTab(initialActive ? initialActive.dataset.tab : 'tc2');
  }

  // rotating word in the home hero title (index.html only)
  const rotatorWord = document.getElementById('rotatorWord');
  if (rotatorWord) {
    const words = ['ENTREPRENDRE', 'CRÉER', 'VENDRE', 'INNOVER', 'DÉVELOPPER'];
    let i = 0;
    setInterval(() => {
      rotatorWord.classList.add('leaving');
      setTimeout(() => {
        i = (i + 1) % words.length;
        rotatorWord.textContent = words[i];
        rotatorWord.classList.remove('leaving');
        rotatorWord.classList.add('entering');
        setTimeout(() => rotatorWord.classList.remove('entering'), 450);
      }, 450);
    }, 3200);
  }

  // project filter bar (projets-sae.html only)
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('#projectList .project-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      projectCards.forEach(card => {
        const tags = (card.dataset.tags || '').split(' ');
        card.classList.toggle('hide', f !== 'tous' && !tags.includes(f));
      });
    });
  });
});
