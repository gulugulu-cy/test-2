import type { EditorInstance, JSONContent } from "novel";
import { Button } from "./ui/button";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { toast } from "./ui/use-toast";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { addOrUpdateData } from "@/app/api/indexedDB";
import { setGlobalState } from "@/app/store/globalSlice";
import { franc } from 'franc';

const hljs = require('highlight.js');
import { COPY, COPY_CREATED_ERROR, COPY_CREATED_SUCCESSFULLY, COPY_ERROR, COPY_SUCCESSFUL, DUAL_SCREEN_BUTTON, SAVE_SUCCESS_ERROR, SAVE_SUCCESS_MESSAGE, type Language } from "@/lib/language";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { IoIosArrowForward } from "react-icons/io";

interface IProps {
  title: string,
  language: 'chinese' | 'english' | 'japanese',
  editorInstance: EditorInstance | null,
  editorInstanceCopy: EditorInstance | null,
  onRegenerate: (lingo?: string) => void;
}

const languageMenuList: Array<Language & { language: string }> = [
  { chinese: '中文', english: 'Chinese', japanese: '中国語', language: 'cmn' },
  { chinese: '英语', english: 'English', japanese: '英語', language: 'eng' },
  { chinese: '日语', english: 'Japanese', japanese: '日本語', language: 'jpn' },
  { chinese: '德语', english: 'German', japanese: 'ドイツ語', language: 'deu' },
  { chinese: '法语', english: 'French', japanese: 'フランス語', language: 'fra' },
  { chinese: '韩语', english: 'Korean', japanese: '韓国語', language: 'kor' },
]

