import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import TagInput from "./TagInput";

interface TerminalEntryProps {
  onWordCountChange: (count: number) => void;
}

const TerminalEntry = ({ onWordCountChange }: TerminalEntryProps) => {
  const [title, setTitle] = useState("UNTITLED_ENTRY");
  const [isSaving, setIsSaving] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [saveProgress, setSaveProgress] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Underline,
    ],
    content: "<p>> Begin your entry...</p>",
    editorProps: {
      attributes: {
        class: "outline-none min-h-[200px] text-terminal-text font-ibm text-sm leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      onWordCountChange(words);
    },
  });

  useEffect(() => {
    const createEntry = async () => {
      try {
        // First create a session
        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .insert({ completed: false })
          .select()
          .single();

        if (sessionError) throw sessionError;

        // Then create the journal entry with the session_id
        const { data, error } = await supabase
          .from("journal_entries")
          .insert({
            session_id: sessionData.id,
            title: "UNTITLED_ENTRY",
            content: "<p>> Begin your entry...</p>",
            tags: [],
          })
          .select()
          .single();

        if (error) throw error;
        setEntryId(data.id);
      } catch (error) {
        console.error("Error creating entry:", error);
        toast.error("Failed to create entry");
      }
    };

    createEntry();
  }, []);

  const handleSave = async () => {
    if (!entryId || !editor) return;

    setIsSaving(true);
    setSaveProgress(0);
    
    // Animate save progress
    const progressInterval = setInterval(() => {
      setSaveProgress((prev) => Math.min(prev + 20, 80));
    }, 100);

    try {
      const { error } = await supabase
        .from("journal_entries")
        .update({
          title,
          content: editor.getHTML(),
          tags,
        })
        .eq("id", entryId);

      if (error) throw error;

      clearInterval(progressInterval);
      setSaveProgress(100);
      
      setTimeout(() => {
        setLastSaved(new Date());
        toast.success("ENTRY SAVED");
        setSaveProgress(0);
        setIsSaving(false);
      }, 200);
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Error saving:", error);
      toast.error("SAVE FAILED");
      setSaveProgress(0);
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-tab-enter">
      {/* Title */}
      <div className="terminal-box p-3">
        <div className="flex items-center gap-2 text-terminal-dim font-vt323 text-sm mb-2">
          <span>▶ TITLE:</span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.toUpperCase())}
          className="w-full bg-transparent text-terminal-glow terminal-glow-subtle font-vt323 text-xl uppercase tracking-wider outline-none"
          placeholder="ENTER TITLE..."
        />
      </div>

      {/* Tags */}
      <TagInput tags={tags} onTagsChange={setTags} />

      {/* Editor */}
      <div className="terminal-box p-4 min-h-[200px]">
        <EditorContent editor={editor} />
      </div>

      {/* Save Button - Enhanced */}
      <div className="terminal-box p-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="terminal-save-btn group"
          >
            <span className="terminal-save-btn-bracket">[</span>
            <span className="terminal-save-btn-content">
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="terminal-save-progress">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`terminal-save-block ${
                          saveProgress > i * 20 ? "terminal-save-block-filled" : ""
                        }`}
                      />
                    ))}
                  </span>
                  <span>WRITING...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="terminal-save-icon">▶</span>
                  <span>SAVE_ENTRY.exe</span>
                </span>
              )}
            </span>
            <span className="terminal-save-btn-bracket">]</span>
          </button>
          
          {lastSaved && (
            <div className="flex items-center gap-2 text-terminal-dim font-vt323 text-sm">
              <span className="text-status-success">●</span>
              <span>SAVED: {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminalEntry;
