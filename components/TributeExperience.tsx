'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Memory } from '@/lib/db';
import MemoryForm from '@/components/MemoryForm';
import MemoryWall from '@/components/MemoryWall';

type Tab = 'wall' | 'gallery' | 'donate';

export default function TributeExperience({
  memories,
  galleryPhotos,
}: {
  memories: Memory[];
  galleryPhotos: string[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>('wall');
  const [heroProgress, setHeroProgress] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const uniqueGalleryPhotos = useMemo(
    () => Array.from(new Set(galleryPhotos.filter(Boolean))),
    [galleryPhotos]
  );

  useEffect(() => {
    const intro = introRef.current;
    if (!intro || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      intro.classList.remove('intro-pending');
      intro.classList.add('intro-visible');
      observer.disconnect();
    }, { threshold: 0.1 });

    intro.classList.add('intro-pending');
    observer.observe(intro);
    return () => {
      observer.disconnect();
      intro.classList.remove('intro-pending', 'intro-visible');
    };
  }, []);

  useEffect(() => {
    function onScroll() {
      const heroHeight = Math.max(window.innerHeight, 1);
      setHeroProgress(Math.min(window.scrollY / heroHeight, 1));
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setLightboxIndex(null);
      if (event.key === 'ArrowLeft') {
        setLightboxIndex((current) => current === null ? null : (current - 1 + uniqueGalleryPhotos.length) % uniqueGalleryPhotos.length);
      }
      if (event.key === 'ArrowRight') {
        setLightboxIndex((current) => current === null ? null : (current + 1) % uniqueGalleryPhotos.length);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxIndex, uniqueGalleryPhotos.length]);

  const heroImageStyle = {
    transform: `translate3d(0, ${heroProgress * 34}px, 0) scale(${1 + heroProgress * 0.045})`,
  } as CSSProperties;

  const heroCopyStyle = {
    opacity: 1 - heroProgress * 1.35,
    transform: `translateX(-50%) translateY(${heroProgress * 36}px)`,
  } as CSSProperties;

  function switchTab(tab: Tab) {
    setActiveTab(tab);
  }

  return (
    <main className="tribute-page">
      <section className="hero-stage" aria-label="Deepak and Madhu Ahuja">
        <div className="hero-image" style={heroImageStyle} />
        <div className="hero-shade" />

        <div className="hero-copy" style={heroCopyStyle}>
          <p className="hero-kicker">In Loving Memory Of</p>
          <h1>
            <span className="hero-name">Madhu</span>
            <span className="hero-ampersand" aria-hidden="true">&amp;</span>
            <span className="hero-name">Deepak Ahuja</span>
          </h1>
        </div>
      </section>

      <section className="memorial-content" id="tribute-content">
        <div className="tribute-intro" ref={introRef}>
          <p className="intro-kicker">A legacy of love</p>
          <p className="tribute-intro-text">
            The pillars of the family and the soul of the community, Madhu and Deepak lived with profound kindness, warmth, laughter, and generosity. Whether you knew them through their businesses, dancing on tables, or chaotic family feasts, they had an extraordinary ability to bring people together. Thank you for honoring them with us.
          </p>
        </div>

        <header className="tribute-header">
          <div className="tribute-header-inner">
            <nav className="tribute-tabs" aria-label="Tribute sections">
              <button
                type="button"
                className={activeTab === 'wall' ? 'tribute-tab active' : 'tribute-tab'}
                onClick={() => switchTab('wall')}
              >
                Memorial Wall
              </button>
              <button
                type="button"
                className={activeTab === 'gallery' ? 'tribute-tab active' : 'tribute-tab'}
                onClick={() => switchTab('gallery')}
              >
                Photo Gallery
              </button>
              <button
                type="button"
                className={activeTab === 'donate' ? 'tribute-tab active' : 'tribute-tab'}
                onClick={() => switchTab('donate')}
              >
                Donate
              </button>
            </nav>
          </div>
        </header>

        <div className="tab-stage">
          {activeTab === 'wall' ? (
            <section className="tab-panel" aria-labelledby="wall-title">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Shared memories</p>
                  <h2 id="wall-title">Memorial Wall</h2>
                  <p className="panel-description">
                    Please share your favorite memories to commemorate Madhu and Deepak. You can also add your favorite photos.
                  </p>
                  <MemoryForm buttonLabel="Contribute" />
                </div>
              </div>

              <MemoryWall memories={memories} />
            </section>
          ) : activeTab === 'gallery' ? (
            <section className="tab-panel" aria-labelledby="gallery-title">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Their life in pictures</p>
                  <h2 id="gallery-title">Photo Gallery</h2>
                  <p className="panel-description">
                    We invite you to browse cherished moments with Deepak and Madhu over the years. Photos shared in Memorial Wall posts are automatically added here.
                  </p>
                </div>
              </div>

              <section className="photo-sharing" aria-labelledby="photo-sharing-title">
                <h3 id="photo-sharing-title">Share your photos</h3>
                <p>
                  If you have photos of your own with Madhu and Deepak that you would like to share,
                  we encourage you to add them to our{' '}
                  <a
                    href="https://drive.google.com/drive/folders/1t3qyeQRpjyQYHPVL5GrASXCayL4q8uOJ?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    shared Google Drive
                  </a>.
                </p>
              </section>

              {uniqueGalleryPhotos.length > 0 ? (
                <div className="photo-gallery">
                  {uniqueGalleryPhotos.map((src, index) => (
                    <button
                      className="gallery-photo"
                      type="button"
                      key={`${src}-${index}`}
                      onClick={() => setLightboxIndex(index)}
                      aria-label={`Open gallery photo ${index + 1}`}
                    >
                      <img src={src} alt={`Deepak and Madhu gallery photo ${index + 1}`} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-memory">No photos have been shared yet.</div>
              )}
            </section>
          ) : (
            <section className="tab-panel donation-panel" aria-labelledby="donate-title">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Giving in their honor</p>
                  <h2 id="donate-title">Donations in Their Memory</h2>
                  <p className="panel-description">
                    Thank you to everyone who has reached out about donations in Madhu and Deepak&apos;s name. We invite you to support one of the organizations below in their memory.
                  </p>
                </div>
              </div>

              <div className="donation-groups">
                <section className="donation-group" aria-labelledby="nepal-relief-title">
                  <p className="donation-label">Nepal disaster relief</p>
                  <h3 id="nepal-relief-title">Support relief efforts in Nepal</h3>
                  <p>These organizations are assisting communities affected by flooding in Nepal.</p>
                  <ul>
                    <li><a href="https://www.savethechildren.net/what-we-do/emergencies/nepal-floods" target="_blank" rel="noopener noreferrer">Save the Children</a></li>
                    <li><a href="https://www.globalgiving.org/projects/nepal-flood-relief-fund/" target="_blank" rel="noopener noreferrer">GlobalGiving</a></li>
                    <li><a href="https://wck.org/relief/flash-flooding-nepal/" target="_blank" rel="noopener noreferrer">World Central Kitchen</a></li>
                    <li><a href="https://www.directrelief.org/emergency/nepal-floods-2026/" target="_blank" rel="noopener noreferrer">Direct Relief</a></li>
                    <li><a href="https://nrcs.org/" target="_blank" rel="noopener noreferrer">Nepal Red Cross Society</a></li>
                    <li><a href="https://www.unicefusa.org/stories/nepal-flash-floods-children-need-help-urgently?initialms=google__cpc__202608_eme-rv_other-sem__textonly_na_na_na_na_nepal__nepalflood&gclsrc=aw.ds&gad_source=1&gad_campaignid=24176947395&gbraid=0AAAAAD3Kj50LrOGl8Pk6Jdxj4wubC5rtP&utm_source=google&utm_medium=cpc&utm_campaign=202608_eme-rv_other-sem&utm_content=textonly_na_na_na_na_nepal&utm_term=nepalflood" target="_blank" rel="noopener noreferrer">UNICEF USA</a></li>
                  </ul>
                </section>

                <section className="donation-group" aria-labelledby="regular-giving-title">
                  <p className="donation-label">Organizations close to their hearts</p>
                  <h3 id="regular-giving-title">Causes they supported regularly</h3>
                  <p>Madhu and Deepak donated to these organizations over the years.</p>
                  <ul>
                    <li><a href="https://www.ekal.org/us" target="_blank" rel="noopener noreferrer">Ekal Vidyalaya</a></li>
                    <li><a href="https://www.sewausa.org/" target="_blank" rel="noopener noreferrer">Sewa International</a></li>
                    <li><a href="https://www.pratham.org/" target="_blank" rel="noopener noreferrer">Pratham</a></li>
                  </ul>
                </section>
              </div>

              <p className="donation-thanks">Thank you for your support.</p>
            </section>
          )}
        </div>
      </section>

      <footer className="site-footer">In loving memory of Deepak &amp; Madhu Ahuja</footer>

      {lightboxIndex !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Photo ${lightboxIndex + 1} of ${uniqueGalleryPhotos.length}`} onMouseDown={() => setLightboxIndex(null)}>
          <button className="lightbox-close" type="button" onMouseDown={(event) => event.stopPropagation()} onClick={() => setLightboxIndex(null)} aria-label="Close photo">
            ×
          </button>
          {uniqueGalleryPhotos.length > 1 && (
            <>
              <button
                className="lightbox-nav lightbox-prev"
                type="button"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={() => setLightboxIndex((current) => current === null ? null : (current - 1 + uniqueGalleryPhotos.length) % uniqueGalleryPhotos.length)}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                className="lightbox-nav lightbox-next"
                type="button"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={() => setLightboxIndex((current) => current === null ? null : (current + 1) % uniqueGalleryPhotos.length)}
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}
          <img src={uniqueGalleryPhotos[lightboxIndex]} alt={`Expanded gallery photo ${lightboxIndex + 1}`} onMouseDown={(event) => event.stopPropagation()} />
          <p className="lightbox-counter" aria-live="polite">{lightboxIndex + 1} / {uniqueGalleryPhotos.length}</p>
        </div>
      )}
    </main>
  );
}
