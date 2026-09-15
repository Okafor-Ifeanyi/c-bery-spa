import { business, mapsDirectionsUrl, mapsEmbedUrl, whatsappLink } from '../../data/business';

export function VisitInfo() {
  const { address } = business;

  return (
    <div className="visit-info">
      <h3>Find us</h3>

      <address className="visit-info__address">
        <span>{address.venue}</span>
        <span>{address.street}</span>
        <span>{address.landmark}</span>
        <span>{address.area}</span>
      </address>

      <div className="visit-info__map">
        <iframe
          title="Map showing De Castle Hotel, 14 Umuona Street, G.R.A., Enugu"
          src={mapsEmbedUrl}
          width="600"
          height="450"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <dl className="visit-info__list">
        <div>
          <dt>WhatsApp</dt>
          <dd>
            <a
              className="text-link"
              href={whatsappLink("Hi C-berry, I'd like to book a session.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat with us on WhatsApp
            </a>
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>
            <a className="text-link" href={business.phone.href}>
              {business.phone.display}
            </a>
          </dd>
        </div>
        <div>
          <dt>Directions</dt>
          <dd>
            <a className="text-link" href={mapsDirectionsUrl} target="_blank" rel="noopener noreferrer">
              Open in Google Maps
            </a>
          </dd>
        </div>
        <div>
          <dt>Hours</dt>
          <dd>{business.hours}. Late-night and early-morning visits welcome.</dd>
        </div>
      </dl>
    </div>
  );
}
