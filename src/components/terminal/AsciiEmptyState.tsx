interface AsciiEmptyStateProps {
  type: "no-entries" | "no-results" | "loading";
  message?: string;
}

const AsciiEmptyState = ({ type, message }: AsciiEmptyStateProps) => {
  const asciiArt = {
    "no-entries": `
    ┌─────────────────────────┐
    │                         │
    │   ╔═══════════════╗     │
    │   ║  NO ENTRIES   ║     │
    │   ║    FOUND      ║     │
    │   ╚═══════════════╝     │
    │                         │
    │    ┌───────────┐        │
    │    │ ░░░░░░░░░ │        │
    │    │ ░░░░░░░░░ │        │
    │    │ ░░░░░░░░░ │        │
    │    └───────────┘        │
    │                         │
    │   START YOUR FIRST      │
    │   ENTRY IN [ENTRY]      │
    │                         │
    └─────────────────────────┘`,
    "no-results": `
    ┌─────────────────────────┐
    │                         │
    │      ╭───────╮          │
    │      │ (×_×) │          │
    │      ╰───────╯          │
    │                         │
    │    SEARCH RETURNED      │
    │      NO MATCHES         │
    │                         │
    │   TRY DIFFERENT TERMS   │
    │                         │
    └─────────────────────────┘`,
    "loading": `
    ┌─────────────────────────┐
    │                         │
    │    ╔═══════════════╗    │
    │    ║ ▓▓▓▓░░░░░░░░░ ║    │
    │    ╚═══════════════╝    │
    │                         │
    │    ACCESSING DATABASE   │
    │    PLEASE STANDBY...    │
    │                         │
    └─────────────────────────┘`,
  };

  return (
    <div className="py-8 flex flex-col items-center justify-center">
      <pre className="font-vt323 text-terminal-dim text-xs leading-tight text-center whitespace-pre">
        {asciiArt[type]}
      </pre>
      {message && (
        <p className="font-vt323 text-terminal-muted text-sm mt-4 uppercase tracking-wider">
          {message}
        </p>
      )}
    </div>
  );
};

export default AsciiEmptyState;
