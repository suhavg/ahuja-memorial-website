'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Memory } from '@/lib/db';

function prettyDate(value: string) {
  const normalized = value.includes('T') ? value : value.replace(' ', 'T') + 'Z';
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function createdAtTimestamp(value: string) {
  const normalized = value.includes('T') ? value : value.replace(' ', 'T') + 'Z';
  const timestamp = new Date(normalized).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

type OpenContribution = {
  memory: Memory;
  index: number;
} | null;

export default function MemoryWall({ memories }: { memories: Memory[] }) {
  const [openContribution, setOpenContribution] = useState<OpenContribution>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isContributionOpen = openContribution !== null;

  const sortedMemories = useMemo(
    () =>
      [...memories].sort((a, b) => {
        const dateDifference = createdAtTimestamp(b.created_at) - createdAtTimestamp(a.created_at);
        return dateDifference !== 0 ? dateDifference : b.id - a.id;
      }),
    [memories]
  );


  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const resizeCards = () => {
      const styles = window.getComputedStyle(grid);
      const rowHeight = Number.parseFloat(styles.getPropertyValue('grid-auto-rows')) || 8;
      const rowGap = Number.parseFloat(styles.getPropertyValue('row-gap')) || 0;

      grid.querySelectorAll<HTMLElement>('.memory-card').forEach((card) => {
        card.style.gridRowEnd = 'auto';
        const height = card.getBoundingClientRect().height;
        const span = Math.ceil((height + rowGap) / (rowHeight + rowGap));
        card.style.gridRowEnd = `span ${Math.max(span, 1)}`;
      });
    };

    const observer = new ResizeObserver(() => requestAnimationFrame(resizeCards));
    grid.querySelectorAll<HTMLElement>('.memory-card').forEach((card) => observer.observe(card));

    const images = grid.querySelectorAll<HTMLImageElement>('img');
    images.forEach((image) => {
      if (!image.complete) image.addEventListener('load', resizeCards);
    });

    resizeCards();
    window.addEventListener('resize', resizeCards);

    return () => {
      observer.disconnect();
      images.forEach((image) => image.removeEventListener('load', resizeCards));
      window.removeEventListener('resize', resizeCards);
    };
  }, [sortedMemories]);

  useEffect(() => {
    if (!isContributionOpen) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    Object.assign(body.style, {
      overflow: 'hidden',
      position: 'fixed',
      top: `-${scrollY}px`,
      width: '100%',
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenContribution(null);
      if (event.key === 'ArrowRight') movePhoto(1);
      if (event.key === 'ArrowLeft') movePhoto(-1);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      Object.assign(body.style, previous);
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollY);
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isContributionOpen]);

  function openMemory(memory: Memory, index = 0) {
    setOpenContribution({ memory, index });
  }

  function movePhoto(direction: 1 | -1) {
    setOpenContribution((current) => {
      if (!current || current.memory.photos.length <= 1) return current;
      const next =
        (current.index + direction + current.memory.photos.length) % current.memory.photos.length;
      return { ...current, index: next };
    });
  }

  function selectPhoto(index: number) {
    setOpenContribution((current) => (current ? { ...current, index } : current));
  }

  return (
    <>
      {sortedMemories.length > 0 ? (
        <div className="memory-grid" ref={gridRef}>
          {sortedMemories.map((memory) => {
            const visiblePhotos = memory.photos.slice(0, 4);
            const extraCount = Math.max(memory.photos.length - 4, 0);
            const layoutCount = Math.min(memory.photos.length, 4);

            return (
              <article
                className="memory-card memory-card-clickable"
                key={memory.id}
                onClick={() => openMemory(memory)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openMemory(memory);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Open contribution from ${memory.name}`}
              >
                {memory.photos.length > 0 && (
                  <div className={`memory-collage memory-collage-${layoutCount}`}>
                    {visiblePhotos.map((src, index) => (
                      <div className={`memory-photo memory-photo-${index + 1}`} key={`${memory.id}-${index}`}>
                        <img
                          src={src}
                          alt={`Memory shared by ${memory.name}, photo ${index + 1}`}
                        />
                        {index === 3 && extraCount > 0 && (
                          <span className="memory-photo-more">+{extraCount}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="memory-card-copy">
                  <div className="memory-meta">
                    <p className="memory-date">{prettyDate(memory.created_at)}</p>
                    {memory.photos.length > 1 && (
                      <span className="memory-photo-count">{memory.photos.length} photos</span>
                    )}
                  </div>
                  <p className="memory-message memory-message-preview">“{memory.message}”</p>
                  {memory.message.length > 220 && (
                    <span className="memory-open-hint">Read full tribute</span>
                  )}
                  <div className="memory-signature">
                    <span className="memory-author-name">{memory.name}</span>
                    {memory.relationship && (
                      <span className="memory-relationship">{memory.relationship}</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-memory">No memories have been shared yet.</div>
      )}

      {openContribution && createPortal(
        <div
          className="contribution-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Contribution from ${openContribution.memory.name}`}
          onMouseDown={() => setOpenContribution(null)}
        >
          <div
            className={`contribution-modal-shell ${openContribution.memory.photos.length === 0 ? 'contribution-modal-shell-text-only' : ''}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="contribution-modal-close"
              type="button"
              onClick={() => setOpenContribution(null)}
              aria-label="Close contribution"
            >
              ×
            </button>

            {openContribution.memory.photos.length > 0 && (
              <div className="contribution-slideshow">
                <div className="contribution-stage">
                  <img
                    src={openContribution.memory.photos[openContribution.index]}
                    alt={`Photo ${openContribution.index + 1} of ${openContribution.memory.photos.length} shared by ${openContribution.memory.name}`}
                  />

                  {openContribution.memory.photos.length > 1 && (
                    <>
                      <button
                        className="contribution-arrow contribution-arrow-prev"
                        type="button"
                        onClick={() => movePhoto(-1)}
                        aria-label="Previous photo"
                      >
                        ‹
                      </button>
                      <button
                        className="contribution-arrow contribution-arrow-next"
                        type="button"
                        onClick={() => movePhoto(1)}
                        aria-label="Next photo"
                      >
                        ›
                      </button>
                      <div className="contribution-counter">
                        {openContribution.index + 1} / {openContribution.memory.photos.length}
                      </div>
                    </>
                  )}
                </div>

                {openContribution.memory.photos.length > 1 && (
                  <div className="contribution-thumbnails" aria-label="Contribution photos">
                    {openContribution.memory.photos.map((src, index) => (
                      <button
                        type="button"
                        key={`${openContribution.memory.id}-thumb-${index}`}
                        className={`contribution-thumbnail ${index === openContribution.index ? 'is-active' : ''}`}
                        onClick={() => selectPhoto(index)}
                        aria-label={`Show photo ${index + 1}`}
                        aria-current={index === openContribution.index ? 'true' : undefined}
                      >
                        <img src={src} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <aside className="contribution-story">
              <div>
                <p className="contribution-date">{prettyDate(openContribution.memory.created_at)}</p>
                <h3 className="contribution-name">{openContribution.memory.name}</h3>
                {openContribution.memory.relationship && (
                  <p className="contribution-relationship">{openContribution.memory.relationship}</p>
                )}
              </div>

              <div className="contribution-divider" />

              <p className="contribution-message">“{openContribution.memory.message}”</p>

              {openContribution.memory.photos.length > 1 && (
                <p className="contribution-photo-note">
                  {openContribution.memory.photos.length} photos shared in this contribution
                </p>
              )}
            </aside>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
