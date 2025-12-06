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
  Save,
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
        class: "outline-none min-h-[304px] prose prose-sm max-w-none font-ibm text-sm leading-6",
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
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <div className="font-ibm text-[#363636] text-sm">
          Loading entry...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 sm:pt-[100px] md:pt-[150px] pb-20 sm:pb-[100px] md:pb-[168px] px-4 gap-[50px] sm:gap-[75px] md:gap-[100px] bg-[#F7F7F7]">
      {/* Journal Window */}
      <div className="w-full max-w-[600px] shadow-[0px_-2px_4px_rgba(80,80,80,0.25)]">
        {/* Header - 20px height */}
        <div className="h-5 flex items-center justify-center bg-white border border-[#374151] rounded-t-sm">
          <span className="font-rasa text-sm text-[#363636]">
            Edit Entry
          </span>
        </div>

        {/* Content Area */}
        <div className="bg-[#FBFBFB] border-x border-[#374151]">
          {/* Title Input */}
          <div className="border-b border-[#374151]">
            <div className="px-4 py-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
                className="w-full font-rasa text-lg text-[#363636] bg-transparent border-none outline-none placeholder:text-gray-400"
              />
              <div className="font-ibm text-xs text-gray-400 mt-1">{dateString}</div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="px-3 py-2 flex flex-wrap items-center gap-1 bg-white border-b border-[#374151]">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`w-8 h-8 flex items-center justify-center rounded-sm border transition-all ${
                editor?.isActive("bold")
                  ? "bg-[#363636] text-white border-[#374151]"
                  : "bg-white text-[#363636] border-[#374151] hover:bg-gray-100"
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`w-8 h-8 flex items-center justify-center rounded-sm border transition-all ${
                editor?.isActive("italic")
                  ? "bg-[#363636] text-white border-[#374151]"
                  : "bg-white text-[#363636] border-[#374151] hover:bg-gray-100"
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`w-8 h-8 flex items-center justify-center rounded-sm border transition-all ${
                editor?.isActive("underline")
                  ? "bg-[#363636] text-white border-[#374151]"
                  : "bg-white text-[#363636] border-[#374151] hover:bg-gray-100"
              }`}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-[#374151] mx-1" />
            
            <button
              onClick={setLink}
              className="w-8 h-8 flex items-center justify-center rounded-sm border bg-white text-[#363636] border-[#374151] hover:bg-gray-100"
              title="Add Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().unsetLink().run()}
              className="w-8 h-8 flex items-center justify-center rounded-sm border bg-white text-[#363636] border-[#374151] hover:bg-gray-100"
              title="Remove Link"
            >
              <Link2Off className="w-4 h-4 opacity-60" />
            </button>
            
            <div className="w-px h-6 bg-[#374151] mx-1" />
            
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`w-8 h-8 flex items-center justify-center rounded-sm border transition-all ${
                editor?.isActive("bulletList")
                  ? "bg-[#363636] text-white border-[#374151]"
                  : "bg-white text-[#363636] border-[#374151] hover:bg-gray-100"
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`w-8 h-8 flex items-center justify-center rounded-sm border transition-all ${
                editor?.isActive("orderedList")
                  ? "bg-[#363636] text-white border-[#374151]"
                  : "bg-white text-[#363636] border-[#374151] hover:bg-gray-100"
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            {/* Word count on right */}
            <div className="ml-auto">
              <span className="font-ibm text-xs text-gray-400">{wordCount} words</span>
            </div>
          </div>

          {/* Editor Content */}
          <div className="px-4 py-4 min-h-[280px] bg-[#FBFBFB]">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Bottom Input Area - 35px height */}
        <div className="h-[35px] flex items-stretch border border-[#374151] border-t-0 rounded-b-sm shadow-[0px_-2px_4px_rgba(80,80,80,0.25)]">
          {/* Empty white container */}
          <div className="flex-1 bg-white" />
          
          {/* Chat Button - 38px width */}
          <button
            onClick={handleNavigateToChat}
            className="w-[38px] flex items-center justify-center bg-white border-l border-[#374151] hover:bg-gray-50 transition-colors"
            title="Return to chat"
          >
            <MessageCircle className="w-4 h-4 text-[#363636]" />
          </button>
          
          {/* Save Button - 38px width */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-[38px] flex items-center justify-center bg-white border-l border-[#374151] hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Save entry"
          >
            <Save className="w-4 h-4 text-[#363636]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Journal;
