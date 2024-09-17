import { ArrowDownWideNarrow, CheckCheck, RefreshCcwDot, StepForward, WrapText } from "lucide-react";
import { useEditor } from "novel";
import { getPrevText } from "novel/utils";
import { CommandGroup, CommandItem, CommandSeparator } from "../ui/command";
import { AI_TYPE, type Language } from "@/lib/language";
import { useEffect, useState } from "react";
import { RiCameraLensLine } from "react-icons/ri";
import { BsTranslate } from "react-icons/bs";
import { VscDebugContinue } from "react-icons/vsc";
import { RiExpandWidthFill } from "react-icons/ri";
import { BsArrowsCollapseVertical } from "react-icons/bs";
import { FiRefreshCw } from "react-icons/fi";
import { RiSpeakLine } from "react-icons/ri";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { IoIosArrowForward } from "react-icons/io";
import { setGlobalState } from "@/app/store/globalSlice";
import { useAppSelector } from "@/app/store/hooks";

const options = [
  // 总结
  {
    value: "summary",
    label: "Summary",
    icon: <RiCameraLensLine className="h-4 w-4 text-purple-500" />,
  },
  // 翻译
  {
    value: "translate",
    label: "Translate",
    icon: <BsTranslate className="h-4 w-4 text-purple-500" />,
  },
  // 续写
  {
    value: "continued writing",
    label: "Continued writing",
    icon: <VscDebugContinue className="h-4 w-4 text-purple-500" />,
  },
  // 扩写
  {
    value: "expand written article",
    label: "Expand written article",
    icon: <RiExpandWidthFill className="h-4 w-4 text-purple-500" />,
  },
  // 缩写
  {
    value: "abbreviation",
    label: "Abbreviation",
    icon: <BsArrowsCollapseVertical className="h-4 w-4 text-purple-500" />,
  },
  // 改写
  {
    value: "rewrite",
    label: "Rewrite",
    icon: <FiRefreshCw className="h-4 w-4 text-purple-500" />,
  },
  // 朗读
  {
    value: "reading aloud",
    label: "Reading aloud",
    icon: <RiSpeakLine className="h-4 w-4 text-purple-500" />,
  },
];

interface AISelectorCommandsProps {
  onSelect: (value: string, option: { type: string, language?: string }) => void;
}

// const languageMenuList: Array<Language> = [
//   { chinese: '中文', english: 'Chinese' },
//   { chinese: 'English', english: 'English' },
//   { chinese: '日本語', english: 'Japanese' },
//   { chinese: 'Deutsch', english: 'German' },
//   { chinese: 'Français', english: 'French' },
//   { chinese: '한국어', english: 'Korean' },
// ]

const languageMenuList: Array<Language & { language: string }> = [
  { chinese: '中文', english: 'Chinese', japanese: '中国語', language: 'cmn' },
  { chinese: '英语', english: 'English', japanese: '英語', language: 'eng' },
  { chinese: '日语', english: 'Japanese', japanese: '日本語', language: 'jpn' },
  { chinese: '德语', english: 'German', japanese: 'ドイツ語', language: 'deu' },
  { chinese: '法语', english: 'French', japanese: 'フランス語', language: 'fra' },
  { chinese: '韩语', english: 'Korean', japanese: '韓国語', language: 'kor' },
]


const AISelectorCommands = ({ onSelect }: AISelectorCommandsProps) => {
  const { editor } = useEditor();
  const global = useAppSelector(setGlobalState);

  // const [language, setLanguage] = useState<'chinese' | 'english'>('chinese');

  // 读取当前用户语言
  // useEffect(() => {
  //   const windowLanguage = window.navigator.language
  //   if (windowLanguage.toLocaleLowerCase().indexOf("zh") > -1) {
  //     setLanguage('chinese')
  //   } else {
  //     setLanguage('english')
  //   }
  // }, [])

  const onTranslateSubmenus = (option) => {
    return (
      <Popover key={option.value}>
        <PopoverTrigger className="w-full">
          <CommandItem className="flex gap-2 px-4 w-full" key={option.value} value={option.value} >
            {option?.icon}
            {AI_TYPE[option.label][global.payload.global.language]}
          </CommandItem>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-1 z-[9999]" align="end" side="right">
          <div>
            {
              languageMenuList.map((item) => (
                <Button
                  variant="ghost"
                  key={item.english}
                  className="hover:text-[#8e47f0] w-full flex justify-between"
                  size="sm"
                  onClick={() => {
                    const slice = editor.state.selection.content();
                    const text = editor.storage.markdown.serializer.serialize(slice.content);
                    onSelect(text, { type: option.value, language: item.english });
                  }}
                >
                  <span>{item[global.payload.global.language]}</span>
                </Button>
              ))
            }
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (

    <CommandGroup>
      {options.map((option) => {
        if (option.value === 'translate') {
          return (onTranslateSubmenus(option))
        }
        return (
          <CommandItem
            onSelect={(value) => {
              const slice = editor.state.selection.content();
              const text = editor.storage.markdown.serializer.serialize(slice.content);
              onSelect(text, { type: value });
            }}
            className="flex gap-2 px-4"
            key={option.value}
            value={option.value}
          >
            {option?.icon}
            {AI_TYPE[option.label][global.payload.global.language]}
          </CommandItem>
        )
      })}
    </CommandGroup>
    // <CommandSeparator />
    // <CommandGroup heading="Use AI to do more">
    //   <CommandItem
    //     onSelect={() => {
    //       const pos = editor.state.selection.from;

    //       const text = getPrevText(editor, pos);
    //       onSelect(text, "continue");
    //     }}
    //     value="continue"
    //     className="gap-2 px-4"
    //   >
    //     <StepForward className="h-4 w-4 text-purple-500" />
    //     Continue writing
    //   </CommandItem>
    // </CommandGroup>

  );
};

export default AISelectorCommands;
