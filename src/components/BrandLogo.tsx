export default function BrandLogo() {
  return (
    <a
      href="/"
      className="flex items-center"
      aria-label="에어픽 홈"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        if (window.location.pathname === '/' || window.location.pathname === '') return;
        window.history.pushState({ tab: 'home' }, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }}
    >
      <img
        src="/brand-logo.png"
        alt="AirPick 에어픽"
        className="block h-18 w-auto select-none"
        draggable={false}
      />
    </a>
  );
}
