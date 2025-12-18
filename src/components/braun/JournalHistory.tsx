import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  session_id: string;
}

const JournalHistory = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching entries:", error);
      } else {
        setEntries(data || []);
      }
      setIsLoading(false);
    };

    fetchEntries();
  }, []);

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const truncate = (text: string, maxLength: number) => {
    const stripped = stripHtml(text);
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength).trim() + "...";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="braun-label text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-device-inset flex items-center justify-center mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="braun-title text-lg text-foreground mb-2">No entries yet</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Start a reflection to create your first journal entry.
        </p>
        <button
          onClick={() => navigate("/chat")}
          className="braun-button braun-button-primary"
        >
          START REFLECTING
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="braun-title text-2xl text-foreground mb-2">Journal</h2>
        <p className="text-sm text-muted-foreground">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </p>
      </div>

      {/* Entries list */}
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <button
            key={entry.id}
            onClick={() => navigate(`/journal/${entry.session_id}`)}
            className="w-full text-left lcd-display p-4 hover:ring-2 hover:ring-braun-orange hover:ring-opacity-30 transition-all group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground group-hover:text-braun-orange transition-colors truncate">
                  {entry.title || "Untitled"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {truncate(entry.content, 100)}
                </p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="braun-label lcd-text-dim">
                  {format(new Date(entry.created_at), "MMM d")}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {format(new Date(entry.created_at), "h:mm a")}
                </span>
              </div>
            </div>
            
            {/* Subtle indicator */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-control-border opacity-60">
              <div className="w-1 h-1 rounded-full bg-braun-orange" />
              <span className="text-[10px] text-muted-foreground">
                TAP TO VIEW
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* New entry button */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={() => navigate("/chat")}
          className="braun-button braun-button-primary"
        >
          NEW REFLECTION
        </button>
      </div>
    </div>
  );
};

export default JournalHistory;
