import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Link2Off,
  List,
  ListOrdered,
  MessageCircle,
} from "lucide-react";

const Journal = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [title, setTitle] = useState("Untitled");
  const [dateString, setDateString] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Underline,
    ],
    content: "<p>Loading...</p>",
    editorProps: {
      attributes: {
        class: "font-typewriter text-paper-text text-base leading-8 outline-none min-h-[304px] prose prose-sm max-w-none paper-lines",
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      setWordCount(words.length);
    },
  });

  useEffect(() => {
    const loadOrCreateEntry = async () => {
      if (!sessionId) return;

      try {
        // Check if entry already exists
        const { data: existingEntry } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("session_id", sessionId)
          .maybeSingle();

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

        // Generate new summary
        const { data: messagesData } = await supabase
          .from("messages")
          .select("*")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true });

        if (!messagesData || messagesData.length === 0) {
          toast.error("No conversation found");
          setIsLoading(false);
          return;
        }

        // Call summary generation function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-summary`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              messages: messagesData.map((m) => ({
                role: m.role,
                content: m.content,
              })),
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to generate summary");
        }

        const { summary } = await response.json();

        // Create journal entry
        const { data: newEntry, error } = await supabase
          .from("journal_entries")
          .insert({
            session_id: sessionId,
            title: "Untitled",
            content: summary,
          })
          .select()
          .single();

        if (error) throw error;

        setEntryId(newEntry.id);
        setTitle(newEntry.title);
        editor?.commands.setContent(summary);
        setDateString(new Date(newEntry.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }));
      } catch (error) {
        console.error("Error loading entry:", error);
        toast.error("Failed to load journal entry");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrCreateEntry();
  }, [sessionId, editor]);

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

      const now = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      setLastSaved(now);
      toast.success("Journal entry saved");
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

  const handleNavigateToChat = () => {
    navigate("/chat");
  };

  if (isLoading) {
    return (
      <div className="journal-gradient min-h-screen flex items-center justify-center">
        <div className="font-typewriter text-paper-text text-lg">
          Loading manuscript...
        </div>
      </div>
    );
  }

  return (
    <div className="journal-gradient min-h-screen flex flex-col items-center pt-20 sm:pt-[100px] md:pt-[150px] pb-20 sm:pb-[100px] md:pb-[168px] px-4 gap-[50px] sm:gap-[75px] md:gap-[100px]">
      {/* Paper Window */}
      <div className="w-full max-w-[640px] retro-window paper-edge">
        {/* Title Bar - Typewriter style */}
        <div className="h-10 flex items-center px-4 bg-gradient-to-b from-[#e8dcc8] to-[#d4c4a8] border-b-2 border-[#a89070]">
          {/* Window Controls */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#8b7355] border border-[#6d5a45] retro-button" />
            <div className="w-3 h-3 rounded-sm bg-[#8b7355] border border-[#6d5a45] retro-button" />
          </div>
          {/* Title */}
          <div className="flex-1 text-center">
            <span className="font-typewriter text-base text-[#3d3225] tracking-wide">
              JOURNAL ENTRY
            </span>
          </div>
          {/* Date Stamp */}
          <div className="px-2 py-0.5 bg-[#fdf6e3] border border-[#a89070] rounded-sm">
            <span className="font-ibm text-xs text-[#6d5a45]">{dateString}</span>
          </div>
        </div>

        {/* Paper Content Area */}
        <div className="relative paper-bg">
          {/* Paper Texture Overlay */}
          <div className="absolute inset-0 paper-texture" />

          {/* Header with Title */}
          <div className="relative z-10 border-b-2 border-dashed border-paper-lines">
            <div className="px-6 py-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
                className="w-full font-typewriter text-2xl text-paper-text bg-transparent border-none outline-none placeholder:text-paper-lines"
              />
            </div>
          </div>

          {/* Toolbar - Typewriter key style */}
          <div className="relative z-10 px-4 py-2 flex flex-wrap items-center gap-1 bg-paper-surface border-b border-paper-lines">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`typewriter-toolbar-btn ${editor?.isActive("bold") ? "active" : ""}`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`typewriter-toolbar-btn ${editor?.isActive("italic") ? "active" : ""}`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`typewriter-toolbar-btn ${editor?.isActive("underline") ? "active" : ""}`}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-paper-lines mx-1" />
            
            <button
              onClick={setLink}
              className="typewriter-toolbar-btn"
              title="Add Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().unsetLink().run()}
              className="typewriter-toolbar-btn"
              title="Remove Link"
            >
              <Link2Off className="w-4 h-4 opacity-60" />
            </button>
            
            <div className="w-px h-6 bg-paper-lines mx-1" />
            
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`typewriter-toolbar-btn ${editor?.isActive("bulletList") ? "active" : ""}`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`typewriter-toolbar-btn ${editor?.isActive("orderedList") ? "active" : ""}`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Editor Content */}
          <div className="relative z-10 px-6 py-6 min-h-[320px]">
            <EditorContent editor={editor} />
          </div>

          {/* Status Bar */}
          <div className="relative z-10 h-7 px-4 flex items-center justify-between bg-paper-surface border-t border-paper-lines">
            <div className="flex items-center gap-4">
              <span className="font-ibm text-xs text-[#8b7355]">Page 1</span>
              <span className="font-ibm text-xs text-[#8b7355]">{wordCount} words</span>
            </div>
            {lastSaved && (
              <span className="font-ibm text-xs text-[#a89070]">Saved at {lastSaved}</span>
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-stretch bg-gradient-to-b from-[#d4c4a8] to-[#c4b498] border-t-2 border-[#a89070]">
          {/* Spacer */}
          <div className="flex-1 retro-inset bg-paper-surface" />
          
          {/* Chat Button */}
          <button
            onClick={handleNavigateToChat}
            className="w-12 flex items-center justify-center bg-paper-surface border-l border-[#a89070] retro-button hover:bg-paper-bg transition-colors"
            title="Return to chat"
          >
            <MessageCircle className="w-5 h-5 text-[#6d5a45]" />
          </button>
          
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-12 flex items-center justify-center bg-paper-surface border-l border-[#a89070] retro-button hover:bg-paper-bg transition-colors"
            title="Save entry"
          >
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path d="M14.25 15.75H3.75C3.33579 15.75 3 15.4142 3 15V3C3 2.58579 3.33579 2.25 3.75 2.25H10.5L15 6.75V15C15 15.4142 14.6642 15.75 14.25 15.75Z" stroke="#6d5a45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15.75V10.5H6V15.75" stroke="#6d5a45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 2.25V6.75H10.5" stroke="#6d5a45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Journal;