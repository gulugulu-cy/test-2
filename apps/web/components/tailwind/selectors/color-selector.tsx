import { Check, ChevronDown } from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";
import { IoIosColorPalette } from "react-icons/io";

import { Button } from "@/components/tailwind/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/tailwind/ui/popover";
export interface BubbleColorMenuItem {
  name: string;
  color: string;
}

const TEXT_COLORS: BubbleColorMenuItem[] = [
  {
    name: "Default",
    color: "#000000",
  },
  {
    name: "Red",
    color: "#E00000",
  },
  {
    name: "Blue",
    color: "#2563EB",
  },
  {
    name: "Green",
    color: "#008A00",
  },
  {
    name: "Yellow",
    color: "#EAB308",
  },
  {
    name: "Purple",
    color: "#9333EA",
  },
  {
    name: "Gray",
    color: "#A8A29E",
  },
  {
    name: "Orange",
    color: "#FFA500",
  },
];

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
  {
    name: "Default",
    color: "#ffffff",
  },
  {
    name: "Red",
    color: "#ffc9c9",
  },
  {
    name: "Blue",
    color: "#a5d8ff",
  },
  {
    name: "Green",
    color: "#b2f2bb",
  },
  {
    name: "Yellow",
    color: "#ffec99",
  },
  {
    name: "Purple",
    color: "#d0bfff",
  },
  {
    name: "Gray",
    color: "#e9ecef",
  },
  {
    name: "Orange",
    color: "#ffd8a8",
  },
];

interface ColorSelectorProps {
  open: boolean;
  language: 'chinese' | 'english' | 'japanese';
  onOpenChange: (open: boolean) => void;
}

export const ColorSelector = ({ language, open, onOpenChange }: ColorSelectorProps) => {
  const { editor } = useEditor();

  if (!editor) return null;
  const activeColorItem = TEXT_COLORS.find(({ color }) => editor.isActive("textStyle", { color }));

  const activeHighlightItem = HIGHLIGHT_COLORS.find(({ color }) => editor.isActive("highlight", { color }));

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button size="sm" className="gap-2 rounded-none" variant="ghost">
          <IoIosColorPalette
            className="text-lg"
            style={{
              color: activeColorItem?.color,
              backgroundColor: activeHighlightItem?.color,
            }}
          />
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        sideOffset={5}
        className="my-1 flex max-h-80 w-full flex-col overflow-hidden overflow-y-auto rounded border p-1 shadow-xl "
        align="start"
      >
        <div className="flex flex-col">
          <div className="my-1 px-2 text-sm font-semibold text-muted-foreground">{{ chinese: '文本', english: 'Text' }[language]}</div>
          <div className="flex items-center justify-between">
            {TEXT_COLORS.map(({ name, color }) => (
              <EditorBubbleItem
                key={name}
                onSelect={() => {
                  // editor.commands.unsetColor();
                  // name !== "Default" &&
                  editor
                    .chain()
                    .focus()
                    .setColor(color || "")
                    .run();
                  onOpenChange(false);
                }}
                className="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent"
              >
                <div className={`w-5 h-5 rounded-full`} style={{ backgroundColor: color }}></div>
              </EditorBubbleItem>
            ))}
          </div>
        </div>
        <div>
          <div className="my-1 px-2 text-sm font-semibold text-muted-foreground">{{ chinese: '背景', english: 'Background' }[language]}</div>
          <div className="flex items-center justify-between">
            {HIGHLIGHT_COLORS.map(({ name, color }) => (
              <EditorBubbleItem
                key={name}
                onSelect={() => {
                  editor.commands.unsetHighlight();
                  name !== "Default" && editor.chain().focus().setHighlight({ color }).run();
                  onOpenChange(false);
                }}
                className="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent"
              >
                <div className={`w-5 h-5 rounded-full ${color === '#ffffff' && 'border'}`} style={{ backgroundColor: color }}></div>
                {editor.isActive("highlight", { color }) && <Check className="h-4 w-4" />}
              </EditorBubbleItem>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
