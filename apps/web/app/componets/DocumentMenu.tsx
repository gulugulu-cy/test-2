import ky from 'ky';
import React, { useRef } from 'react';
import dayjs from 'dayjs';
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";
import { MdSend } from "react-icons/md";
import { ExportMenu } from "./ExportMenu";
import { ErrMessage } from "./ErrMessage";
import { useEffect, useState } from "react";
import { MdFiberNew } from "react-icons/md";
import { CgScreenWide } from "react-icons/cg";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineDarkMode } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";
import { setGlobalState } from "../store/globalSlice";
import { Label } from '@/components/tailwind/ui/label';
import { Input } from "@/components/tailwind/ui/input";
import { HiOutlineDocumentText } from "react-icons/hi";
import { Button } from "@/components/tailwind/ui/button";
import { Switch } from "@/components/tailwind/ui/switch";
import type { EditorInstance, JSONContent } from "novel";
import { toast } from "@/components/tailwind/ui/use-toast";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { FullTextTranslationMenu } from "./FullTextTranslationMenu";
import { addOrUpdateData, deleteData, getAllData } from "../api/indexedDB";
import { Tabs, TabsList, TabsTrigger } from "@/components/tailwind/ui/tabs";
import { RadioGroup, RadioGroupItem } from '@/components/tailwind/ui/radio-group';
import { getAuthLocalStorage, getLocalStorage, setLocalStorage } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/tailwind/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/tailwind/ui/alert-dialog";
import { actinAIMenu, actinEditMenu, actinFileMenu, appearances, CAMCEL, COPY, COPY_CREATED_ERROR, COPY_CREATED_SUCCESSFULLY, DELETE, PLEASE_ENTER_THE_TITLE_FIRST, DELETE_RECORD, FULL_TEXT_SUMMARY_MSG, TITLE, MORE_RECORDS_TEXT, NO_CONTENT_REWRITE, NO_CONTENT_SUMMARY, NO_RECENT_EDITING_RECORDS, NOT_SAVE_BUTTON, onButtonName, OPEN_NEW_FILE_TIPS, PREFERENCE_SETTINGS, QUICK_MODIFICATION, RECENTLY_EDITED, SAVE_BUTTON, SAVE_SUCCESS_ERROR, SAVE_SUCCESS_MESSAGE, SUMMARIZING_THE_ENTIRE_TEXT, UNTITLED, type Language, IMPORT_FORMAT, HEADER_TITLE, DETERMINE, LONG_ARTICLE_REMINDER, GENERATION_COMPLETED, SUMMARY_LOADING } from '@/lib/language';
import { useRouter } from 'next/navigation';
import { ToastAction } from '@/components/tailwind/ui/toast';
import { useCompletion } from 'ai/react';

interface IProps {
  type: string;
  language: 'chinese' | 'english' | 'japanese',
  editorInstance: EditorInstance | null
  onOpenAiChat?: () => void;
  onOpenAudioPlayer: () => void;
  onFullTextSummaryRightOpen: () => void;
}

interface IData {
  id: number;
  title: string
  markdown: string;
  htmlContent: string;
  novelContent: JSONContent;
  createdAt: string;
}

