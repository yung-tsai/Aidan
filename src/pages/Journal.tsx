import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Link2Off,
  List,
  ListOrdered,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";

const Journal = () => {
  const { sessionId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [title, setTitle] = useState("Untitled");
  const [dateString, setDateString] = useState("");

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
        class: "font-mono text-xs text-text-secondary leading-4 outline-none min-h-[304px] prose prose-sm max-w-none",
      },
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

  if (isLoading) {
    return (
      <div className="journal-gradient min-h-screen flex items-center justify-center">
        <p className="font-mono text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="journal-gradient min-h-screen flex flex-col items-center pt-[150px] pb-[168px] px-[420px] gap-[100px]">
      {/* Journal Container */}
      <div className="w-[600px] bg-chat-bg border border-foreground rounded-lg flex flex-col">
        {/* Inner Wrapper */}
        <div className="w-[600px] flex flex-col gap-5">
          {/* Header */}
          <div className="w-[600px] h-[71px] flex flex-col">
            {/* Header Info */}
            <div className="w-[600px] h-[41px] border-b border-text-primary flex flex-row justify-between">
              {/* Title */}
              <div className="w-[300px] h-[41px] pt-[15px] pb-2.5 pl-5">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="font-mono font-medium text-base text-text-primary bg-transparent border-none outline-none w-full"
                />
              </div>
              {/* Date */}
              <div className="w-[300px] h-[41px] pt-[15px] pb-2.5 pr-5 text-right">
                <span className="font-mono font-medium text-xs text-text-muted">
                  {dateString}
                </span>
              </div>
            </div>

            {/* Command Bar */}
            <div className="w-[598px] h-[30px] px-[11px] py-[3px] gap-2 bg-toolbar-bg border-b border-text-primary flex flex-row items-center">
              <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-200 rounded font-['Segoe_UI'] text-xs">
                Format <ChevronDown className="w-3 h-3" />
              </button>
              <div className="w-px h-[30px] bg-text-divider" />
              <button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-1 hover:bg-gray-200 rounded ${
                  editor?.isActive("bold") ? "bg-gray-300" : ""
                }`}
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-1 hover:bg-gray-200 rounded ${
                  editor?.isActive("italic") ? "bg-gray-300" : ""
                }`}
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className={`p-1 hover:bg-gray-200 rounded ${
                  editor?.isActive("underline") ? "bg-gray-300" : ""
                }`}
              >
                <UnderlineIcon className="w-4 h-4" />
              </button>
              <div className="w-px h-[30px] bg-text-divider" />
              <button
                onClick={setLink}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor?.chain().focus().unsetLink().run()}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Link2Off className="w-4 h-4 text-text-icon" />
              </button>
              <div className="w-px h-[30px] bg-text-divider" />
              <button
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`p-1 hover:bg-gray-200 rounded ${
                  editor?.isActive("bulletList") ? "bg-gray-300" : ""
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`p-1 hover:bg-gray-200 rounded ${
                  editor?.isActive("orderedList") ? "bg-gray-300" : ""
                }`}
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <div className="w-px h-[30px] bg-text-divider" />
              <button className="p-1 hover:bg-gray-200 rounded">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Container */}
          <div className="w-[599px] px-5 flex flex-col items-center gap-[15px] pb-5">
            <div className="w-[560px]">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isSaving} className="font-mono text-sm">
        {isSaving ? "Saving..." : "Save Entry"}
      </Button>
    </div>
  );
};

export default Journal;