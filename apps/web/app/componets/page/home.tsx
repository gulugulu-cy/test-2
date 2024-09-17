"use client";

import Papa from 'papaparse';
import { BsCopy } from "react-icons/bs";
import type { JSONContent } from "novel";
import { MdClose, MdSend } from "react-icons/md";
import ReactMarkdown from "react-markdown";
import { ImSpinner3 } from "react-icons/im";
import { type EditorInstance } from "novel";
import { useEffect, useRef, useState } from "react";
import { MdFullscreen } from "react-icons/md";
import { FaCircleCheck } from "react-icons/fa6";
import { RxDoubleArrowLeft } from "react-icons/rx";
import { RxDoubleArrowRight } from "react-icons/rx";
import { Button } from "@/components/tailwind/ui/button";
import { toast } from "@/components/tailwind/ui/use-toast";
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { COPY_CSV, COPY_ERROR, COPY_SUCCESSFUL, DOWNLOAD, RIGHT_TAB_BRAIN_MAP_TITLE, RIGHT_TAB_TABLE_TITLE, TAB_BRAIN_MAP, TAB_TABLE, UNTITLED, HEADER_TITLE, LANG_SHORT, LANG, CLICK_TO_CLEAR_ALL_CHAT_RECORDS } from "@/lib/language";
import TailwindAdvancedEditorCopy from "@/components/tailwind/advanced-editor-copy";
import { getAuthLocalStorage, getLocalStorage, setAuthLocalStorage } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tailwind/ui/tabs";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/tailwind/ui/alert-dialog";
import AudioPlayer from '@/components/tailwind/generative/ai-sound-playback';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setGlobalState } from '@/app/store/globalSlice';
import { DocumentMenu } from '../DocumentMenu';
import MarkmapComponent from '../MarkmapComponent';
import PoweredBy from '../PoweredBy';
import ToolInfo from '../ToolInfo';
import { useRouter } from '@/navigation';
import { RiRobot2Line } from "react-icons/ri";
import { MdCleaningServices } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { Textarea } from '@/components/tailwind/ui/textarea';
import { ErrMessage } from '../ErrMessage';
import { useCompletion } from 'ai/react';
import { Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/tailwind/ui/tooltip';
import PulsatingButton from '@/components/tailwind/magicui/pulsating-button';
import ShinyButton from '@/components/tailwind/magicui/shiny-button';

const onActionBar = [
  { id: 1, type: 'File' },
  { id: 2, type: 'Edit', },
  { id: 3, type: 'AI', },
  { id: 4, type: 'Preference', },
]

export default function Page() {
  const router = useRouter();
  const dispatch = useAppDispatch()
  const global = useAppSelector(setGlobalState);

  const [open, setOpen] = useState({ brainMap: false, table: false });
  const [downloadMarkmapType, setDownloadMarkmapType] = useState('')
  const [initialContent, setInitialContent] = useState<null | JSONContent>(null);
  const [editorInstance, setEditorInstance] = useState<EditorInstance | null>(null);
  const [leftAndRightAreas, setLeftAndRightAreas] = useState({ left: false, right: false, ai: false })
  const [openAudioPlayer, setOpenAudioPlayer] = useState({ text: '', disable: false })

  // 读取当前用户语言
  useEffect(() => {
    const windowLanguage = window.navigator.language;
    let lang: 'chinese' | 'english' | 'japanese' = 'english';
    if (["en-US", "zh-CN", "ja-JP"].includes(windowLanguage)) {
      lang = LANG[windowLanguage]
    }
    if (["en", "zh", "ja"].includes(windowLanguage)) {
      lang = LANG_SHORT[windowLanguage]
    }
    const localStorageLanguage = localStorage.getItem('lang')
    if (localStorageLanguage) lang = localStorageLanguage as 'chinese' | 'english' | 'japanese';
    const locale = window.location.pathname.split('/')[1]
    if (locale) {
      if (["en", "zh", "ja"].includes(locale)) lang = LANG_SHORT[locale]
      else lang = 'english'
    }
    const searchLang = new URLSearchParams(window.location.search).get('lang')
    if (searchLang) {
      if (["en-US", "zh-CN", "ja-JP"].includes(searchLang)) lang = LANG[searchLang];
      else lang = 'english'
    }
    document.title = HEADER_TITLE[lang]
    localStorage.setItem('lang', lang)
    dispatch(setGlobalState({ language: lang }))
  }, [])

  // 页面初始值
  useEffect(() => {
    const novelSummary = getLocalStorage('novelSummary');
    const novelTable = getLocalStorage('novelTable');
    dispatch(setGlobalState({ novelTable, novelSummary }))
  }, [])

  useEffect(() => {
    if (global.payload.global.novelContent) {
      const { novelContent } = global.payload.global;
      if (novelContent) {
        const dataTemp = novelContent?.content?.filter(node => node.type === 'heading' && node?.content?.length > 0 && node?.content[0]?.text)
          ?.map(node => node);
        setInitialContent(dataTemp || [])
      }
    }
  }, [global.payload.global.novelContent]);

  useEffect(() => {
    if (!global.payload.global.api_key) {
      const urlCode = new URLSearchParams(window.location.search).get('pwd')
      const storageCode = getAuthLocalStorage(window, 'code')
      if (urlCode) login(urlCode)
      else login(undefined, storageCode || '')
    }
  }, [])

  useEffect(() => {
    const chatRecord = localStorage.getItem('writingChat');
    try {
      if (chatRecord && chatRecord !== null) {
        const data = JSON.parse(chatRecord)
        setChatContent(() => data || [])
      }
    } catch (error) {

    }
  }, [])

  const login = async (code?: string, twiceCode?: string) => {
    try {
      const toAuthURL = "/auth" + window.location.search
      const hostname = window.location.host.split('.')[0]
      // const fetchUrl = `https://test-api2.gpt302.com/bot/v1/${hostname}`
      // const fetchUrl = `https://dash-api.302.ai/bot/v1/${hostname}`
      const fetchUrl = `${process.env.NEXT_PUBLIC_BACK_FETCH_URL}/${hostname}`
      const response = await fetch(`${fetchUrl}${code ? '?pwd=' + code : ''}`)
      // const hostname = "45i7-word";
      // const fetchUrl = `https://test-api2.gpt302.com/bot/v1/${hostname}`
      // const response = await fetch(`${fetchUrl}${code ? '?pwd=7267' + code : '?pwd=7267'}`)
      if (response.status === 200) {
        const data = JSON.parse(await response.text())
        if (data.code === 0) {
          code &&
            setAuthLocalStorage(window, {
              code
            })
          setAuthLocalStorage(window, {
            api_key: data.data.api_key,
            model_name: data.data.model_name,
            region: data.data.region
          })
          dispatch(setGlobalState({ ...data.data, code }))
          router.push('/')
        } else {
          if (twiceCode) {
            const response = await fetch(`${fetchUrl}?pwd=${twiceCode}`)
            if (response.status === 200) {
              const data = JSON.parse(await response.text())
              if (data.code === 0) {
                dispatch(setGlobalState({ ...data.data, code: twiceCode }))
                setAuthLocalStorage(window, {
                  api_key: data.data.api_key,
                  model_name: data.data.model_name
                })
                router.push('/')
              } else router.push(toAuthURL)
            } else router.push(toAuthURL)
          } else router.push(toAuthURL)
        }
      } else router.push(toAuthURL)
    } catch (error) {
      console.log('error', error);
    }
  }

  // 渲染左边目录
  const onRenderingLeftList = () => {
    const onLocation = (index: number) => {
      if (editorInstance) {
        const allH2Positions = [];
        editorInstance.view.state.doc.forEach((node, pos) => {
          if (node.type.name === 'heading') {
            allH2Positions.push(pos < 1 ? 1 : pos);
          }
        });
        const thirdH2Pos = allH2Positions[index];
        const oldScrollY = window.scrollY;
        editorInstance.chain().focus(thirdH2Pos === 1 ? thirdH2Pos : thirdH2Pos + 1).run();
        setTimeout(() => {
          if (oldScrollY < window.scrollY) {
            window.scrollBy(0, window.outerHeight - 200); // 调整向下滚动的位置
          } else {
            window.scrollBy(0, -50); // 调整这个值以控制向上滚动的距离
          }
        }, 10);
      }
    }
    if (initialContent) {
      const isH1 = initialContent.some((o: JSONContent) => o.attrs.level === 1)
      const isH2 = initialContent.some((o: JSONContent) => o.attrs.level === 2)
      return initialContent.map((item: JSONContent, index) => {
        return (
          <div
            key={`${item.text}-${index}`}
            onClick={() => { onLocation(index) }}
            className={
              `cursor-pointer hover:text-[#8e47f0]
               hover:bg-[#f1f5f9] py-1 text-sm
               ${item.attrs.level === 2 && isH1 && 'ml-3'}
               ${item.attrs.level === 3 && isH2 && 'ml-6'}
               `
            }
          >
            {item.content.map(item => item.text).join('')}
          </div>
        )
      })
    } else {
      return <></>
    }
  }

  // 渲染表格
  const onRenderingTable = (csvData: string) => {
    if (!csvData) return;
    const rows: any = Papa.parse(csvData, {
      comments: '```',
      skipEmptyLines: true,
    })
    if (rows.data.length) {
      const longestSublistIndex = rows.data.reduce((maxIndex: number, sublist: any, index: number, array: any[]) => {
        return sublist.length > array[maxIndex].length ? index : maxIndex;
      }, 0);
      const transposedData = rows.data[longestSublistIndex].map((_: any, colIndex: number) => rows.data.map((row: any) => row[colIndex]));
      const nonEmptyColumnIndices = transposedData.map((col: any, index: number) => col.some((cell: any) => cell) ? index : -1)
        .filter((index: number) => index !== -1);

      const tableData = rows.data.map((row: any) => nonEmptyColumnIndices.map((index: number) => row[index]))
        .filter((sublist: any) => !sublist.every((cell: any) => cell && cell?.trim()?.indexOf('---') > -1));

      return (
        <table>
          <tbody>
            {
              tableData.map((_: string, index: number) => {
                return (
                  <tr key={`${index}`}>
                    {
                      tableData[index].map((item: string, index2: number) => {
                        if (index2 === 0) {
                          return (<th key={`${item}-${index2}`}>{item}</th>)
                        } else {
                          return (<td key={`${item}-${index2}`}>{item}</td>)
                        }
                      })
                    }
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      )
    }
    return <></>
  }

  // 复制结果内容
  const onHandleCopyResult = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        onToast(COPY_SUCCESSFUL[global.payload.global.language])
      })
      .catch(err => {
        onToast(COPY_ERROR[global.payload.global.language])
      });
  }

  const onToast = (description: string) => {
    toast({ duration: 2000, description })
  }

  // 处理脑图数据
  const onBrainMapData = () => {
    if (global.payload.global.novelSummary) {
      const { novelSummary } = global.payload.global;
      const firstNewlineIndex = novelSummary.indexOf('\n');
      return novelSummary.substring(firstNewlineIndex + 1)?.replace(/```/g, '');
    }
    return ''
  }

  // 下载表格
  const onDownloadTable = (csvData: string) => {
    // 将对象数组转换为CSV字符串
    function convertToCSV(data) {
      const headers = Object.keys(data[0]).join(",") + "\n"; // 获取表头
      const rows = data.map(row => Object.values(row).join(",")).join("\n"); // 获取每一行的数据
      return headers + rows;
    }

    const rows: any = Papa.parse(csvData, {
      comments: '```',
      skipEmptyLines: true,
    })
    if (rows.data.length) {
      const longestSublistIndex = rows.data.reduce((maxIndex: number, sublist: any, index: number, array: any[]) => {
        return sublist.length > array[maxIndex].length ? index : maxIndex;
      }, 0);
      const transposedData = rows.data[longestSublistIndex].map((_: any, colIndex: number) => rows.data.map((row: any) => row[colIndex]));
      const nonEmptyColumnIndices = transposedData.map((col: any, index: number) => col.some((cell: any) => cell) ? index : -1)
        .filter((index: number) => index !== -1);

      const tableData = rows.data.map((row: any) => nonEmptyColumnIndices.map((index: number) => row[index]))
        .filter((sublist: any) => !sublist.every((cell: any) => cell && cell?.trim()?.indexOf('---') > -1));

      const filename = `${global.payload.global.novelTitle || UNTITLED[global.payload.global.language]}.csv`;
      // 创建并下载CSV文件
      const csvContent = convertToCSV(tableData);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      // 生成下载链接
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", filename);

      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  const chatError = useRef(false);
  const { completion, complete, setCompletion, isLoading } = useCompletion({
    id: "novel",
    api: "/api/chat",
    onFinish: async (prompt, completion) => {
      setChatLoag(false)
      setCompletion('')
      localStorage.setItem('writingChat', JSON.stringify(chatMsg.current))
    },
    onResponse: async (response) => {
      if (response.status === 429) {
        setChatLoag(false)
        chatError.current = true
        onToast('You have reached your request limit for the day.')
        return;
      }
      if (!response.ok) {
        chatError.current = true
        setChatLoag(false)
        // 尝试从响应中解析错误信息
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
    if (chatError.current) {
      const message = [...chatContent];
      const chatInputText = message[message.length - 2].content;
      message.splice(-2, 2);
      setChatContent(() => [...message])
      setChartInpt(chatInputText);
      chatError.current = false;
    }
  }, [chatError.current])

  const [chatContent, setChatContent] = useState([]);
  const [chatLoag, setChatLoag] = useState(false);
  const [chartInpt, setChartInpt] = useState('');
  const chatMsg = useRef(null);
  const onChat = () => {
    if (chatLoag || !chartInpt) return;
    setChatLoag(true)
    const { chatSelectText, novelTitle } = global.payload.global;
    const message = [...chatContent, { role: "user", content: chartInpt }]
    const content = editorInstance?.storage?.markdown?.getMarkdown() || '';
    setChatContent(() => [...message])
    setChartInpt('');
    let model = global.payload.global.language === 'chinese' ? 'deepseek-chat' : 'gpt-4o-2024-08-06';
    complete(novelTitle, {
      body: {
        selected: chatSelectText, content, record: message,
        api_key: global.payload.global.api_key || getAuthLocalStorage(window, "api_key") || "",
        model: global.payload.global.model_name || getAuthLocalStorage(window, "model_name") || model,
      }
    })
  }

  useEffect(() => {
    if (completion) {
      const lastData = chatContent[chatContent.length - 1];
      const message = [...chatContent];
      if (message[message.length - 1].role === 'assistant') {
        message[message.length - 1] = { ...lastData, content: completion }
      } else {
        message.push({ role: "assistant", content: completion })
      }
      chatMsg.current = message;
      setChatContent(() => message)
    }
  }, [completion])

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatContent]);

  return (
    <div className="flex min-h-screen h-full flex-col items-center w-full relative">
      {/* 顶部 */}
      <div className={`flex items-center py-1 px-3 justify-between sticky top-0 border-b z-10 w-full bg-background h-12`}>
        <div className="flex md:min-w-[120px] min-w-6">
          <img src="https://file.302.ai/gpt/imgs/5b36b96aaa052387fb3ccec2a063fe1e.png" className="h-6 w-6 mr-2" alt="302" />
          <span className="md:block hidden">{HEADER_TITLE[global.payload.global.language]}</span>
        </div>
        <div className="flex items-center">
          {onActionBar.map(item => (
            <DocumentMenu
              key={item.id}
              type={item.type}
              language={global.payload.global.language}
              onOpenAiChat={() => { setLeftAndRightAreas(v => ({ ...v, ai: true })) }}
              editorInstance={editorInstance}
              onFullTextSummaryRightOpen={() => { setLeftAndRightAreas(v => ({ ...v, right: true })) }}
              onOpenAudioPlayer={() => {
                const text = editorInstance.getText()
                setOpenAudioPlayer({ disable: true, text })
              }}
            />
          ))}
        </div>
        {
          (openAudioPlayer.disable && openAudioPlayer.text) && (
            <div className='fixed top-[48px] left-1/3 -translate-x-1/3 border md:w-[500px] w-full bg-background'>
              <AudioPlayer text={openAudioPlayer.text} full={openAudioPlayer.disable} close={() => { setOpenAudioPlayer({ disable: false, text: '' }) }} />
            </div>
          )
        }
        <div className="flex items-center">
          <div className="md:block hidden">
            <FaCircleCheck className={` ${global.payload.global.saveStatus ? 'hidden' : 'block'}`} />
            <ImSpinner3 className={`${global.payload.global.saveStatus ? 'block' : 'hidden'} animate-spin`} />
          </div>
          <ToolInfo language={global.payload.global.language} />
        </div>
      </div>

      {/* 内容 */}
      <div className="mx-auto relative flex justify-between w-full">
        {/* 左边 */}
        <div className={`z-[9998] bg-background sticky top-[48px] 
             ${leftAndRightAreas.left && 'border-r min-w-[250px] max-w-[250px]'}
             ${leftAndRightAreas.ai && 'border-r min-w-[400px] max-w-[400px]'}
             ${(!leftAndRightAreas.ai && !leftAndRightAreas.left) && 'min-w-[55px] max-w-[55px] border-r-0'}`
        } style={{ height: '100%' }}
        >
          <div className='flex items-end flex-col'>
            <div className={`justify-end w-full ${(leftAndRightAreas.ai || !initialContent?.length) ? 'hidden' : 'flex'}`}>
              <Button
                className={`text-black p-0 w-[45px] h-[45px] flex items-center justify-center m-1 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] `}
                onClick={() => { setLeftAndRightAreas(v => ({ ...v, left: !v.left })) }}
              >
                {leftAndRightAreas.left ? <RxDoubleArrowLeft className="text-lg" /> : <RxDoubleArrowRight className="text-lg" />}
              </Button>
            </div>
            <div className='flex justify-between w-full'>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className={`${leftAndRightAreas.ai ? 'block' : 'hidden'}`} onClick={() => {
                      localStorage.setItem('writingChat', JSON.stringify([]));
                      setChatContent(() => [])
                      chatMsg.current = [];
                    }}>
                      <MdCleaningServices className="text-lg text-rose-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{CLICK_TO_CLEAR_ALL_CHAT_RECORDS[global.payload.global.language]}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {
                !leftAndRightAreas.ai ?
                  <ShinyButton text="Shiny Button" className={`p-0 w-[45px] h-[45px] m-1 ${leftAndRightAreas.left ? 'hidden' : 'block'}`} onClick={() => { setLeftAndRightAreas(v => ({ ...v, ai: !v.ai })) }}>
                    <RiRobot2Line className="text-lg text-[#8e47f0]" />
                  </ShinyButton> :
                  <Button variant="ghost" className={`${leftAndRightAreas.left ? 'hidden' : 'block'}`} onClick={() => { setLeftAndRightAreas(v => ({ ...v, ai: !v.ai })) }}>
                    <RxDoubleArrowLeft className="text-lg" />
                  </Button>
              }
            </div>
          </div>
          <div className={`p-3 ${leftAndRightAreas.left ? 'block' : 'hidden'} overflow-y-auto custom-scrollbar`} style={{ height: 'calc(100vh - 101px)' }}>
            {onRenderingLeftList()}
          </div>
          <div className={`${leftAndRightAreas.ai ? 'flex' : 'hidden'} flex-col  relative`} style={{ height: 'calc(100vh - 90px)' }}>
            <div className='overflow-y-auto custom-scrollbar h-full mb-3 p-3' ref={chatContainerRef}>
              {
                chatContent.map((item, index) => {
                  return (
                    <div className={`flex py-2 w-full ${index !== (chatContent.length - 1) ? 'border-b' : ''}`} key={`${item.content}_${index}`}>
                      <div className="h-fit mr-3">
                        {item.role === 'user' ? <FaRegUser className='text-lg' /> : <RiRobot2Line className='text-lg' />}
                      </div>
                      <div className={`text-sm rounded-sm p-2 w-full ${item.role === 'user' ? 'bg-[#ffffff]' : 'bg-[#f0efff]'}`}>
                        <ReactMarkdown className="w-full ReactMarkdown break-words">{item.content}</ReactMarkdown>
                      </div>
                    </div>
                  )
                })
              }
            </div>
            <div className={`flex items-center custom-scrollbar p-3`}>
              <Textarea disabled={chatLoag} value={chartInpt} onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); // 仅阻止默认的换行行为
                  setTimeout(() => {
                    const dom = window.document.getElementById("chatBut");
                    if (dom) dom.click();
                  }, 10);
                }
              }} onChange={(e) => { setChartInpt(e.target.value) }} />
              <div id="chatBut" onClick={() => { onChat() }} >
                {chatLoag ?
                  <Loader2 className="animate-spin ml-2 text-[#8e47f0]" style={{ width: 20, height: 20 }} /> :
                  <MdSend className="text-[28px] cursor-pointer ml-2 text-[#8e47f0]" />
                }
              </div>
            </div>
          </div>
        </div>

        {/* 写作区 */}
        <div className="mx-auto w-full h-full relative">
          <div className="mx-auto w-full flex h-full relative">
            <TailwindAdvancedEditor
              language={global.payload.global.language}
              onEditorCreate={(editor) => {
                setEditorInstance(editor);
              }}
              className={`mx-auto ${global.payload.global.wideLayout ? 'max-w-[1440px]' : 'max-w-[960px]'}`}
            />
            {
              (global.payload.global.translateDualScreen || global.payload.global.rewriteDualScreen) &&
              (<TailwindAdvancedEditorCopy
                className={`mx-auto ${global.payload.global.wideLayout ? 'max-w-[1440px]' : 'max-w-[960px]'}`}
                editorInstance={editorInstance}
                language={global.payload.global.language}
              />)
            }
          </div>
          <PoweredBy language={global.payload.global.language} />
        </div>

        {/* 右边 */}
        <div className={`z-[9998] bg-background sticky top-[48px] flex justify-between flex-col
             ${leftAndRightAreas.right ? 'border-l max-w-[50vw] min-w-[50vw]' : 'min-w-[55px] max-w-[55px] border-r-0'}
               ${global.payload.global.novelSummary || global.payload.global.novelTable ? 'block' : 'hidden'}`
        }
          style={{ height: 'calc(100vh - 48px)' }}
        >
          <div className="flex justify-between items-center pr-3 h-[50px]">
            <div className='flex items-center'>
              <Button
                className={`text-black p-0 w-[45px] h-[45px] flex items-center justify-center m-1 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] `}
                onClick={() => { setLeftAndRightAreas(v => ({ ...v, right: !v.right })) }}
              >
                {leftAndRightAreas.right ? <RxDoubleArrowRight className="text-lg" /> : <RxDoubleArrowLeft className="text-lg" />}
              </Button>
              {leftAndRightAreas.right && (
                <Button variant="ghost" className='p-0 w-[45px] h-[45px] ' onClick={() => { onHandleCopyResult(global.payload.global.novelSummary) }}>
                  <BsCopy />
                </Button>
              )}
            </div>
            {leftAndRightAreas.right && (<span>{{ chinese: '全文总结', english: 'Full text summary', japanese: '全文のまとめ' }[global.payload.global.language]}</span>)}
          </div>
          {
            leftAndRightAreas.right && (
              <div className="h-full">
                <div className={`p-3 h-[50%] w-full overflow-y-auto custom-scrollbar`}>
                  <ReactMarkdown className="w-max ReactMarkdown">{global.payload.global.novelSummary}</ReactMarkdown>
                </div>
                <div className="h-[50%] w-full">
                  <Tabs defaultValue="account" className='h-full'>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="account">{TAB_BRAIN_MAP[global.payload.global.language]}</TabsTrigger>
                      <TabsTrigger value="password">{TAB_TABLE[global.payload.global.language]}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account" className='h-full'  >
                      <div className="relative w-full" style={{ height: '90%' }}>
                        <AlertDialog open={open.brainMap} onOpenChange={() => { setOpen((v) => ({ ...v, brainMap: true })) }}>
                          <AlertDialogTrigger asChild>
                            <div className=' fixed right-2'><MdFullscreen className="text-3xl cursor-pointer text-[#8e47f0]" /></div>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="h-[80%] w-[80%] flex flex-col z-[99999]">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex justify-between w-full items-center">
                                {global.payload.global.novelTitle || UNTITLED[global.payload.global.language]}-{RIGHT_TAB_BRAIN_MAP_TITLE[global.payload.global.language]}
                                <MdClose className=" cursor-pointer text-2xl" onClick={() => { setOpen((v) => ({ ...v, brainMap: false })) }} />
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="border h-full">
                              <MarkmapComponent closeDownload={() => { setDownloadMarkmapType('') }} markdown={onBrainMapData()} type={downloadMarkmapType} />
                            </div>
                            <div onClick={() => setDownloadMarkmapType('jpeg')}>
                              <Button variant="outline" size="sm">{DOWNLOAD[global.payload.global.language]}</Button>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                        <MarkmapComponent closeDownload={() => { setDownloadMarkmapType('') }} markdown={onBrainMapData()} type={downloadMarkmapType} />
                      </div>
                      <Button variant="outline" size="sm" className="ml-3 absolute bottom-2 left-0" onClick={() => setDownloadMarkmapType('jpeg')}>{DOWNLOAD[global.payload.global.language]}</Button>
                    </TabsContent>
                    <TabsContent value="password" className="h-full relative w-full overflow-hidden">
                      <div className="absolute left-0 top-0 w-full overflow-auto custom-scrollbar" style={{ height: 'calc(100% - 100px)' }}>
                        <AlertDialog open={open.table} onOpenChange={() => { setOpen((v) => ({ ...v, table: true })) }}>
                          <AlertDialogTrigger asChild>
                            <div className=' fixed right-2'><MdFullscreen className="text-3xl cursor-pointer text-[#8e47f0]" /></div>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="h-[80%] w-[80%] flex flex-col z-[99999]">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex justify-between w-full items-center">
                                {global.payload.global.novelTitle || UNTITLED[global.payload.global.language]}-{RIGHT_TAB_TABLE_TITLE[global.payload.global.language]}
                                <MdClose className=" cursor-pointer text-2xl" onClick={() => { setOpen((v) => ({ ...v, table: false })) }} />
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="border h-full p-3 custom-scrollbar  overflow-auto">
                              {onRenderingTable(global.payload.global.novelTable)}
                            </div>
                            <div>
                              <Button className="mr-3" variant="secondary" size="sm" onClick={() => { onHandleCopyResult(global.payload.global.novelTable) }}>{COPY_CSV[global.payload.global.language]}</Button>
                              <Button variant="outline" size="sm" onClick={() => { onDownloadTable(global.payload.global.novelTable) }}>{DOWNLOAD[global.payload.global.language]}</Button>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                        <div className="p-2 w-full ">
                          {onRenderingTable(global.payload.global.novelTable)}
                        </div>
                      </div>
                      <div className="h-[50px] absolute left-3 bottom-[40px] ">
                        <Button className="mr-3" variant="secondary" size="sm" onClick={() => { onHandleCopyResult(global.payload.global.novelTable) }}>{COPY_CSV[global.payload.global.language]}</Button>
                        <Button variant="outline" size="sm" onClick={() => { onDownloadTable(global.payload.global.novelTable) }}>{DOWNLOAD[global.payload.global.language]}</Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div >
  );
}
