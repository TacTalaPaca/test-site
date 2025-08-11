// Apply saved theme immediately
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

// Theme toggle functionality
const toggleTheme = () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

// Initialize theme buttons (desktop + mobile)
const initializeTheme = () => {
  const buttons = document.querySelectorAll('.theme');
  if (!buttons.length) return setTimeout(initializeTheme, 100);

  buttons.forEach((btn) => {
    if (btn.hasAttribute('data-theme-initialized')) return;
    btn.addEventListener('click', toggleTheme);
    btn.setAttribute('data-theme-initialized', 'true');
  });

  window.toggleTheme = toggleTheme;
};

// Event listeners
document.addEventListener('DOMContentLoaded', initializeTheme);
document.addEventListener('component:loaded', (e) => {
  const name = e.detail?.component;
  if (name === 'navigation' || name === 'nav' || name === 'navbar') initializeTheme();
});
