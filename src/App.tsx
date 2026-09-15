import { useState } from 'react';
import { Footer } from './components/Footer/Footer';
import { Gallery } from './components/Gallery/Gallery';
import { Header } from './components/Header/Header';
import { Hero } from './components/Hero/Hero';
import { Reservation } from './components/Reservation/Reservation';
import { Services } from './components/Services/Services';
import { scrollToSection } from './lib/scrollToSection';

export default function App() {
  // Lifted here so a treatment's "Book" button can pre-select the form's dropdown.
  const [service, setService] = useState('');

  function bookService(serviceId: string) {
    setService(serviceId);
    scrollToSection('visit', 'visit-title');
  }

  return (
    <>
      <a className="btn btn--primary skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Services onBook={bookService} />
        <Gallery />
        <Reservation service={service} onServiceChange={setService} />
      </main>
      <Footer />
    </>
  );
}
