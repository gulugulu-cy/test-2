import { IoMdCut } from "react-icons/io";
import { FaRegCopy } from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";
import { EditorBubbleItem, useEditor } from "novel";
import { Button } from "@/components/tailwind/ui/button";

export const ContentAction = () => {
  const { editor } = useEditor();
  if (!editor) return null;

  const handleCopy = async () => {
    if (editor) {
      document.execCommand('copy');
    }
  };

  const handleCut = async () => {
    if (editor) {
      document.execCommand('cut');
    }
  };

  const handleDelete = () => {
    if (editor) {
      editor.chain().focus().deleteRange(editor.state.selection).run();
    }
  };

  return (
    <div className="flex">
      <EditorBubbleItem>
        <Button onClick={handleCopy} size="sm" className="rounded-none" variant="ghost">
          <FaRegCopy />
        </Button>
      </EditorBubbleItem>
      <EditorBubbleItem>
        <Button onClick={handleCut} size="sm" className="rounded-none" variant="ghost">
          <IoMdCut />
        </Button>
      </EditorBubbleItem>
      <EditorBubbleItem>
        <Button onClick={handleDelete} size="sm" className="rounded-none" variant="ghost">
          <FaDeleteLeft />
        </Button>
      </EditorBubbleItem>
    </div>
  );
};
