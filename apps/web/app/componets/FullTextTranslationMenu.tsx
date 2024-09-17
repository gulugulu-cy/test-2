import { BsTranslate } from "react-icons/bs";
import { NO_CONTENT_TRANSLATE, type Language } from "@/lib/language";
import { IoIosArrowForward } from "react-icons/io";
import { Button } from "@/components/tailwind/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/tailwind/ui/popover";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setGlobalState } from "../store/globalSlice";
import { getLocalStorage } from "@/lib/utils";
import { toast } from "@/components/tailwind/ui/use-toast";
import { useState } from "react";

interface IProps {
  language: 'chinese' | 'english' | 'japanese',
}
export function FullTextTranslationMenu(props: IProps) {
  const { language } = props;
  const dispatch = useAppDispatch()
  const global = useAppSelector(setGlobalState)
  const [open, setOpen] = useState(false);

  const languageMenuList: Array<Language> = [
    { chinese: '中文', english: 'Chinese', japanese: '中国語' },
    { chinese: 'English', english: 'English', japanese: 'English' },
    { chinese: '日本語', english: 'Japanese', japanese: '日本語' },
    { chinese: 'Deutsch', english: 'German', japanese: 'Deutsch' },
    { chinese: 'Français', english: 'French', japanese: 'Français' },
    { chinese: '한국어', english: 'Korean', japanese: '한국어' },
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild >
        <Button variant="ghost" className="hover:text-[#8e47f0] w-full justify-between flex" size="sm">
          <div className="flex items-center">
            <BsTranslate className="mr-2" />
            {{ chinese: '全文翻译', english: 'Full text translation', japanese: '全文翻訳' }[language]}
          </div>
          <IoIosArrowForward />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-1 z-[9999]" align='start' side='right'>
        <div>
          {
            languageMenuList.map((item) => (
              <Button
                variant="ghost"
                key={item.english}
                className="hover:text-[#8e47f0] w-full flex justify-between"
                size="sm"
                onClick={() => {
                  const content = getLocalStorage('markdown')
                  if (!content) {
                    toast({
                      duration: 2000,
                      description: (NO_CONTENT_TRANSLATE[language])
                    })
                    return;
                  }
                  setOpen(false);
                  dispatch(setGlobalState({ translateDualScreen: true, rewriteDualScreen: false, translateDualLanguage: item.english }))
                }}
              >
                <span>{item[language]}</span>
              </Button>
            ))
          }
        </div>
      </PopoverContent>
    </Popover>
  )
}
