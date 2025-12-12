export function EmptyState() {
  return (
    <div className="empty-state">
      <img 
        src="https://media.tenor.com/uZNHR3i3uoUAAAAi/cute-anime.gif" 
        alt="Oh no! No fragments found." 
        className="empty-state-img"
      />
      <h3>Oh no! No fragments found... (mwup)</h3>
      <p>Try clearing your filters or casting a different search spell!</p>
    </div>
  );
}