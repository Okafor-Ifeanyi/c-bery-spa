import { useEffect, useRef, useState } from 'react';
import { handleSectionLinkClick } from '../../lib/scrollToSection';
import './Header.css';

const NAV_LINKS = [
  { href: '#treatments', label: 'Treatments' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#visit', label: 'Visit us' },
];

const DESKTOP_QUERY = '(min-width: 860px)';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // A hairline appears under the header once the page moves.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // While the mobile menu is open: Esc closes it, and widening to desktop resets it.
  useEffect(() => {
    if (!menuOpen) return;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    const onResize = () => desktop.matches && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onResize);
    };
  }, [menuOpen]);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container site-header__inner">
        <a className="wordmark" href="#top" onClick={handleSectionLinkClick}>
          C-berry
        </a>

        <nav className="site-nav" aria-label="Main">
          <button
            ref={toggleRef}
            type="button"
            className="site-nav__toggle"
            aria-expanded={menuOpen}
            aria-controls="site-nav-list"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
          <ul id="site-nav-list" className="site-nav__list" data-open={menuOpen}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(event) => {
                    setMenuOpen(false);
                    handleSectionLinkClick(event);
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a className="btn btn--primary site-header__cta" href="#visit" onClick={handleSectionLinkClick}>
          <span className="site-header__cta-long">Book a session</span>
          <span className="site-header__cta-short">Book</span>
        </a>
      </div>
    </header>
  );
}
