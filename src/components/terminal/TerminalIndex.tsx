import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Search, ChevronRight, FileText } from "lucide-react";

type JournalEntry = {
  id: string;
  session_id: string | null;
  title: string;
  content: string;
  created_at: string;
};

const TerminalIndex = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEntries(entries);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = entries.filter(
        (entry) =>
          entry.title.toLowerCase().includes(query) ||
          stripHtml(entry.content).toLowerCase().includes(query)
      );
      setFilteredEntries(filtered);
    }
    setSelectedIndex(0);
  }, [searchQuery, entries]);

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setEntries(data || []);
      setFilteredEntries(data || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEntryClick = (entry: JournalEntry) => {
    if (entry.session_id) {
      navigate(`/journal/${entry.session_id}`);
    } else {
      navigate(`/new-entry?id=${entry.id}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="terminal-box p-3">
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-terminal-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH ENTRIES..."
            className="flex-1 bg-transparent text-terminal-text font-vt323 text-lg uppercase tracking-wider outline-none placeholder:text-terminal-muted"
          />
          <span className="text-terminal-dim font-vt323 text-sm">
            {filteredEntries.length} FOUND
          </span>
        </div>
      </div>

      {/* Entry list */}
      <div className="space-y-2 max-h-[350px] overflow-auto terminal-scrollbar">
        {isLoading ? (
          <div className="terminal-box p-4 text-center">
            <span className="text-terminal-dim font-vt323 text-lg animate-pulse">
              LOADING DATABASE...
            </span>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="terminal-box p-4 text-center">
            <span className="text-terminal-dim font-vt323 text-lg">
              {searchQuery ? "NO MATCHING ENTRIES" : "NO ENTRIES FOUND"}
            </span>
          </div>
        ) : (
          filteredEntries.map((entry, index) => (
            <div
              key={entry.id}
              onClick={() => handleEntryClick(entry)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`terminal-box p-3 cursor-pointer transition-all ${
                selectedIndex === index
                  ? "terminal-box-selected"
                  : "hover:border-terminal-accent"
              }`}
            >
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-terminal-accent mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-vt323 text-lg text-terminal-glow terminal-glow-subtle truncate">
                      {entry.title.toUpperCase()}
                    </h3>
                    <span className="text-terminal-dim font-vt323 text-sm flex-shrink-0">
                      {format(new Date(entry.created_at), "MMM dd, yyyy").toUpperCase()}
                    </span>
                  </div>
                  <p className="text-terminal-dim font-ibm text-xs mt-1 line-clamp-2">
                    {stripHtml(entry.content).substring(0, 120)}
                    {stripHtml(entry.content).length > 120 ? "..." : ""}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-terminal-dim flex-shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer instructions */}
      <div className="flex items-center justify-center gap-6 text-terminal-dim font-vt323 text-sm pt-2">
        <span>[CLICK] SELECT</span>
        <span>[SCROLL] NAVIGATE</span>
      </div>
    </div>
  );
};

export default TerminalIndex;
