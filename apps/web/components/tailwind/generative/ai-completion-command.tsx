import { CommandGroup, CommandItem, CommandSeparator } from "../ui/command";
import { useEditor } from "novel";
import { Check, TextQuote, TrashIcon } from "lucide-react";
import { Button } from "../ui/button";
import { IoIosRefresh } from "react-icons/io";
import { LuReplace } from "react-icons/lu";
import { TbRowInsertBottom } from "react-icons/tb";
import { FaRegCopy } from "react-icons/fa";

const AICompletionCommands = ({
  completion,
  onDiscard,
}: {
  completion: string;
  onDiscard: () => void;
}) => {
  const { editor } = useEditor();

  return (
    <div className="flex justify-between ml-2 mt-5">
      <Button size="sm" className="text-sm"><IoIosRefresh className="mr-2" />重新生成</Button>
      <div>
        <Button size="sm" className="text-sm mr-2"><LuReplace className="mr-2" />替换</Button>
        <Button size="sm" className="text-sm mr-2"><TbRowInsertBottom className="mr-2" />插入</Button>
        <Button size="sm" className="text-sm mr-2"><FaRegCopy className="mr-2" />复制</Button>
      </div>
    </div>
  );
};

export default AICompletionCommands;
