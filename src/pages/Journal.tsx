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
        class: "font-ibm text-chat-text text-sm leading-6 outline-none min-h-[304px] prose prose-sm max-w-none",
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
        <div className="font-vt323 text-chat-text text-lg">
          Loading entry...
        </div>
      </div>
    );
  }

  return (
    <div className="journal-gradient min-h-screen flex flex-col items-center pt-20 sm:pt-[100px] md:pt-[150px] pb-20 sm:pb-[100px] md:pb-[168px] px-4 gap-[50px] sm:gap-[75px] md:gap-[100px]">
      {/* Journal Window - Matches Chat UI structure */}
      <div className="w-full max-w-[550px] retro-window">
        {/* Title Bar - Same as Chat */}
        <div className="h-6 flex items-center px-3 bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] rounded-t-sm">
          {/* Window Controls - Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>
          {/* Title */}
          <div className="flex-1 text-center">
            <span className="font-vt323 text-sm text-gray-300 tracking-wider">
              JOURNAL ENTRY
            </span>
          </div>
          {/* Date - Styled like Chat's "ONLINE" */}
          <div className="flex items-center gap-1.5">
            <span className="font-ibm text-xs text-gray-400">{dateString}</span>
          </div>
        </div>

        {/* Content Area - Light mode version */}
        <div className="bg-chat-container border-x border-chat-border">
          {/* Header with Title */}
          <div className="border-b border-chat-border">
            <div className="px-4 py-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
                className="w-full font-vt323 text-xl text-chat-text bg-transparent border-none outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Toolbar - Retro button style matching Chat */}
          <div className="px-3 py-2 flex flex-wrap items-center gap-1 bg-chat-container border-b border-chat-border">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`w-8 h-8 flex items-center justify-center rounded-sm border transition-all ${
                editor?.isActive("bold")
                  ? "bg-gray-700 text-gray-100 border-gray-600"
                  : "bg-gray-100 text-chat-text border-chat-border hover:bg-gray-200"
              } retro-button`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`w-8 h-8 flex items-center justify-center rounded-sm border transition-all ${
                editor?.isActive("italic")
                  ? "bg-gray-700 text-gray-100 border-gray-600"
                  : "bg-gray-100 text-chat-text border-chat-border hover:bg-gray-200"
              } retro-button`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`w-8 h-8 flex items-center justify-center rounded-sm border transition-all ${
                editor?.isActive("underline")
                  ? "bg-gray-700 text-gray-100 border-gray-600"
                  : "bg-gray-100 text-chat-text border-chat-border hover:bg-gray-200"
              } retro-button`}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-chat-border mx-1" />
            
            <button
              onClick={setLink}
              className="w-8 h-8 flex items-center justify-center rounded-sm border bg-gray-100 text-chat-text border-chat-border hover:bg-gray-200 retro-button"
              title="Add Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().unsetLink().run()}
              className="w-8 h-8 flex items-center justify-center rounded-sm border bg-gray-100 text-chat-text border-chat-border hover:bg-gray-200 retro-button"
              title="Remove Link"
            >
              <Link2Off className="w-4 h-4 opacity-60" />
            </button>
            
            <div className="w-px h-6 bg-chat-border mx-1" />
            
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`w-8 h-8 flex items-center justify-center rounded-sm border transition-all ${
                editor?.isActive("bulletList")
                  ? "bg-gray-700 text-gray-100 border-gray-600"
                  : "bg-gray-100 text-chat-text border-chat-border hover:bg-gray-200"
              } retro-button`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`w-8 h-8 flex items-center justify-center rounded-sm border transition-all ${
                editor?.isActive("orderedList")
                  ? "bg-gray-700 text-gray-100 border-gray-600"
                  : "bg-gray-100 text-chat-text border-chat-border hover:bg-gray-200"
              } retro-button`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Editor Content */}
          <div className="px-4 py-4 min-h-[280px] bg-chat-container">
            <EditorContent editor={editor} />
          </div>

          {/* Status Bar - Matches Chat structure */}
          <div className="h-6 px-3 flex items-center justify-between bg-gray-100 border-t border-chat-border">
            <div className="flex items-center gap-3">
              <span className="font-ibm text-xs text-gray-500">Page 1</span>
              <span className="font-ibm text-xs text-gray-500">{wordCount} words</span>
            </div>
            {lastSaved && (
              <span className="font-ibm text-xs text-gray-400">Saved at {lastSaved}</span>
            )}
          </div>
        </div>

        {/* Bottom Action Bar - Matches Chat input area */}
        <div className="h-9 flex items-stretch bg-gradient-to-b from-[#4a4a4a] to-[#3a3a3a] rounded-b-sm border-t border-gray-600">
          {/* Spacer - Like input field area */}
          <div className="flex-1 m-1 mr-0 retro-inset bg-chat-container rounded-sm" />
          
          {/* Chat Button */}
          <button
            onClick={handleNavigateToChat}
            className="w-10 m-1 ml-1 flex items-center justify-center bg-gray-200 border border-gray-400 rounded-sm retro-button hover:bg-gray-100 transition-colors"
            title="Return to chat"
          >
            <MessageCircle className="w-4 h-4 text-chat-text" />
          </button>
          
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-10 m-1 ml-0 flex items-center justify-center bg-gray-200 border border-gray-400 rounded-sm retro-button hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Save entry"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M14.25 15.75H3.75C3.33579 15.75 3 15.4142 3 15V3C3 2.58579 3.33579 2.25 3.75 2.25H10.5L15 6.75V15C15 15.4142 14.6642 15.75 14.25 15.75Z" stroke="#363636" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15.75V10.5H6V15.75" stroke="#363636" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 2.25V6.75H10.5" stroke="#363636" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Journal;