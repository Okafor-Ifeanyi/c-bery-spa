import { business, whatsappLink } from '../../data/business';
import { handleSectionLinkClick } from '../../lib/scrollToSection';
import './Footer.css';

const FOOTER_LINKS = [
  { href: '#treatments', label: 'Treatments' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#visit', label: 'Visit us' },
];

// Social icons are deferred until real profile URLs exist (tickets/LATER-001).
export function Footer() {
  const year = new Date().getFullYear();
  const { address } = business;

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <p className="wordmark">C-berry</p>
          <p className="site-footer__about">{business.tagline}</p>
        </div>

        <nav aria-label="Footer">
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

        <address className="site-footer__contact">
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

      <div className="container site-footer__base">
        <p>© {year} C-berry. All rights reserved.</p>
        <p>Some photographs from Unsplash, used under the Unsplash License.</p>
      </div>
    </footer>
  );
}
