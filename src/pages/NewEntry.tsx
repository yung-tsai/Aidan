import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { toast } from "sonner";

const NewEntry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const existingEntryId = searchParams.get('id');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [title, setTitle] = useState("UNTITLED");
  const [dateString, setDateString] = useState("");
  const [wordCount, setWordCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Underline,
    ],
    content: "<p></p>",
    editorProps: {
      attributes: {
        class: "outline-none min-h-[280px] prose prose-sm max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
    },
  });

  useEffect(() => {
    const loadOrCreateEntry = async () => {
      try {
        // If ID is provided, load existing entry
        if (existingEntryId) {
          const { data: existingEntry, error } = await supabase
            .from("journal_entries")
            .select("*")
            .eq("id", existingEntryId)
            .maybeSingle();

          if (error) throw error;

          if (existingEntry) {
            setEntryId(existingEntry.id);
            setTitle(existingEntry.title);
            editor?.commands.setContent(existingEntry.content);
            setDateString(new Date(existingEntry.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }));
            setIsLoading(false);
            return;
          }
        }

        // Create new entry if no ID or entry not found
        const { data: newEntry, error } = await supabase
          .from("journal_entries")
          .insert({
            session_id: null,
            title: "UNTITLED",
            content: "<p></p>",
          })
          .select()
          .single();

        if (error) throw error;

        setEntryId(newEntry.id);
        setTitle(newEntry.title);
        setDateString(new Date(newEntry.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }));
      } catch (error) {
        console.error("Error loading/creating entry:", error);
        toast.error("Failed to load journal entry");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrCreateEntry();
  }, [existingEntryId, editor]);

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

      toast.success("Entry saved successfully");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save entry");
    } finally {
      setIsSaving(false);
    }
  };

  const setLink = () => {
    const url = window.prompt("Enter URL");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-vt323 text-terminal-text text-lg">
          Loading<span className="blink-text">...</span>
        </div>
      </div>
    );
  }

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
                NEW ENTRY
              </span>
            </div>
            <span className="font-vt323 text-xs text-terminal-dim">{dateString}</span>
          </div>

          {/* Title Input */}
          <div className="p-4 border-b border-terminal-border bg-terminal-surface/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-vt323 text-terminal-dim text-sm">▶ TITLE:</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.toUpperCase())}
              placeholder="ENTER TITLE..."
              className="w-full bg-transparent text-terminal-glow terminal-glow-subtle font-vt323 text-xl uppercase tracking-wider outline-none"
            />
          </div>

          {/* Toolbar */}
          <div className="px-4 py-2 flex flex-wrap items-center gap-2 bg-terminal-surface/50 border-b border-terminal-border">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`terminal-btn text-xs ${editor?.isActive("bold") ? "terminal-btn-primary" : ""}`}
            >
              [ B ]
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`terminal-btn text-xs ${editor?.isActive("italic") ? "terminal-btn-primary" : ""}`}
            >
              [ I ]
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`terminal-btn text-xs ${editor?.isActive("underline") ? "terminal-btn-primary" : ""}`}
            >
              [ U ]
            </button>
            
            <span className="text-terminal-border">│</span>
            
            <button onClick={setLink} className="terminal-btn text-xs">
              [ LINK ]
            </button>
            <button
              onClick={() => editor?.chain().focus().unsetLink().run()}
              className="terminal-btn text-xs"
            >
              [ UNLINK ]
            </button>
            
            <span className="text-terminal-border">│</span>
            
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`terminal-btn text-xs ${editor?.isActive("bulletList") ? "terminal-btn-primary" : ""}`}
            >
              [ LIST ]
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`terminal-btn text-xs ${editor?.isActive("orderedList") ? "terminal-btn-primary" : ""}`}
            >
              [ NUM ]
            </button>

            <span className="ml-auto font-vt323 text-xs text-terminal-dim">
              {wordCount} words
            </span>
          </div>

          {/* Editor Content */}
          <div className="p-4 min-h-[280px] bg-terminal-bg/50">
            <EditorContent editor={editor} />
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end px-4 py-3 bg-terminal-surface border-t border-terminal-border">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="terminal-btn-primary terminal-btn"
            >
              {isSaving ? "[ SAVING... ]" : "[ SAVE ]"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewEntry;
