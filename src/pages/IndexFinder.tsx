import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type JournalEntry = {
  id: string;
  session_id: string | null;
  title: string;
  content: string;
  created_at: string;
};

const IndexFinder = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEntries(entries);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = entries.filter(entry => 
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
    setIsLoadingEntries(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setEntries(data || []);
      setFilteredEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setIsLoadingEntries(false);
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Terminal Container */}
      <div className="terminal-container crt-vignette w-full max-w-2xl relative overflow-hidden">
        {/* Scanlines */}
        <div className="terminal-scanlines" />
        
        <div className="crt-sweep crt-flicker relative">
          {/* Header */}
          <div className="terminal-header">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="font-vt323 text-terminal-dim hover:text-terminal-text transition-colors"
              >
                [ ← BACK ]
              </button>
              <span className="text-terminal-dim">│</span>
              <span className="font-vt323 text-lg text-terminal-text tracking-widest">
                INDEX FINDER
              </span>
            </div>
            <span className="font-vt323 text-xs text-terminal-dim">
              {filteredEntries.length} ENTRIES
            </span>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-terminal-border bg-terminal-surface/30">
            <div className="flex items-center gap-3">
              <span className="font-vt323 text-terminal-glow">▶</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH ENTRIES..."
                className="flex-1 bg-transparent text-terminal-text font-vt323 text-lg uppercase tracking-wider outline-none placeholder:text-terminal-muted"
              />
            </div>
          </div>

          {/* Entry List */}
          <div className="max-h-[400px] overflow-y-auto terminal-scrollbar bg-terminal-bg/50">
            {isLoadingEntries ? (
              <div className="p-8 text-center">
                <span className="text-terminal-dim font-vt323 text-lg">
                  LOADING DATABASE<span className="blink-text">...</span>
                </span>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-terminal-dim font-vt323 text-lg">
                  {searchQuery ? "NO MATCHING ENTRIES" : "NO ENTRIES FOUND"}
                </span>
              </div>
            ) : (
              <div className="divide-y divide-terminal-border">
                {filteredEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    onClick={() => handleEntryClick(entry)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedIndex === index
                        ? "bg-terminal-accent/20 border-l-2 border-terminal-glow"
                        : "hover:bg-terminal-surface/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-vt323 text-terminal-dim text-lg mt-0.5">
                        {selectedIndex === index ? "▸" : " "}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-vt323 text-lg text-terminal-glow terminal-glow-subtle truncate">
                            {entry.title.toUpperCase()}
                          </h3>
                          <span className="text-terminal-dim font-vt323 text-xs flex-shrink-0">
                            {format(new Date(entry.created_at), "MMM dd, yyyy").toUpperCase()}
                          </span>
                        </div>
                        <p className="text-terminal-dim font-ibm text-xs line-clamp-2">
                          {stripHtml(entry.content).substring(0, 120)}
                          {stripHtml(entry.content).length > 120 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="terminal-status-bar">
            <span className="font-vt323 text-xs">[ CLICK ] SELECT</span>
            <span className="font-vt323 text-xs">[ SCROLL ] NAVIGATE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexFinder;
