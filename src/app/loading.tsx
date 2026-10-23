export default function Loading() {
  return (
    <div className="container section" role="status" aria-live="polite">
      <p className="eyebrow gold-text">CÉSPEDES LIVING</p>
      <h1>Preparando seu próximo momento…</h1>
      <div className="skeleton-grid" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <div className="skeleton" key={n} />
        ))}
      </div>
    </div>
  );
}
