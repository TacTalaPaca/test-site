(() => {
  const cache = new Map();

  const canHandle = (url) => {
    const u = new URL(url, location.href);
    if (u.origin !== location.origin) return false;
    if (!u.pathname.endsWith('.html')) return false;
    return true;
  };

  const parseDoc = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return {
      main: doc.querySelector('main.main'),
      title: doc.title || '',
    };
  };

  const fetchPage = async (url) => {
    const abs = new URL(url, location.href).href;
    if (cache.has(abs)) return cache.get(abs);
    const res = await fetch(abs, { credentials: 'same-origin', cache: 'force-cache' });
    if (!res.ok) throw new Error('Failed to fetch');
    const text = await res.text();
    const parsed = parseDoc(text);
    cache.set(abs, parsed);
    return parsed;
  };

  const closeMobileMenuIfOpen = () => {
    const toggle = document.getElementById('mobile-menu-toggle');
    if (toggle) toggle.checked = false;
  };

  const swapContent = ({ main, title }, url, replace) => {
    if (!main) {
      location.assign(url);
      return;
    }
    const current = document.querySelector('main.main');
    if (!current) {
      location.assign(url);
      return;
    }

    closeMobileMenuIfOpen();

    // Ensure identity
    main.id = 'main';
    main.classList.add('main');

    current.replaceWith(main);

    if (title) document.title = title;

    // Accessibility: focus and scroll top
    try {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    } catch {}
    window.scrollTo(0, 0);

    if (!replace) history.pushState({ url }, '', url);
  };

  const navigate = (url, replace = false) => {
    fetchPage(url)
      .then((parsed) => swapContent(parsed, url, replace))
      .catch(() => location.assign(url));
  };

  const handleClick = (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || a.target === '_blank' || a.hasAttribute('download')) return;
    const abs = new URL(href, location.href);
    if (!canHandle(abs.href)) return;
    e.preventDefault();
    if (abs.href === location.href) return;
    navigate(abs.href);
  };

  const prefetch = (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    const abs = new URL(href, location.href);
    if (!canHandle(abs.href)) return;
    const key = abs.href;
    if (cache.has(key)) return;
    fetchPage(key).catch(() => {});
  };

  window.addEventListener('click', handleClick);
  window.addEventListener('mouseover', prefetch, { passive: true });
  window.addEventListener('touchstart', prefetch, { passive: true });
  window.addEventListener('popstate', () => navigate(location.href, true));
})();
