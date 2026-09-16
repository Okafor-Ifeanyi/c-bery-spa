import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { handleSectionLinkClick } from '../../lib/scrollToSection';
import { useScrollProgress } from '../../lib/motion';
import './Header.css';

const NAV_LINKS = [
  { href: '#treatments', label: 'Treatments' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#visit', label: 'Visit us' },
];

const DESKTOP_QUERY = '(min-width: 860px)';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /*
   * The header doesn't arrive, it densifies: --head runs 0 -> 1 over the first
   * 100px of scroll and Header.css interpolates background, blur and hairline
   * from it continuously. Replaces the old snap at scrollY > 8.
   */
  const headerRef = useScrollProgress<HTMLElement>(100);
  const activeHref = useActiveSection();

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
    <header className="site-header" ref={headerRef}>
      <div className="site-header__inner">
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
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="site-nav__bars" aria-hidden="true" />
          </button>
          <ul id="site-nav-list" className="site-nav__list" data-open={menuOpen}>
            {NAV_LINKS.map((link, index) => (
              <li key={link.href} style={{ '--i': index } as CSSProperties}>
                <a
                  href={link.href}
                  aria-current={activeHref === link.href ? 'true' : undefined}
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

/**
 * The nav link for whichever section holds the middle band of the viewport,
 * or null over the hero. Marks the link with aria-current for the indicator.
 */
function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.querySelector<HTMLElement>(link.href)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Document order: the first section in the band wins.
        const current = sections.find((el) => visible.has(el.id));
        setActive(current ? `#${current.id}` : null);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return active;
}
