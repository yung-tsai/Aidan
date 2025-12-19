import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import AsciiEmptyState from "./AsciiEmptyState";

type JournalEntry = {
  id: string;
  session_id: string | null;
  title: string;
  content: string;
  created_at: string;
  tags?: string[];
};

const TerminalIndex = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    let filtered = entries;
    
    // Filter by tag first
    if (selectedTag) {
      filtered = filtered.filter((entry) => 
        entry.tags?.includes(selectedTag)
      );
    }
    
    // Then filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(query) ||
          stripHtml(entry.content).toLowerCase().includes(query)
      );
    }
    
    setFilteredEntries(filtered);
    setSelectedIndex(0);
  }, [searchQuery, entries, selectedTag]);

  // Collect all unique tags
  useEffect(() => {
    const tags = new Set<string>();
    entries.forEach((entry) => {
      entry.tags?.forEach((tag) => tags.add(tag));
    });
    setAllTags(Array.from(tags).sort());
  }, [entries]);

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
    setSelectedEntry(entry);
    setEditTitle(entry.title);
    setEditContent(stripHtml(entry.content));
    setIsEditing(false);
  };

  const handleBack = () => {
    setSelectedEntry(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedEntry) return;

    try {
      const { error } = await supabase
        .from("journal_entries")
        .update({
          title: editTitle,
          content: `<p>${editContent}</p>`,
        })
        .eq("id", selectedEntry.id);

      if (error) throw error;

      toast.success("ENTRY UPDATED");
      setIsEditing(false);
      
      // Update local state
      const updatedEntry = { ...selectedEntry, title: editTitle, content: `<p>${editContent}</p>` };
      setSelectedEntry(updatedEntry);
      setEntries((prev) =>
        prev.map((e) => (e.id === selectedEntry.id ? updatedEntry : e))
      );
    } catch (error) {
      console.error("Error updating entry:", error);
      toast.error("UPDATE FAILED");
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", selectedEntry.id);

      if (error) throw error;

      toast.success("ENTRY DELETED");
      setSelectedEntry(null);
      setEntries((prev) => prev.filter((e) => e.id !== selectedEntry.id));
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("DELETE FAILED");
    } finally {
      setIsDeleting(false);
    }
  };

  // If an entry is selected, show full content
  if (selectedEntry) {
    return (
      <div className="space-y-4 animate-tab-enter">
        {/* Back button */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="terminal-btn text-xs flex items-center gap-2"
          >
            <span>◀</span>
            <span>[ BACK ]</span>
          </button>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={handleEdit}
                  className="terminal-btn text-xs"
                >
                  [ EDIT ]
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="terminal-btn terminal-btn-danger text-xs"
                >
                  {isDeleting ? "[ ... ]" : "[ DEL ]"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="terminal-btn text-xs"
                >
                  [ CANCEL ]
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="terminal-btn terminal-btn-primary text-xs"
                >
                  [ SAVE ]
                </button>
              </>
            )}
          </div>
        </div>

        {/* Entry header */}
        <div className="terminal-box p-3">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value.toUpperCase())}
              className="w-full bg-transparent text-terminal-glow terminal-glow-subtle font-vt323 text-xl uppercase tracking-wider outline-none"
            />
          ) : (
            <h2 className="font-vt323 text-xl text-terminal-glow terminal-glow-subtle">
              {selectedEntry.title.toUpperCase()}
            </h2>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-terminal-dim font-vt323 text-sm">
              {format(new Date(selectedEntry.created_at), "MMMM dd, yyyy 'at' HH:mm").toUpperCase()}
            </span>
            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
              <div className="flex gap-1">
                {selectedEntry.tags.map((tag) => (
                  <span key={tag} className="terminal-tag-small">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Entry content */}
        <div className="terminal-box p-4">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[200px] bg-transparent text-terminal-text font-ibm text-sm leading-relaxed outline-none resize-none"
            />
          ) : (
            <div 
              className="text-terminal-text font-ibm text-sm leading-relaxed prose-terminal"
              dangerouslySetInnerHTML={{ __html: selectedEntry.content }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-tab-enter">
      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-vt323 text-terminal-dim text-sm">FILTER:</span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`terminal-tag-filter ${!selectedTag ? "terminal-tag-filter-active" : ""}`}
          >
            ALL
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`terminal-tag-filter ${selectedTag === tag ? "terminal-tag-filter-active" : ""}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="terminal-box p-3">
        <div className="flex items-center gap-3">
          <span className="font-vt323 text-terminal-glow">▶</span>
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
      <div className="space-y-2">
        {isLoading ? (
          <AsciiEmptyState type="loading" />
        ) : filteredEntries.length === 0 ? (
          <AsciiEmptyState 
            type={searchQuery || selectedTag ? "no-results" : "no-entries"} 
          />
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
                <span className="font-vt323 text-terminal-dim text-lg">
                  {selectedIndex === index ? "▸" : " "}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-vt323 text-lg text-terminal-glow terminal-glow-subtle truncate">
                      {entry.title.toUpperCase()}
                    </h3>
                    <span className="text-terminal-dim font-vt323 text-sm flex-shrink-0">
                      {format(new Date(entry.created_at), "MMM dd, yyyy").toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-terminal-dim font-ibm text-xs line-clamp-1 flex-1">
                      {stripHtml(entry.content).substring(0, 80)}...
                    </p>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex gap-1 flex-shrink-0">
                        {entry.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="terminal-tag-small">
                            #{tag}
                          </span>
                        ))}
                        {entry.tags.length > 2 && (
                          <span className="terminal-tag-small">+{entry.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-center gap-6 text-terminal-dim font-vt323 text-sm pt-2">
        <span>[ CLICK ] SELECT</span>
        <span>[ SCROLL ] NAVIGATE</span>
      </div>
    </div>
  );
};

export default TerminalIndex;
