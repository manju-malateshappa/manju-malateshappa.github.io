(() => {
  'use strict';

  // ===== Theme toggle (persisted, respects system preference on first visit) =====
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  if (stored) {
    root.setAttribute('data-theme', stored);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    root.setAttribute('data-theme', 'light');
  }
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // ===== Mobile nav =====
  const menuBtn = document.getElementById('menu-toggle');
  const nav = document.querySelector('.primary-nav');
  menuBtn?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }));

  // ===== Header scroll state =====
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== Active section highlight =====
  const navLinks = Array.from(document.querySelectorAll('.primary-nav a'));
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (sections.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.toggle('active',
            a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(s => obs.observe(s));
  }

  // ===== Reveal on scroll =====
  const revealTargets = document.querySelectorAll('.section, .t-item, .skill-card, .ach-card, .edu-card');
  revealTargets.forEach(el => el.classList.add('reveal'));
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealTargets.forEach(el => revealObs.observe(el));

  // ===== Year =====
  const yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());

  // ===== GitHub repo grid =====
  // Curated by relevance to current AI/ML narrative; ordered intentionally.
  const FEATURED = [
    'Generative-AI-with-LLMs',
    'mlops-sagemaker-github-actions',
    'Credit_card_Fraud_Detection',
    'Model_Fairness_And_Transperancy',
    'base-infrastructure',
    'Telecom-Customer-Churn-Prediction',
    'Airbnb-Big-Data-Project',
    'Machine-Learning',
  ];

  // Static fallback used when GitHub API is rate-limited or offline.
  const FALLBACK = [
    { name: 'Generative-AI-with-LLMs', description: 'Understand, deploy, and leverage Large Language Models in real-world applications.', language: 'Jupyter Notebook', stargazers_count: 0, html_url: 'https://github.com/manju-malateshappa/Generative-AI-with-LLMs' },
    { name: 'mlops-sagemaker-github-actions', description: 'MLOps pipeline on AWS SageMaker driven by GitHub Actions.', language: 'Python', stargazers_count: 0, html_url: 'https://github.com/manju-malateshappa/mlops-sagemaker-github-actions' },
    { name: 'Credit_card_Fraud_Detection', description: 'Multiple ML implementations for detecting fraudulent credit-card transactions.', language: 'Jupyter Notebook', stargazers_count: 0, html_url: 'https://github.com/manju-malateshappa/Credit_card_Fraud_Detection' },
    { name: 'Model_Fairness_And_Transperancy', description: 'Bias detection & mitigation on COMPAS using IBM AIF360, Google What-If, and SHAP.', language: 'Jupyter Notebook', stargazers_count: 0, html_url: 'https://github.com/manju-malateshappa/Model_Fairness_And_Transperancy' },
    { name: 'base-infrastructure', description: 'Reusable Terraform infrastructure modules.', language: 'HCL', stargazers_count: 0, html_url: 'https://github.com/manju-malateshappa/base-infrastructure' },
    { name: 'Telecom-Customer-Churn-Prediction', description: 'Churn prediction with TensorFlow Sequential (Neural Net) models.', language: 'Jupyter Notebook', stargazers_count: 0, html_url: 'https://github.com/manju-malateshappa/Telecom-Customer-Churn-Prediction' },
    { name: 'Airbnb-Big-Data-Project', description: 'Analysis of Airbnb data to identify the criteria for becoming a superhost.', language: 'Jupyter Notebook', stargazers_count: 1, html_url: 'https://github.com/manjum2050/Airbnb-Big-Data-Project' },
    { name: 'Machine-Learning', description: 'Regression, classification, clustering and NLP algorithm implementations.', language: 'Jupyter Notebook', stargazers_count: 0, html_url: 'https://github.com/manju-malateshappa/Machine-Learning' },
  ];

  const LANG_COLORS = {
    'Python': '#3572A5',
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Jupyter Notebook': '#DA5B0B',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'HCL': '#844FBA',
    'Shell': '#89e051',
  };

  const grid = document.getElementById('repo-grid');
  if (!grid) return;

  const iconRepo = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>';
  const iconStar = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>';

  const card = (r) => {
    const a = document.createElement('a');
    a.className = 'repo-card';
    a.href = r.html_url;
    a.target = '_blank';
    a.rel = 'noopener';
    const lang = r.language || '';
    const langDot = `<span class="lang-dot" style="background:${LANG_COLORS[lang] || '#888'}"></span>`;
    a.innerHTML = `
      <div class="repo-name">${iconRepo}<span>${escapeHtml(r.name)}</span></div>
      <p class="repo-desc">${escapeHtml(r.description || '—')}</p>
      <div class="repo-meta">
        ${lang ? `<span class="lang">${langDot}${escapeHtml(lang)}</span>` : ''}
        ${r.stargazers_count > 0 ? `<span>${iconStar} ${r.stargazers_count}</span>` : ''}
      </div>`;
    return a;
  };

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const render = (repos) => {
    grid.innerHTML = '';
    repos.forEach(r => grid.appendChild(card(r)));
  };

  grid.innerHTML = '<div class="repo-loading">Loading projects from GitHub</div>';

  fetch('https://api.github.com/users/manju-malateshappa/repos?per_page=100&sort=updated')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(repos => {
      const byName = new Map(repos.map(r => [r.name, r]));
      const picked = FEATURED.map(name => byName.get(name)).filter(Boolean);
      if (picked.length === 0) throw new Error('no matches');
      render(picked);
    })
    .catch(() => {
      render(FALLBACK);
    });
})();

// ===== Brand link: always scroll to top (works around sticky-header anchor quirk) =====
(() => {
  const brand = document.querySelector('a.brand');
  if (!brand) return;
  const href = brand.getAttribute('href') || '';
  // Only intercept same-page hash anchors; cross-page hrefs (e.g. "index.html") navigate natively
  if (!href.startsWith('#')) return;
  brand.addEventListener('click', e => {
    e.preventDefault();
    // Respect CSS scroll-behavior on html (smooth in this site)
    window.scrollTo(0, 0);
    if (location.hash) {
      history.replaceState('', document.title, location.pathname + location.search);
    }
  });
})();

// ===== Certifications page: hash-routed cert detail viewer =====
(() => {
  'use strict';
  const CERT_IDS = ['claude-architect', 'terraform-associate'];

  const hero = document.querySelector('.certs-hero');
  const details = Array.from(document.querySelectorAll('.cert-detail'));
  if (!hero || !details.length) return; // not the certifications page

  const root = document.documentElement;

  const render = () => {
    const hash = (location.hash || '').replace(/^#/, '');
    const id = CERT_IDS.includes(hash) ? hash : null;
    details.forEach(d => {
      const active = d.id === id;
      d.classList.toggle('is-active', active);
      // Force-reveal: IntersectionObserver was attached while .cert-detail was
      // display:none, so on mobile Safari/Chrome it doesn't fire when we flip
      // to display:block here. Skip the animation and mark .in directly so the
      // section becomes opacity:1 immediately.
      if (active) d.classList.add('in');
      // Collapse any open <details> elements when navigating away from a cert.
      if (!active) d.querySelectorAll('details[open]').forEach(det => det.removeAttribute('open'));
    });
    root.classList.toggle('cert-open', !!id);
    window.scrollTo(0, 0);
    if (id) {
      const heading = document.getElementById(id).querySelector('h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  };

  render();
  window.addEventListener('hashchange', render);
  window.addEventListener('popstate', render);

  document.querySelectorAll('[data-action="back-to-certs"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      if (location.hash) {
        history.pushState('', document.title, location.pathname + location.search);
        render();
      }
    });
  });
})();
