import { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Link as LinkIcon, 
  List, 
  ListOrdered,
  Save,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TerminalEntryProps {
  onWordCountChange: (count: number) => void;
}

const TerminalEntry = ({ onWordCountChange }: TerminalEntryProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("UNTITLED_ENTRY");
  const [isSaving, setIsSaving] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Underline,
    ],
    content: "<p>> Begin your entry...</p>",
    editorProps: {
      attributes: {
        class: "outline-none min-h-[250px] text-terminal-text font-ibm text-sm leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      onWordCountChange(words);
    },
  });

  // Create entry on mount
  useEffect(() => {
    const createEntry = async () => {
      try {
        const { data, error } = await supabase
          .from("journal_entries")
          .insert({
            session_id: null,
            title: "UNTITLED_ENTRY",
            content: "<p>> Begin your entry...</p>",
          })
          .select()
          .single();

        if (error) throw error;
        setEntryId(data.id);
      } catch (error) {
        console.error("Error creating entry:", error);
      }
    };

    createEntry();
  }, []);

  const handleSave = async () => {
    if (!entryId || !editor) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("journal_entries")
        .update({
          title,
          content: editor.getHTML(),
        })
        .eq("id", entryId);

      if (error) throw error;

      setLastSaved(new Date());
      toast.success("ENTRY SAVED TO DATABASE");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("SAVE FAILED - RETRY");
    } finally {
      setIsSaving(false);
    }
  };

  const setLink = () => {
    const url = window.prompt("ENTER URL:");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="space-y-4">
      {/* Title input */}
      <div className="terminal-box p-3">
        <div className="flex items-center gap-2 text-terminal-dim font-vt323 text-sm mb-2">
          <span>&gt; TITLE:</span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.toUpperCase())}
          className="w-full bg-transparent text-terminal-glow terminal-glow-subtle font-vt323 text-xl uppercase tracking-wider outline-none"
          placeholder="ENTER TITLE..."
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 terminal-box">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`terminal-btn px-2 py-1 text-sm ${
            editor?.isActive("bold") ? "terminal-btn-primary" : ""
          }`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`terminal-btn px-2 py-1 text-sm ${
            editor?.isActive("italic") ? "terminal-btn-primary" : ""
          }`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`terminal-btn px-2 py-1 text-sm ${
            editor?.isActive("underline") ? "terminal-btn-primary" : ""
          }`}
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-terminal-border mx-1" />
        
        <button onClick={setLink} className="terminal-btn px-2 py-1 text-sm">
          <LinkIcon className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-terminal-border mx-1" />
        
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`terminal-btn px-2 py-1 text-sm ${
            editor?.isActive("bulletList") ? "terminal-btn-primary" : ""
          }`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`terminal-btn px-2 py-1 text-sm ${
            editor?.isActive("orderedList") ? "terminal-btn-primary" : ""
          }`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        <button
          onClick={() => navigate("/chat")}
          className="terminal-btn px-3 py-1 flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>AIDEN</span>
        </button>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="terminal-btn-primary terminal-btn px-3 py-1 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "SAVING..." : "SAVE"}</span>
        </button>
      </div>

      {/* Editor */}
      <div className="terminal-box p-4 min-h-[250px]">
        <EditorContent editor={editor} />
      </div>

      {/* Last saved indicator */}
      {lastSaved && (
        <div className="text-terminal-dim font-vt323 text-sm text-right">
          LAST SAVED: {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default TerminalEntry;