interface IData {
  id: number;
  title: string
  markdown: string;
  htmlContent: string;
  novelContent: JSONContent;
  createdAt: string;
}
export default function DualScreenButton(props: IProps) {
  const dispatch = useAppDispatch()
  const global = useAppSelector(setGlobalState)
  const { title, language, editorInstanceCopy, editorInstance, onRegenerate } = props;
  const [selectLanguage, setSelectLanguage] = useState('')

  useEffect(() => {
    if (global.payload.global.translateDualLanguage) {
      const { translateDualLanguage } = global.payload.global;
      setSelectLanguage(translateDualLanguage);
    }
  }, [global.payload.global.translateDualLanguage])

  const onHandleCopyResult = () => {
    const data = editorInstanceCopy.storage.markdown.getMarkdown()
    navigator.clipboard.writeText(data)
      .then(() => {
        toast({ duration: 2000, description: COPY_SUCCESSFUL[language] })
      })
      .catch(err => {
        toast({ duration: 2000, description: COPY_ERROR[language] })
      });
  }

  const onOpenRecords = (item: IData) => {
    window.localStorage.setItem("novel-id", `${item.id}`);
    window.localStorage.setItem("novel-title", item.title);
    window.localStorage.setItem("createdAt", item.createdAt);
    window.localStorage.setItem("html-content", item.htmlContent);
    window.localStorage.setItem("markdown", item.markdown);
    if (item.novelContent) {
      window.localStorage.setItem("novel-content", JSON.stringify(item.novelContent));
    }
    // 清除整个文档
    dispatch(setGlobalState({ saveStatus: false, novelContent: item.novelContent, renew: !global.payload.global.renew, rewriteDualScreen: false, translateDualScreen: false }))
  }

  const onToast = (description: string) => {
    toast({ duration: 2000, description })
  }

  // 保存或修改
  const onSave = async () => {
    try {
      const id = window.localStorage.getItem("novel-id");
      const markdown = window.localStorage.getItem("markdown");
      const title = window.localStorage.getItem("novel-title");
      const createdAt = window.localStorage.getItem("createdAt");
      const htmlContent = window.localStorage.getItem("html-content");
      const novelContent = window.localStorage.getItem("novel-content");
      if (!title && !markdown) {
        return;
      }
      const data = {
        id: +id,
        title,
        novelContent: novelContent ? JSON.parse(novelContent) : null,
        htmlContent,
        markdown,
        createdAt,
      }
      await addOrUpdateData(data);
      onToast(SAVE_SUCCESS_MESSAGE[language])
    } catch (error) {
      onToast(SAVE_SUCCESS_ERROR[language])
    }
  }

  const onClearDocument = () => {
    // 删除所有当前记录
    window.localStorage.removeItem("novel-id");
    window.localStorage.removeItem("markdown");
    window.localStorage.removeItem("novel-title");
    window.localStorage.removeItem("createdAt");
    window.localStorage.removeItem("html-content");
    window.localStorage.removeItem("txt-content");
    window.localStorage.removeItem("novel-content");
    window.localStorage.removeItem("novelSummary");
    window.localStorage.removeItem("novelTable");
    // 清除整个文档
    editorInstance.chain().clearContent().run();
    dispatch(setGlobalState({
      renew: !global.payload.global.renew, markdown: '', novelTitle: '', translateDualScreen: false, editorStatus: true,
      novelContent: [], novelSummary: '', novelTable: '', rewriteDualScreen: false,
    }))
  }

  const onCreateCopy = async () => {
    const highlightCodeblocks = (content: string) => {
      const doc = new DOMParser().parseFromString(content, 'text/html');
      doc.querySelectorAll('pre code').forEach((el) => {
        // @ts-ignore
        hljs.highlightElement(el);
      });
      return new XMLSerializer().serializeToString(doc);
    };
    if (editorInstanceCopy) {
      try {
        const novelContent = editorInstanceCopy?.getJSON();
        const markdown = editorInstanceCopy.storage.markdown.getMarkdown();
        const htmlContent = highlightCodeblocks(editorInstanceCopy.getHTML())
        const id = dayjs().valueOf();
        const data = {
          id: +id,
          title: `${title}-${COPY[language]}`,
          novelContent,
          htmlContent,
          markdown,
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        }
        await addOrUpdateData(data);
        onOpenRecords(data)
        toast({ duration: 2000, description: COPY_CREATED_SUCCESSFULLY[language] })
      } catch (error) {
        toast({ duration: 2000, description: COPY_CREATED_ERROR[language] })
      }
    }
  }

  const onClickButton = async (key: string, lingo?: string) => {
    switch (key) {
      // 关闭
      case 'Close':
        dispatch(setGlobalState({ rewriteDualScreen: false, translateDualScreen: false, freeRewritingText: '' }))
        break;

      // 复制
      case 'Full text copying':
        onHandleCopyResult()
        break;

      // 创建副本
      case 'Create copy':
        await onSave()
        onCreateCopy()
        onClearDocument()
        dispatch(setGlobalState({ renew: !global.payload.global.renew, rewriteDualScreen: false, translateDualScreen: false, freeRewritingText: '' }))
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth', // 平滑滚动
          });
        }, 0)
        break;

      // 重新生成
      case 'Regenerate':
        onRegenerate(lingo)
        break;
      // 全文替换
      case 'Replace entire text':
        const data = editorInstanceCopy.storage.markdown.getMarkdown()
        const oldTitle = localStorage.getItem('novel-title');
        console.log('oldTitle', oldTitle);

        editorInstance.chain().clearContent().run()
        editorInstance.chain().focus().insertContentAt(0, data).run();
        window.localStorage.setItem("novel-title", title);
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth', // 平滑滚动
          });
        }, 0)
        console.log('oldTitle', oldTitle);
        dispatch(setGlobalState({
          novelTitle: title, replaceStatus: false, rewriteDualScreen: false,
          translateDualScreen: false, freeRewritingText: '', editorStatus: true,
          novelSummary: '', novelTable: '', titleRecord: { oldTitle: oldTitle, status: true }
        }))
        break;

      default:
        break;
    }
  }

  const onLanguageSubmenu = (item) => {
    return (
      <Popover key={item.english}>
        <PopoverTrigger asChild>
          <Button key={item.english} size="sm" className="mx-3">
            {item[language]}
            <IoIosArrowForward />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-1 z-[9999]" align='center' side='top'>
          <div>
            {
              languageMenuList.map((item2) => (
                <Button
                  variant="ghost"
                  key={item2.english}
                  className={`hover:text-[#8e47f0] w-full flex justify-between ${selectLanguage === item2.english && 'text-[#8e47f0]'}`}
                  size="sm"
                  onClick={() => {
                    const data = editorInstance.storage.markdown.getMarkdown();
                    const langCode = franc(data);
                    if (langCode === item2.language) {
                      editorInstanceCopy.chain().clearContent().run()
                      editorInstanceCopy.chain().focus().insertContentAt(1, data).run();
                      dispatch(setGlobalState({ translateDualLanguage: item2.english }));
                      window.scrollTo({
                        top: 0,
                        behavior: 'smooth', // 平滑滚动
                      });
                    } else {
                      dispatch(setGlobalState({ translateDualLanguage: item2.english }))
                      onClickButton(item.english, item2.english)
                    }
                  }}
                >
                  <span>{item2[language]}</span>
                </Button>
              ))
            }
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="fixed bottom-3 right-[62px] z-[9999]">
      {DUAL_SCREEN_BUTTON.map((item) => {
        if (global.payload.global.translateDualScreen && item.english === 'Regenerate') {
          return (onLanguageSubmenu(item))
        } else {
          return <Button key={item.english} size="sm" className="mx-3" onClick={() => { onClickButton(item.english) }}>{item[language]}</Button>
        }
      })}
    </div>
  )
}