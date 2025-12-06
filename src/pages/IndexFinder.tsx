import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import arrowBtn from "@/assets/arrow-btn.png";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Search } from "lucide-react";

type JournalEntry = {
  id: string;
  session_id: string | null;
  title: string;
  content: string;
  created_at: string;
};

const IndexFinder = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  useEffect(() => {
    fetchEntries();
    setTimeout(() => setShowContent(true), 100);
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
    <div className="bg-white min-h-screen flex flex-col items-center justify-center py-10">
      <div className="flex flex-col gap-5 w-[600px]">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
          >
            <img 
              src={arrowBtn} 
              alt="Back" 
              className="w-full h-full"
            />
          </button>
          <h1 className="font-mono font-medium text-[22px] leading-4 text-[#1F2A37]">
            Index Finder
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full h-10 pl-10 pr-4 font-ibm text-sm bg-white border border-[#374151] focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {/* Entries List */}
        <ScrollArea className="h-[500px]">
          <div className={`flex flex-col gap-2 pr-4 transition-opacity duration-300 ${
            showContent ? 'opacity-100' : 'opacity-0'
          }`}>
            {isLoadingEntries ? (
              <p className="font-ibm text-sm text-gray-500 text-center py-8">Loading entries...</p>
            ) : filteredEntries.length === 0 ? (
              <p className="font-ibm text-sm text-gray-500 text-center py-8">
                {searchQuery ? "No entries match your search. Try different keywords." : "No journal entries yet. Start writing to see them here!"}
              </p>
            ) : (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => handleEntryClick(entry)}
                  className="w-full bg-white border border-black p-4 shadow-[2px_2px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                >
                  <p className="font-ibm text-xs font-medium text-gray-500 mb-1">
                    {format(new Date(entry.created_at), 'MMM dd, yyyy')}
                  </p>
                  <h3 className="font-mono text-base font-medium text-[#010101] mb-1 line-clamp-1">
                    {entry.title}
                  </h3>
                  <p className="font-ibm text-xs font-light text-gray-600 line-clamp-2">
                    {stripHtml(entry.content).substring(0, 100)}
                    {stripHtml(entry.content).length > 100 ? '...' : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default IndexFinder;