export function DocumentMenu(props: IProps) {
  const router = useRouter();
  const dispatch = useAppDispatch()
  const global = useAppSelector(setGlobalState)
  const { language, type, editorInstance, onOpenAiChat, onOpenAudioPlayer, onFullTextSummaryRightOpen } = props;
  const [saveLoad, setSaveLoad] = useState(false)
  const [wideLayout, setWideLayout] = useState(0);
  const { theme: currentTheme, setTheme } = useTheme();
  const [summaryLoad, setSummaryLoad] = useState(false);
  const [open, setOpen] = useState(false)
  const [historicalRecords, setHistoricalRecords] = useState<Array<IData>>([]);

  useEffect(() => {
    const wideLayoutTemp = getLocalStorage('wideLayout');
    setWideLayout(wideLayoutTemp ? Number(wideLayoutTemp) : 0)
    setLocalStorage('wideLayout', `${Number(wideLayoutTemp ? Number(wideLayoutTemp) : 0)}`)
  }, [])

  useEffect(() => {
    getAllData().then((res) => {
      setHistoricalRecords(res)
    })
  }, [global.payload.global.renew, saveLoad])

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
      setSaveLoad(true)
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
      setSaveLoad(false)
    } catch (error) {
      onToast(SAVE_SUCCESS_ERROR[language])
      setSaveLoad(false)
    }
  }

  // 清空整个文档
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

  // 创建副本
  const onCreateCopy = async () => {
    setSaveLoad(true)
    try {
      const markdown = window.localStorage.getItem("markdown");
      let title = window.localStorage.getItem("novel-title");
      const createdAt = window.localStorage.getItem("createdAt");
      const htmlContent = window.localStorage.getItem("html-content");
      const novelContent = window.localStorage.getItem("novel-content");
      const id = dayjs().valueOf();
      if (title) {
        title = `${title}-${COPY[language]}`
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
      onToast(COPY_CREATED_SUCCESSFULLY[language])
      setSaveLoad(false)
    } catch (error) {
      onToast(COPY_CREATED_ERROR[language])
      setSaveLoad(false)
    }
  }

  // 打开记录文件
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
    dispatch(setGlobalState({
      saveStatus: false, novelContent: item.novelContent, renew: !global.payload.global.renew,
      rewriteDualScreen: false, translateDualScreen: false,
      novelTable: '', novelSummary: '', editorStatus: true,
    }))
  }

  //Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, 'text/html');
    doc.querySelectorAll('pre code').forEach((el) => {
      // @ts-ignore
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  // 打开新的文件
  const onOpenNewFile = (type: string) => {
    if (editorInstance) {
      if (type === 'Open local document') {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".md,.txt,.json";
        input.onchange = async () => {
          if (input.files?.length) {
            const file = input.files[0];
            if (file && (file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.json'))) {
              await onSave()
              onClearDocument();
              const reader = new FileReader();
              reader.onload = (e) => {
                const title = file.name.split('.')[0]
                window.localStorage.removeItem("novelTable");
                window.localStorage.removeItem("novelSummary");

                if (file.name.endsWith('.json')) {
                  try {
                    const json = JSON.parse(e.target.result as string);
                    const newTitle = json.title || ''
                    console.log(json);
                    if (json?.isEditor) {
                      setLocalStorage('novel-title', newTitle)
                      editorInstance.commands.setContent(json);
                      window.localStorage.setItem("novel-content", JSON.stringify(json));
                      window.localStorage.setItem("markdown", editorInstance.storage.markdown.getMarkdown());
                      window.localStorage.setItem("html-content", highlightCodeblocks(editorInstance.getHTML()));
                      window.localStorage.setItem("txt-content", editorInstance.getText());
                      dispatch(setGlobalState({ saveStatus: false, novelContent: json, markdown: editorInstance.storage.markdown.getMarkdown() }))
                    } else {
                      onToast(IMPORT_FORMAT[language])
                    }
                  } catch (error) {
                    onToast(IMPORT_FORMAT[language])
                  }
                } else {
                  setLocalStorage('novel-title', title)
                  editorInstance.chain().focus().insertContentAt(1, e.target.result).run();
                }
                dispatch(setGlobalState({ novelTitle: title, rewriteDualScreen: false, translateDualScreen: false, novelTable: '', novelSummary: '', editorStatus: true }))
              };
              reader.readAsText(file);
            } else {
              onToast(IMPORT_FORMAT[language])
            }
          }
        };
        input.click();
        return;
      }
      onClearDocument();
    }
  }

  const onToast = (description: string) => {
    toast({ duration: 2000, description })
  }

  // 保存当前文件
  const confirmSaverage = async (type: string) => {
    await onSave()
    onOpenNewFile(type)
  }

  // 全文总结
  const onFullTextSummary = async (name: string) => {
    onFullTextSummaryRightOpen()
    const key = name === 'Full text summary Table' ? 'novelTable' : 'novelSummary'
    const { api_key, model_name, novelTitle: title } = global.payload.global
    const content = editorInstance.getText();
    if (!content) {
      toast({
        duration: 2000,
        description: (NO_CONTENT_SUMMARY[language])
      })
      return;
    }
    setSummaryLoad(true)
    let model = language === 'chinese' ? 'deepseek-chat' : 'gpt-4o-2024-08-06';
    const data = {
      name,
      params: { title, content },
      api_key: api_key || getAuthLocalStorage(window, "api_key") || "",
      model: model_name || getAuthLocalStorage(window, "model_name") || model
    }
    try {
      const res = await ky('/api/generateWritingStream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data }),
        timeout: false
      })
      if (res?.body && res.ok) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let partialData = '';
        let outputData = '';
        const read = async () => {
          const readerRead = await reader.read();
          const { done, value } = readerRead;
          if (done) {

            setLocalStorage(key, outputData)
            if (key === 'novelTable') {
              onToast(FULL_TEXT_SUMMARY_MSG[language])
              return
            };
            onFullTextSummary('Full text summary Table')
            return;
          }

          // 解码并处理数据块
          partialData += decoder.decode(value, { stream: true });
          // 按行分割数据
          let lines = partialData.split('\n');
          // @ts-ignore
          partialData = lines.pop(); // 保留最后未处理完的部分
          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              const data = line.slice(6); // 去掉 "data: " 部分
              try {
                const parsedData = JSON.parse(data);
                if (parsedData?.content) {
                  setSummaryLoad(false);
                  setOpen(false)
                  outputData = outputData + parsedData.content;
                  const content = outputData.replace(/^[\s\S]*?markdown\s*/, '').replace(/```$/, '');
                  dispatch(setGlobalState({ [key]: content }))
                }
              } catch (e) {
                // toast({
                //   duration: 2000,
                //   description: (ErrMessage(0, language, global.payload.global.region))
                // })
                setSummaryLoad(false);
              }
            }
          });
          await read();
        }
        await read();
      } else {
        try {
          const resJson: any = await res.json();
          if (resJson?.error?.err_code) {
            setSummaryLoad(false);
            toast({
              duration: 2000,
              description: (ErrMessage(resJson?.error.err_code, language, global.payload.global.region))
            })
            return;
          }
        } catch (error) {
          toast({
            duration: 2000,
            description: (ErrMessage(0, language, global.payload.global.region))
          })
          setSummaryLoad(false);
        }
      }
    } catch (error) {
      if (error.response) {
        // 尝试从响应中解析错误信息
        try {
          const errorData = await error.response.json();
          toast({
            duration: 2000,
            description: (ErrMessage(errorData.error.err_code, language, global.payload.global.region))
          })
        } catch (parseError) {
          toast({
            duration: 2000,
            description: (ErrMessage(0, language, global.payload.global.region))
          })
        }
      } else {
        toast({
          duration: 2000,
          description: (ErrMessage(0, language, global.payload.global.region))
        })
      }
      setSummaryLoad(false);
    }
  }

  // 删除记录
  const onDelete = (item) => {
    const ondel = async (e) => {
      e.stopPropagation();
      const id = window.localStorage.getItem('novel-id')
      try {
        const result = await deleteData(item.id);
        getAllData().then((res) => {
          setHistoricalRecords(res)
        })
        onToast({ chinese: '删除成功', english: 'Delete successfully', japanese: '削除に成功しました' }[language])
        if (id && item.id === +id) {
          onClearDocument()
        }
        console.log('删除历史记录成功', result);
      } catch (error) {
        console.log('删除历史记录失败', error);
      }
    }
    return (
      <AlertDialog>
        <AlertDialogTrigger>
          <RiDeleteBin6Line className='min-w-[18px] ml-2 hover:text-red-600' />
        </AlertDialogTrigger>
        <AlertDialogContent className="z-[9999] w-80">
          <AlertDialogHeader>
            <AlertDialogTitle></AlertDialogTitle>
            <AlertDialogDescription className="flex items-center">
              {DELETE_RECORD[language]}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{CAMCEL[language]}</AlertDialogCancel>
            <AlertDialogAction onClick={ondel}>{DELETE[language]}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  const exportJSON = () => {
    const novelContent = window.localStorage.getItem('novel-content');
    const title = window.localStorage.getItem('novel-title');

    if (!novelContent) {
      onToast({ chinese: '没有可导出的 JSON 内容。', english: 'There is no JSON content available for export.', japanese: 'エクスポート可能なJSONコンテンツはありません。' }[language])
      return;
    }

    const jsonData = JSON.parse(novelContent);
    jsonData.isEditor = true;
    if (title) {
      jsonData.title = title;
    }

    const jsonString = JSON.stringify(jsonData, null, 2); // 4 表示缩进级别为4个空格

    // 创建 Blob 对象
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    // 创建一个隐藏的 a 元素用于触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || UNTITLED[language]}.json`; // 设置下载的文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // 释放 URL 对象
    URL.revokeObjectURL(url);
  };

  const generateLongParams = useRef({
    plan: '',
    written: '',
    sections: [],
    index: 0,
  })

  // 生成长文内容
  const GenerateLongContent = async () => {
    const title = global.payload.global.novelTitle;
    const text = editorInstance.getText();

    const onRequest = async () => {
      editorInstance.setEditable(false);
      toast({
        duration: Infinity,
        description: <div className='flex items-center'>
          <span>{SUMMARY_LOADING[global.payload.global.language]}</span>
          <Loader2 className="animate-spin ml-3 text-[#8e47f0]" style={{ width: 20, height: 20 }} />
        </div>,
        action: (<ToastAction altText="Goto schedule to undo" className="hidden" ></ToastAction>),
      })
      let model = global.payload.global.language === 'chinese' ? 'deepseek-chat' : 'gpt-4o-2024-08-06';
      const plan = await onReq({ title }, 'Ultra long writing')
      if (plan && plan?.length < 0) return;
      const outline = plan.split('\n').filter(f => f.length > 0);
      const next = outline.shift()
      generateLongParams.current = { plan, written: '', sections: outline, index: 1, }

      complete(title, {
        body: {
          plan,
          written: '',
          next: next,
          api_key: global.payload.global.api_key || getAuthLocalStorage(window, "api_key") || "",
          model: global.payload.global.model_name || getAuthLocalStorage(window, "model_name") || model,
        }
      })
    }

    if (title.trim().length < 1) {
      onToast(PLEASE_ENTER_THE_TITLE_FIRST[language])
      return;
    }
    if (text.trim().length > 0) {
      toast({
        title: "",
        description: <div className='text-red-600'>{LONG_ARTICLE_REMINDER[global.payload.global.language]}</div>,
        action: (
          <ToastAction altText="Goto schedule to undo" onClick={() => { onRequest() }}>{DETERMINE[global.payload.global.language]}</ToastAction>
        ),
      })
      return;
    }
    await onRequest();
  }

  const { completion, complete, setCompletion, isLoading } = useCompletion({
    id: "novel",
    api: "/api/generateLongContent",
    onFinish: async (prompt, completion) => {
      if (!generateLongParams.current.sections.length) {
        generateLongParams.current = {
          plan: '',
          written: '',
          sections: [],
          index: 0,
        }
        editorInstance.setEditable(true);
        toast({
          duration: 2000,
          description: GENERATION_COMPLETED[global.payload.global.language]
        })
        return;
      };
      const { sections, plan, written } = generateLongParams.current
      const title = global.payload.global.novelTitle;
      const next = sections.shift();
      let model = global.payload.global.language === 'chinese' ? 'deepseek-chat' : 'gpt-4o-2024-08-06';
      const data = written + "\n" + completion
      generateLongParams.current = {
        plan,
        written: data,
        sections,
        index: 2,
      }
      complete(title, {
        body: {
          plan,
          written: data,
          next,
          api_key: global.payload.global.api_key || getAuthLocalStorage(window, "api_key") || "",
          model: global.payload.global.model_name || getAuthLocalStorage(window, "model_name") || model,
        }
      })
    },
    onResponse: async (response) => {
      if (response.status === 429) {
        onToast('You have reached your request limit for the day.')
        generateLongParams.current = {
          plan: '',
          written: '',
          sections: [],
          index: 0,
        }
        editorInstance.setEditable(true);
        return;
      }
      if (!response.ok) {
        // 尝试从响应中解析错误信息
        generateLongParams.current = {
          plan: '',
          written: '',
          sections: [],
          index: 0,
        }
        editorInstance.setEditable(true);
        try {
          const errorData = await response.json();
          toast({
            duration: 2000,
            description: (ErrMessage(errorData.err_code, global.payload.global.language, global.payload.global.region))
          })
        } catch (parseError) {
          toast({
            duration: 2000,
            description: (ErrMessage(0, global.payload.global.language, global.payload.global.region))
          })
        }
      }
    },
  });

  useEffect(() => {
    if (completion && generateLongParams.current?.index) {
      try {
        const endPosition = editorInstance.state.doc.content.size;
        if (!completion.endsWith('-')) {
          const data = generateLongParams.current.written + '\n' + completion
          editorInstance
            .chain()
            .focus()
            .insertContentAt({ from: 0, to: endPosition }, data)
            .run();
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
          });
        }
      } catch (error) {

      }
    }
  }, [completion])

  const onReq = async (params: { title: string, }, name: string) => {
    let model = language === 'chinese' ? 'deepseek-chat' : 'gpt-4o-2024-08-06';
    const data = {
      name,
      params,
      api_key: global.payload.global.api_key || getAuthLocalStorage(window, "api_key") || "",
      model: global.payload.global.model_name || getAuthLocalStorage(window, "model_name") || model,
    }
    try {
      const res = await ky('/api/generateWriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data }),
        timeout: false
      })
      if (res?.body && res.ok) {
        const temp: any = await res.json();
        if (temp?.data) {
          if (temp?.data.choices[0]?.message?.content) {
            const output = temp.data.choices[0].message.content;
            return output;
          }
        }
      } else {
        const resJson: any = await res.json();
        if (resJson?.error?.err_code) {
          toast({
            duration: 2000,
            description: (ErrMessage(resJson?.error.err_code, language, global.payload.global.region))
          })
          return;
        }
      }
    } catch (error) {
      if (error.response) {
        try {
          const errorData = await error.response.json();
          toast({
            duration: 2000,
            description: (ErrMessage(errorData.error.err_code, language, global.payload.global.region))
          })
        } catch (parseError) {
          toast({
            duration: 2000,
            description: (ErrMessage(0, language, global.payload.global.region))
          })
        }
      } else {
        toast({
          duration: 2000,
          description: (ErrMessage(0, language, global.payload.global.region))
        })
      }
    }
  }

  const onRenderingMenu = () => {
    switch (type) {
      case 'File':
        return (
          <div className="h-full text-sm">
            {
              Object.keys(actinFileMenu).map(key => (
                <div className="border-b" key={key}>
                  {actinFileMenu[key].map((item, index) => {
                    if (item.english === 'export') {
                      return (<ExportMenu language={language} key={item.english} />)
                    }
                    return (
                      <Button
                        size="sm"
                        variant="ghost"
                        key={item.english}
                        className="hover:text-[#8e47f0] w-full flex justify-between"
                        onClick={async () => {
                          switch (item.english) {
                            case 'preservation':
                              await exportJSON()
                              return;
                            case 'Create a copy':
                              await onCreateCopy()
                              return;
                            case 'new file':
                              await confirmSaverage(item.english)
                            case 'Open local document':
                              await onOpenNewFile(item.english)
                            default:
                              break;
                          }
                        }}
                      >
                        <div className="flex items-center">
                          {item?.icon}
                          <span className="ml-2">{item[language]}</span>
                        </div>
                        {item?.ShortcutKeys && (<span className="text-xs">{item?.ShortcutKeys}</span>)}
                      </Button>
                    )
                  })}
                </div>
              ))
            }
            <div >
              <div className="text-xs text-slate-500 mt-2 px-4">{RECENTLY_EDITED[language]}</div>
              <div className="pt-2">
                {
                  historicalRecords.length ? historicalRecords.filter((_, index) => index < 10).map((item) => {
                    const id = window.localStorage.getItem('novel-id')
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center w-full py-1 cursor-pointer hover:text-[#8e47f0] hover:bg-[#f1f5f9] p-3 rounded-sm"
                        style={{ color: +id === item.id ? '#8e47f0' : '', background: +id === item.id ? '#f1f5f9' : '' }}
                      >
                        <div className="flex items-center w-full" onClick={async () => { await onSave(); onOpenRecords(item) }}>
                          <HiOutlineDocumentText className="mr-2 text-lg min-w-[18px]" />
                          {item?.title || UNTITLED[language]}
                        </div>
                        {onDelete(item)}
                      </div>
                    )
                  }) : <div className="text-xs text-slate-500 text-center w-full">{NO_RECENT_EDITING_RECORDS[language]}</div>
                }
                {
                  historicalRecords.length && historicalRecords.length > 10 ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="hover:text-[#8e47f0] py-1 px-2 w-full" size="sm">
                          <span className="ml-1 text-sm">{MORE_RECORDS_TEXT[language]}</span>
                          <IoIosArrowForward />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-1 z-[9999] max-h-60 overflow-y-auto" align='end' side='right'>
                        {historicalRecords.filter((_, index) => index >= 10).map((item) => {
                          return (
                            <div
                              key={item.id}
                              className="flex justify-between items-center w-full py-1 cursor-pointer hover:text-[#8e47f0] hover:bg-[#f1f5f9] p-3 rounded-sm"
                            >
                              <div className="flex items-center w-full" onClick={async () => { await onSave(); onOpenRecords(item) }}>
                                <HiOutlineDocumentText className="mr-2 min-w-[18px]" />
                                {item?.title || UNTITLED[language]}
                              </div>
                              {onDelete(item)}
                            </div>
                          )
                        })}
                      </PopoverContent>
                    </Popover>
                  ) : <></>
                }
              </div>
            </div>
          </div>
        )
      case 'Edit':
        return (
          <div className="h-full text-sm">
            {
              Object.keys(actinEditMenu).map(key => (
                <div className={`${key === 'find' ? 'border-b-0' : 'border-b'}`} key={key}>
                  {actinEditMenu[key].map((item) => (
                    <Button
                      size="sm"
                      variant="ghost"
                      key={item.english}
                      className="hover:text-[#8e47f0] w-full flex justify-between"
                      onClick={() => {
                        if (editorInstance) {
                          if (key === 'find') {
                            dispatch(setGlobalState({ findAndReplaceVisible: true }))
                          }
                          if (item.english === 'revoke') {
                            editorInstance.chain().undo().run()
                            const { titleRecord } = global.payload.global
                            if (titleRecord.status) {
                              localStorage.setItem('novel-title', titleRecord.oldTitle)
                              dispatch(setGlobalState({ novelTitle: titleRecord.oldTitle, titleRecord: { oldTitle: '', status: false } }))
                            }
                          }
                          if (item.english === 'recovery') {
                            editorInstance.chain().redo().run()
                          }
                          editorInstance.state.doc.descendants((node, pos) => {
                            if (node.isText) {
                              const from = pos;
                              const to = pos + node.text.length;
                              editorInstance.chain().setTextSelection({ from, to }).unsetHighlight().run();
                            }
                          });
                        }
                      }}
                    >
                      <div className="flex items-center">
                        {item?.icon}
                        <span className="ml-2">{item[language]}</span>
                      </div>
                      {item?.ShortcutKeys && (<span className="text-xs">{item?.ShortcutKeys}</span>)}
                    </Button>
                  )
                  )}
                </div>
              ))
            }
          </div>
        )
      case 'AI':
        return (
          <div className="h-full text-sm">
            {
              actinAIMenu.map((item, index) => {
                if (item.english === 'Full text translation') {
                  return (<FullTextTranslationMenu key={item.english} language={language} />)
                }
                return (
                  <Button
                    key={item.english}
                    variant="ghost"
                    className="hover:text-[#8e47f0] w-full flex justify-between"
                    size="sm"
                    onClick={() => {
                      if (index === 0) {
                        window.localStorage.removeItem("novelTable");
                        window.localStorage.removeItem("novelSummary");
                        dispatch(setGlobalState({ novelTable: '', novelSummary: '' }))
                        onFullTextSummary('Full text summary')
                      }
                      if (index === 2) {
                        const content = getLocalStorage('markdown')
                        if (!content) {
                          toast({
                            duration: 2000,
                            description: (NO_CONTENT_REWRITE[language])
                          })
                          return;
                        }
                        dispatch(setGlobalState({ rewriteDualScreen: true, translateDualScreen: false }))
                      }
                      if (index === 3) {
                        onOpenAudioPlayer()
                        setOpen(false)
                      }
                      if (index === 4) {
                        onOpenAiChat();
                      }
                      if (index === 5) {
                        GenerateLongContent();
                      }
                    }}
                  >
                    <div className="flex items-center ">
                      {item?.icon}
                      <span className={`ml-2 ${index === 5 && 'text-[#8e47f0]'}`}>{item[language]}</span>
                    </div>
                    {(summaryLoad && index === 0) && <Loader2 className="animate-spin" style={{ width: 20, height: 20 }} />}
                    {index === 5 && <MdFiberNew className='text-lg text-[#8e47f0]' />}
                  </Button>)
              })
            }
            <div className="border-t flex justify-between items-center text-sm">
              <Input
                className="border-0 h-8 text-sm "
                placeholder={QUICK_MODIFICATION[language]}
                value={global.payload.global.freeRewritingText}
                onChange={(e) => {
                  dispatch(setGlobalState({ freeRewritingText: e.target.value }))
                }}
                onKeyDown={(e) => {
                  setTimeout(() => {
                    const dom = window.document.getElementById("freeRewritingBut")
                    if (e?.key === "Enter" && dom) dom.click()
                  }, 10)
                }}
              />
              <div id="freeRewritingBut" onClick={() => {
                if (!global.payload.global.freeRewritingText) {
                  onToast(QUICK_MODIFICATION[language])
                } else {
                  const { freeRewritingStatus } = global.payload.global
                  dispatch(setGlobalState({ rewriteDualScreen: true, translateDualScreen: false, freeRewritingStatus: !freeRewritingStatus }))
                }
              }}>
                <MdSend className="text-[20px] cursor-pointer" />
              </div>
            </div>
          </div>
        )
      case 'Preference':
        return (
          <div className="h-full text-sm w-full">
            <Button variant="ghost" size="sm" className="flex items-center justify-between hover:text-[#8e47f0] w-full" >
              <div className='flex items-center'>
                <CgScreenWide className="mr-2" />
                {{ chinese: '宽布局', english: 'Wide layout', japanese: 'ワイドレイアウト' }[language]}
              </div>
              <Switch
                checked={Boolean(wideLayout)}
                onCheckedChange={(v) => {
                  setWideLayout(Number(v))
                  dispatch(setGlobalState({ wideLayout: Number(v) }))
                  setLocalStorage('wideLayout', `${Number(v)}`)
                }}
              />
            </Button>
            <Button variant="ghost" className="flex items-center justify-between hover:text-[#8e47f0] w-full h-12 px-3" >
              <div className="flex items-center">
                <MdOutlineDarkMode className="mr-2" />
                {{ chinese: '主题样式', english: 'Theme Style', japanese: 'テーマスタイル' }[language]}
              </div>
              <Tabs value={currentTheme} onValueChange={(value) => { setTheme(value) }}>
                <TabsList className="grid w-full grid-cols-3 bg-[#e6aeff2e]">
                  {
                    appearances.map(item => (
                      <TabsTrigger key={item.theme} value={item.theme}>
                        {item[language]}
                      </TabsTrigger>
                    ))
                  }
                </TabsList>
              </Tabs>
            </Button>
            <div className='mt-3 border-t'>
              <RadioGroup
                className='gap-0'
                defaultValue={global.payload.global.language}
                value={global.payload.global.language}
                onValueChange={(value) => {
                  // dispatch(setGlobalState({ language: value }))
                  // document.title = TITLE[value]
                  localStorage.setItem('lang', value)
                  dispatch(setGlobalState({ language: value, renew: !global.payload.global.renew }))
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
                  router.replace(updatedUrl)
                  // router.push(updatedUrl, undefined, { shallow: true });
                  // window.location = updatedUrl
                }}>
                <Button size='sm' variant="ghost" className="flex justify-start hover:text-[#8e47f0] w-full" >
                  <RadioGroupItem value="chinese" id="r1" />
                  <Label className='leading-[2.7] text-left cursor-pointer ml-2 w-full h-full' htmlFor="r1">中文</Label>
                </Button>
                <Button size='sm' variant="ghost" className="flex justify-start hover:text-[#8e47f0] w-full" >
                  <RadioGroupItem value="english" id="r2" />
                  <Label className='leading-[2.7] text-left cursor-pointer ml-2 w-full h-full' htmlFor="r2">English</Label>
                </Button>
                <Button size='sm' variant="ghost" className="flex justify-start hover:text-[#8e47f0] w-full" >
                  <RadioGroupItem value="japanese" id="r3" />
                  <Label className='leading-[2.7] text-left cursor-pointer ml-2 w-full h-full' htmlFor="r3">日本語</Label>
                </Button>
              </RadioGroup>
            </div>
          </div>
        )
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className={`hover:text-[#8e47f0] md:mx-2 py-1 px-2 ${type === 'AI' && 'text-[#8e47f0]'}`} size="sm">
          {onButtonName[type].icon}
          <span className="ml-1 text-sm">{onButtonName[type].name[language]}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-1 z-[9999]">
        {onRenderingMenu()}
      </PopoverContent>
    </Popover>
  )
}
