import type { CSSProperties } from 'react';
import { business, whatsappLink } from '../../data/business';
import { useReveal } from '../../lib/motion';
import { handleSectionLinkClick } from '../../lib/scrollToSection';
import './Footer.css';

const FOOTER_LINKS = [
  { href: '#treatments', label: 'Treatments' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#visit', label: 'Visit us' },
];

/** Position of a column in the footer's arrival, 80ms apart. */
const col = (index: number) => ({ '--c': index }) as CSSProperties;

// Social icons are deferred until real profile URLs exist (tickets/LATER-001).
export function Footer() {
  const year = new Date().getFullYear();
  const { address } = business;
  /*
   * The last thing on the page still arrives (§6b): the rule along its top
   * draws across from the left, then the columns come up 32px, 80ms apart,
   * and the base line last. Socials will join that last slot (LATER-001).
   */
  const revealRef = useReveal<HTMLElement>();

  return (
    <footer className="site-footer" ref={revealRef} data-reveal="out">
      <span className="site-footer__rule" aria-hidden="true" />
      <div className="container site-footer__grid">
        <div className="site-footer__brand m-col" style={col(0)}>
          <p className="wordmark">C-berry</p>
          <p className="site-footer__about">{business.tagline}</p>
        </div>

        <nav aria-label="Footer" className="m-col" style={col(1)}>
          <ul className="site-footer__links">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <a className="text-link" href={link.href} onClick={handleSectionLinkClick}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <address className="site-footer__contact m-col" style={col(2)}>
          <span>{address.venue}</span>
          <span>{address.street}, {address.area}</span>
          <a className="text-link" href={business.phone.href}>
            {business.phone.display}
          </a>
          <a
            className="text-link"
            href={whatsappLink("Hi C-berry, I'd like to book a session.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp us
          </a>
          <span>{business.hours}</span>
        </address>
      </div>

      <div className="container site-footer__base m-col" style={col(3)}>
        <p>© {year} C-berry. All rights reserved.</p>
        <p className="site-footer__credit">
          Developed by{' '}
          <a
            className="text-link"
            href="https://ifeanyi.ifeanyiokafor.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ifeanyi Okafor
          </a>
        </p>
        <p>Some photographs from Unsplash, used under the Unsplash License.</p>
      </div>
    </footer>
  );
}
