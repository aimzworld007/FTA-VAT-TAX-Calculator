import React from 'react';

export function usePathname() {
  const [pathname, setPathname] = React.useState(() => window.location.pathname || '/');

  React.useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname || '/');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = React.useCallback((to) => {
    if (window.location.pathname === to) return;
    window.history.pushState({}, '', to);
    setPathname(to);
  }, []);

  return { pathname, navigate };
}

export function RouteLink({ to, className = '', children, onClick }) {
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        if (onClick) onClick(event);
        if (event.defaultPrevented) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        window.history.pushState({}, '', to);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }}
    >
      {children}
    </a>
  );
}
