export default function Loading() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-card">
        <span className="loader" aria-hidden="true" />
      </div>
    </div>
  );
}
