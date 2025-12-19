import { useState } from "react";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  disabled?: boolean;
}

const TagInput = ({ tags, onTagsChange, disabled }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().toUpperCase();
      if (!tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="terminal-box p-3">
      <div className="flex items-center gap-2 text-terminal-dim font-vt323 text-sm mb-2">
        <span>▶ TAGS:</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="terminal-tag group cursor-pointer"
            onClick={() => !disabled && removeTag(tag)}
          >
            <span className="text-terminal-glow">#</span>
            {tag}
            {!disabled && (
              <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-terminal-dim">
                ×
              </span>
            )}
          </span>
        ))}
        {!disabled && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? "ADD TAG..." : ""}
            className="flex-1 min-w-[80px] bg-transparent text-terminal-text font-vt323 text-sm uppercase tracking-wider outline-none placeholder:text-terminal-muted"
          />
        )}
      </div>
    </div>
  );
};

export default TagInput;
