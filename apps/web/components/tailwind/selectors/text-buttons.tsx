import { Button } from "@/components/tailwind/ui/button";
import { cn } from "@/lib/utils";
import { BoldIcon, CodeIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from "lucide-react";
import { FaCode } from "react-icons/fa";
import { EditorBubbleItem, useEditor } from "novel";
import type { SelectorItem } from "./node-selector";
import { LinkSelector } from "./link-selector";
import { Fragment, useState } from "react";
import { FaAlignLeft } from "react-icons/fa";
import { FaAlignCenter } from "react-icons/fa";
import { FaAlignRight } from "react-icons/fa";
import { Separator } from "../ui/separator";

export const TextButtons = () => {
  const { editor } = useEditor();
  if (!editor) return null;
  const items: SelectorItem[] = [
    {
      name: "bold",
      isActive: (editor) => editor.isActive("bold"),
      command: (editor) => editor.chain().focus().toggleBold().run(),
      icon: BoldIcon,
    },
    {
      name: "italic",
      isActive: (editor) => editor.isActive("italic"),
      command: (editor) => editor.chain().focus().toggleItalic().run(),
      icon: ItalicIcon,
    },
    {
      name: "underline",
      isActive: (editor) => editor.isActive("underline"),
      command: (editor) => editor.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
    },
    {
      name: "link",
      isActive: (editor) => false,
      command: (editor) => { },
      icon: UnderlineIcon,
    },
    {
      name: "strike",
      isActive: (editor) => editor.isActive("strike"),
      command: (editor) => editor.chain().focus().toggleStrike().run(),
      icon: StrikethroughIcon,
    },
    // {
    //   name: "code",
    //   isActive: (editor) => editor.isActive("code"),
    //   command: (editor) => editor.chain().focus().toggleCode().run(),
    //   icon: CodeIcon,
    // },
    {
      name: "codeBlock",
      isActive: (editor) => editor.isActive("codeBlock"),
      command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
      icon: FaCode,
    },
    {
      name: "alignLeft",
      isActive: (editor) => editor.isActive({ textAlign: 'left' }),
      command: (editor) => editor.chain().focus().setTextAlign('left').run(),
      icon: FaAlignLeft,
    },
    {
      name: "alignCenter",
      isActive: (editor) => editor.isActive({ textAlign: 'center' }),
      command: (editor) => editor.chain().focus().setTextAlign('center').run(),
      icon: FaAlignCenter,
    },
    {
      name: "alignRight",
      isActive: (editor) => editor.isActive({ textAlign: 'right' }),
      command: (editor) => editor.chain().focus().setTextAlign('right').run(),
      icon: FaAlignRight,
    },
  ];
  const [openLink, setOpenLink] = useState(false);
  return (
    <div className="flex w-full h-full">
      {items.map((item) => (
        <Fragment key={item.name}>
          {item.name === 'alignLeft' && (<Separator orientation="vertical" className="h-auto" />)}
          <EditorBubbleItem
            onSelect={(editor) => {
              item.command(editor);
            }}
          >
            {
              item.name === 'link' ?
                <LinkSelector open={openLink} onOpenChange={setOpenLink} />
                : <Button size="sm" className="rounded-none" variant="ghost">
                  <item.icon
                    className={cn("h-4 w-4", {
                      "text-blue-500": item.isActive(editor),
                    })}
                  />
                </Button>
            }
          </EditorBubbleItem>
        </Fragment>
      ))}
    </div>
  );
};
