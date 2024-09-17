import { IoLanguage } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectGlobal, setGlobalState } from "../store/globalSlice";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/tailwind/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/tailwind/ui/radio-group";
import { HEADER_TITLE } from "@/lib/language";
import { Button } from "@/components/tailwind/ui/button";
import { Label } from "@/components/tailwind/ui/label";

export function LanguagePopover() {
  const router = useRouter();
  const dispatch = useAppDispatch()
  const global = useAppSelector(selectGlobal)
  return (
    <Popover>
      <PopoverTrigger>
        <IoLanguage className="text-[20px] cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent className="w-full p-1">
        <RadioGroup
          className='gap-0'
          defaultValue={global.language}
          value={global.language}
          onValueChange={(value: "english" | "chinese" | "japanese") => {
            localStorage.setItem('lang', value)
            dispatch(setGlobalState({ language: value, renew: !global.renew }))
            document.title = HEADER_TITLE[value]
            const url = window.location.pathname; // 获取当前 URL 路径
            const locale = { "english": 'en', "chinese": 'zh', "japanese": 'ja' };
            const supportedLocales = Object.values(locale); // 提取支持的语言代码
            const newLocale = locale[value];
            // 检查 URL 是否以支持的语言代码开头
            const hasLocale = supportedLocales.some(loc => url.startsWith(`/${loc}`));
            let updatedUrl;
            if (hasLocale) {
              // 使用正则表达式动态替换现有语言代码，仅替换第一个匹配项
              updatedUrl = url.replace(/^\/(en|zh|ja)(\/|$)/, `/${newLocale}$2`);
            } else {
              // 如果 URL 没有语言代码，则在开头添加新的语言代码
              updatedUrl = `/${newLocale}${url}`;
            }
            router.push(updatedUrl)
          }}>
          <Button size='sm' variant="ghost" className="flex justify-start hover:text-[#8e47f0] w-full" >
            <RadioGroupItem className="min-w-[15px] max-h-[15px]" value="chinese" id="r1" />
            <Label className='leading-[2.7] text-left cursor-pointer ml-3 w-full h-full' htmlFor="r1">中文</Label>
          </Button>
          <Button size='sm' variant="ghost" className="flex justify-start hover:text-[#8e47f0] w-full" >
            <RadioGroupItem className="min-w-[15px] max-h-[15px]" value="english" id="r2" />
            <Label className='leading-[2.7] text-left cursor-pointer ml-3 w-full h-full' htmlFor="r2">English</Label>
          </Button>
          <Button size='sm' variant="ghost" className="flex justify-start hover:text-[#8e47f0] w-full" >
            <RadioGroupItem className="min-w-[15px] max-h-[15px]" value="japanese" id="r3" />
            <Label className='leading-[2.7] text-left cursor-pointer ml-3 w-full h-full' htmlFor="r3">日本語</Label>
          </Button>
        </RadioGroup>
      </PopoverContent>
    </Popover>
  )
}
