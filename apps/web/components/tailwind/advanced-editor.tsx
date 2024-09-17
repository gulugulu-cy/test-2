"use client";

const hljs = require('highlight.js');

import ky from 'ky';
import dayjs from 'dayjs';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { Loader2 } from 'lucide-react';
import { uploadFn } from "./image-upload";
import { Separator } from "./ui/separator";
import LoadAnimation from './LoadAnimation';
import { defaultExtensions } from "./extensions";
import { PiMagicWandFill } from "react-icons/pi";
import { getAuthLocalStorage } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import Highlight from '@tiptap/extension-highlight';
import { useDebouncedCallback } from "use-debounce";
import { defaultEditorContent } from "@/lib/content";
import { TextButtons } from "./selectors/text-buttons";
import { ErrMessage } from "@/app/componets/ErrMessage";
import { NodeSelector } from "./selectors/node-selector";
import { setGlobalState } from "@/app/store/globalSlice";
import { ColorSelector } from "./selectors/color-selector";
import { ContentAction } from "./selectors/content.action";
import FindAndReplace from "@/app/componets/FindAndReplace";
import { slashCommand, suggestionItems } from "./slash-command";
import { handleImageDrop, handleImagePaste } from "novel/plugins";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { ImageResizer, handleCommandNavigation, Placeholder, type SuggestionItem, addAIHighlight, removeAIHighlight } from "novel/extensions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { AI_GENERATED_TITLE_TOOLTIP, AI_WRITING_COMPLETED, AI_WRITING_TIPS, APPLY, COPAI_GENERATED_COMTENT_TOOLTIPY, EDITOR_PLACEHOLDER, GENERATION_COMPLETED, GENERATION_CONTENT, GENERATION_TITLE, QUICK_INSERT_MENU, QUICK_MODIFICATION, REGENERATE, TITLE_PLACEHOLDER, WRITING } from "@/lib/language";
import { EditorCommand, EditorCommandEmpty, EditorCommandItem, EditorCommandList, EditorContent, EditorRoot, type EditorInstance, type JSONContent, } from "novel";
import { TextSelection } from 'prosemirror-state';
// import highlightFocusedLine from './highlightFocusedLine';
import { MdClose, MdSend } from 'react-icons/md';

const extensions = [...defaultExtensions, slashCommand, Highlight.configure({ multicolor: true })];

interface IProps { className: string, language: 'chinese' | 'english' | 'japanese', onEditorCreate }

const TailwindAdvancedEditor = (props: IProps) => {
  const dispatch = useAppDispatch()
  const global = useAppSelector(setGlobalState)
  const { className, language, onEditorCreate } = props;

  const inputRef = useRef(null);
  const editorRef = useRef(null);
  const [openAI, setOpenAI] = useState(false);
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [initialContent, setInitialContent] = useState<null | JSONContent>(null);
  const [editorInstance, setEditorInstance] = useState<EditorInstance | null>(null);
  const [quickInsertion, setQuickInsertion] = useState({ content: '', sub: 0, empty: true, request: '' });
  const [load, setLoad] = useState({ titleLoad: false, contentLoad: false, loading: false });
  const [selectView, setSelectView] = useState({ from: 0, to: 0 })
  const [insertContent, setInsertContent] = useState('')
  const [openAiQuickInsertion, setOpenAiQuickInsertion] = useState({ open: false, isLoad: false })
  const [popupPosition, setPopupPosition] = useState({ left: 0, top: 0 })

  // 确保编辑器内容更新
  useEffect(() => {
    if (editorInstance) {
      editorInstance.commands.setContent(initialContent);
    }
  }, [initialContent]);

  useEffect(() => {
    const handleClick = (event) => {
      const dragHandle = event.target.closest('.drag-handle');
      if (dragHandle && editorInstance) {
        // 获取当前点击位置的坐标
        const rect = dragHandle.getBoundingClientRect();
        const coords = {
          left: rect.left,
          top: rect.top,
        };
        const posAt = editorInstance.view.posAtCoords(coords);
        if (!posAt) return;
        const resolvedPos = editorInstance.state.doc.resolve(posAt.pos);
        // @ts-ignore
        const blockIndex = resolvedPos.path[1]; // 获取块的下标
        const blockNode = editorInstance.state.doc.child(blockIndex);
        const selection = TextSelection.create(editorInstance.state.doc, posAt.pos, blockNode.nodeSize - 1 + posAt.pos);
        setSelectView({ from: posAt.pos, to: blockNode.nodeSize - 1 + posAt.pos });
        const tr = editorInstance.state.tr.setSelection(selection).scrollIntoView();
        // 使用 dispatch 来应用选择并更新编辑器状态
        editorInstance.view.dispatch(tr);
        editorInstance.view.focus();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [editorInstance]);

  // 监听 language 变化
  useEffect(() => {
    // 如果存在旧的编辑器实例，销毁它
    if (editorInstance) {
      // 更新 Placeholder 插件的配置
      const placeholderPlugin = editorInstance.extensionManager.extensions.find(
        (extension) => extension.name === 'placeholder'
      );
      if (placeholderPlugin) {
        // 这里通过重新配置来更新占位符内容
        placeholderPlugin.options.placeholder = EDITOR_PLACEHOLDER[language];
        // 强制触发插件重新渲染
        editorInstance.view.dispatch(
          editorInstance.view.state.tr.setMeta('placeholder', true)
        );
      }
    }
  }, [language]);

  // 设置初始值
  useEffect(() => {

    // if (global.payload.global.renew) {
    const content = window.localStorage.getItem("novel-content");
    const novelTitle = window.localStorage.getItem("novel-title");
    if (content) {
      const json = JSON.parse(content);
      setInitialContent(json)
      dispatch(setGlobalState({ novelContent: json, novelTitle: novelTitle || '' }))
    } else {
      setInitialContent(defaultEditorContent);
      window.localStorage.setItem("novel-title", '');
      window.localStorage.setItem("novel-id", `${dayjs().valueOf()}`);
      window.localStorage.setItem("createdAt", dayjs().format('YYYY-MM-DD HH:mm:ss'));
    };
    //   dispatch(setGlobalState({ renew: false }))
    // }
  }, [global.payload.global.renew]);

  // 监听CTRL + F 打开查询窗口
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && ['f', 'F'].includes(event.key)) {
        const findAndReplaceVisible = global.payload.global.findAndReplaceVisible
        dispatch(setGlobalState({ findAndReplaceVisible: !findAndReplaceVisible }))
        event.preventDefault(); // 防止浏览器默认的查找行为
      }
      if (editorInstance) {
        if (event.ctrlKey && ['z', 'Z'].includes(event.key)) {
          console.log('===========>>>');
          event.preventDefault(); // 防止浏览器默认的查找行为
          editorInstance.chain().undo().run()
          const { titleRecord, novelTitle } = global.payload.global
          console.log(titleRecord);
          if (titleRecord.status) {
            localStorage.setItem('novel-title', titleRecord.oldTitle)
            dispatch(setGlobalState({ novelTitle: titleRecord.oldTitle, titleRecord: { oldTitle: '', status: false } }))
          }
          event.preventDefault(); // 防止浏览器默认的查找行为
        }
        if (event.ctrlKey && ['y', 'Y'].includes(event.key)) {
          editorInstance.chain().redo().run()
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [global.payload.global.findAndReplaceVisible, editorInstance, global.payload.global.novelTitle]);

  useEffect(() => {
    if (openAiQuickInsertion.open && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0); // 延迟0m
    }
    if (global.payload.global.editorStatus) {
      setOpenAiQuickInsertion({ open: false, isLoad: false })
      setInsertContent(() => '')
      setQuickInsertion({ content: '', sub: 0, empty: true, request: '' })
      dispatch(setGlobalState({ editorStatus: false }))
    }
  }, [openAiQuickInsertion.open, global.payload.global.editorStatus])

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

  // 存储数据
  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    const json = editor.getJSON();
    window.localStorage.setItem("novel-content", JSON.stringify(json));
    window.localStorage.setItem("markdown", editor.storage.markdown.getMarkdown());
    window.localStorage.setItem("html-content", highlightCodeblocks(editor.getHTML()));
    window.localStorage.setItem("txt-content", editor.getText());
    dispatch(setGlobalState({ saveStatus: false, novelContent: json, markdown: editor.storage.markdown.getMarkdown() }))
  }, 500);

  const onGenerateContentOrTitle = async () => {
    if (load.contentLoad) return;
    let [name, content, outputData] = ['', '', ''];
    if (global.payload.global.novelTitle) {
      name = 'generate content';
      content = global.payload.global.novelTitle;
      setLoad({ titleLoad: true, contentLoad: true, loading: true });
    }
    if (editorInstance?.getText()) {
      name = 'generate title';
      content = editorInstance.getText();
      setLoad((v) => ({ ...v, titleLoad: true, contentLoad: true }));
    }
    editorInstance.setEditable(false)
    const { api_key, model_name, region } = global.payload.global
    let model = language === 'chinese' ? 'deepseek-chat' : 'gpt-4o-2024-08-06';
    const data = {
      name,
      params: { content },
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

        const read = async () => {
          const readerRead = await reader.read();
          const { done, value } = readerRead;
          if (done) {
            if (name === 'generate title') { window.localStorage.setItem("novel-title", outputData); }
            toast({
              duration: 2000,
              description: `${name === 'generate title' ? GENERATION_TITLE[language] : GENERATION_CONTENT[language]} ${GENERATION_COMPLETED[language]}`
            })
            editorInstance.setEditable(true)
            setLoad({ titleLoad: false, contentLoad: false, loading: false });
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
                  outputData = outputData + parsedData.content;
                  if (name === 'generate content') {
                    const endPosition = editorInstance.state.doc.content.size;
                    setLoad((v) => ({ ...v, loading: false }));
                    if (!outputData.endsWith('-')) {
                      editorInstance
                        .chain()
                        .focus()
                        .insertContentAt({ from: 0, to: endPosition }, outputData)
                        .run();
                      window.scrollTo({
                        top: document.documentElement.scrollHeight,
                        behavior: 'smooth'
                      });
                    }
                  } else {
                    dispatch(setGlobalState({ novelTitle: outputData.replace(/^#/, "") }))
                  }
                }
              } catch (e) {
                // console.log('==============e', e, outputData);
                // editorInstance.setEditable(true)
                // toast({
                //   duration: 2000,
                //   description: (ErrMessage(0, language, global.payload.global.region))
                // })
                // setLoad({ titleLoad: false, contentLoad: false, loading: false });
              }
            }
          });
          await read();
        }
        await read();
      } else {
        try {
          const resJson: any = await res.json();
          console.log('==============e', resJson);
          if (resJson?.error?.err_code) {
            toast({
              duration: 2000,
              description: (ErrMessage(resJson?.error.err_code, language, region))
            })
            return;
          }
          editorInstance.setEditable(true)
          setLoad({ titleLoad: false, contentLoad: false, loading: false });
        } catch (error) {
          console.log('==============e', error);
          toast({
            duration: 2000,
            description: (ErrMessage(0, language, region))
          })
          setLoad({ titleLoad: false, contentLoad: false, loading: false });
          editorInstance.setEditable(true)
        }
      }
    } catch (error) {
      // console.log('==============e', error);
      // toast({
      //   duration: 2000,
      //   description: (ErrMessage(0, language, region))
      // })
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
      setLoad({ titleLoad: false, contentLoad: false, loading: false });
      editorInstance.setEditable(true)
    }
  }

  // 快速插入
  const onQuickInsertion = async (iten?: SuggestionItem) => {
    const { api_key, model_name } = global.payload.global
    const newController = new AbortController();
    let model = language === 'chinese' ? 'deepseek-chat' : 'gpt-4o-2024-08-06';
    const data = {
      name: 'quick insertion',
      params: { ...quickInsertion, title: global.payload.global.novelTitle, request: quickInsertion.request },
      api_key: api_key || getAuthLocalStorage(window, "api_key") || "",
      model: model_name || getAuthLocalStorage(window, "model_name") || model,
    }
    let outputData = '';
    try {
      const res = await ky('/api/generateWritingStream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data }),
        signal: newController.signal,
        timeout: false
      })
      if (res?.body && res.ok) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let partialData = '';

        const read = async () => {
          const readerRead = await reader.read();
          const { done, value } = readerRead;
          if (done) {
            toast({
              duration: 2000,
              description: (AI_WRITING_COMPLETED[language])
            })
            setOpenAiQuickInsertion((v) => ({ ...v, isLoad: false }))
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
                  outputData = outputData + parsedData.content;
                  setInsertContent(outputData)
                }
              } catch (e) {
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
            toast({
              duration: 2000,
              description: (ErrMessage(resJson?.error.err_code, language, global.payload.global.region))
            })
            setOpenAiQuickInsertion((v) => ({ ...v, isLoad: false }))
            return;
          }
        } catch (error) {
          toast({
            duration: 2000,
            description: (ErrMessage(0, language, global.payload.global.region))
          })
          setOpenAiQuickInsertion((v) => ({ ...v, isLoad: false }))
        }
      }
    } catch (error) {
      // toast({
      //   duration: 2000,
      //   description: (ErrMessage(0, language, global.payload.global.region))
      // })
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
      setOpenAiQuickInsertion((v) => ({ ...v, isLoad: false }))
    }
  }

  // 替换快速生成的数据
  const ReplaceQuicklyGeneratedData = () => {
    editorInstance.chain().focus().insertContentAt({ from: quickInsertion.sub, to: quickInsertion.sub + 1 }, insertContent).run();
    setOpenAiQuickInsertion({ open: false, isLoad: false })
    setInsertContent(() => '')
    setQuickInsertion({ content: '', sub: 0, empty: true, request: '' })
  }

  useEffect(() => {
    if (editorInstance && !editorInstance?.isEditable) {
      setLoad((v) => ({ ...v, titleLoad: true, contentLoad: true, }))
    } else {
      setLoad((v) => ({ ...v, titleLoad: false, contentLoad: false, }))
    }
  }, [editorInstance?.isEditable])

  useEffect(() => {
    if (editorInstance) {
      const { view } = editorInstance;
      // 保存当前选择
      view.dom.addEventListener('mouseup', (event) => {
        const selection = document.getSelection();
        if (selection && selection.rangeCount > 0 && editorInstance?.isEditable) {
          const slice = editorInstance.state.selection.content();
          const text = editorInstance.storage.markdown.serializer.serialize(slice.content);
          removeAIHighlight(editorInstance)
          addAIHighlight(editorInstance, '#a800ff5c')
          dispatch(setGlobalState({ chatSelectText: text }))
        }
      });
    }

  }, [editorInstance])

  if (!initialContent) return null;
  return (
    <div className={`relative w-full h-full`}>
      <EditorRoot>
        <div className={`${className} py-3 px-7 flex items-center shadow-none`}>
          <Input
            type="text"
            value={global.payload.global.novelTitle}
            disabled={load.contentLoad}
            onChange={(e) => {
              dispatch(setGlobalState({ novelTitle: e.target.value }))
              window.localStorage.setItem("novel-title", e.target.value);
            }}
            placeholder={TITLE_PLACEHOLDER[language]}
            className="text-3xl font-bold h-16 border-0"
          />
          {((!editorInstance?.getText() && global.payload.global.novelTitle) ||
            (!global.payload.global.novelTitle && editorInstance?.getText())) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant='ghost' disabled={load.contentLoad} className="text-[#8e47f0] rounded-[100%] w-12 h-12" onClick={onGenerateContentOrTitle}>
                      {
                        load.titleLoad ? <Loader2 className="animate-spin" style={{ width: 20, height: 20 }} />
                          : <PiMagicWandFill className="text-lg" />
                      }
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {editorInstance?.getText() && (<p>{AI_GENERATED_TITLE_TOOLTIP[language]}</p>)}
                    {global.payload.global.novelTitle && (<p>{COPAI_GENERATED_COMTENT_TOOLTIPY[language]}</p>)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
        </div>
        <EditorContent
          initialContent={initialContent}
          ref={editorRef}
          extensions={[...extensions, Placeholder.configure({ placeholder: EDITOR_PLACEHOLDER[language], includeChildren: true, }),]}
          className={`relative min-h-[100vh] h-full w-full border-muted bg-background ${className} editorContent shadow-none `}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
            handleKeyDown: (view, event) => {
              if (event.key === '/') {
                const state = view.state;
                const selection = state.selection;
                // 获取当前选区的锚点位置
                const anchorPos = selection.anchor;
                // 获取文档开头到当前选区锚点位置之前的所有内容
                const contentBeforeSelection = state.doc.textBetween(0, anchorPos, ' ');
                setQuickInsertion((v) => ({ ...v, content: contentBeforeSelection, sub: anchorPos }))
                // 使用 coordsAtPos 获取锚点位置的坐标
                const coords = view.coordsAtPos(anchorPos);
                // coords.top 和 coords.left 是相对于编辑器视口的坐标
                const { top, left } = coords;
                // 如果你需要相对于整个屏幕的坐标，你可以加上编辑器的偏移量
                const editorRect = editorRef.current.getBoundingClientRect();
                let screenTop = top - editorRect.top;
                let screenLeft = left - editorRect.left - 450;
                console.log('editorRect', editorRect);
                console.log('coords', coords);
                console.log(screenTop, screenLeft);
                // 限制左边界，确保弹窗不超出屏幕
                screenLeft = screenLeft < 0 ? 0 : screenLeft;

                // 获取屏幕的高度和宽度
                // const viewportHeight = window.innerHeight;
                // console.log('viewportHeight', viewportHeight);

                // if (coords.top > 650) {
                //   screenTop = screenTop - 55 - (viewportHeight - 450);
                // }
                setPopupPosition({ left: screenLeft < 0 ? 0 : screenLeft, top: screenTop })
              }
            },
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onCreate={({ editor }) => {
            if (onEditorCreate) {
              setEditorInstance(editor)
              onEditorCreate(editor);
            }
          }}
          onUpdate={({ editor }) => {
            if (onEditorCreate) {
              setEditorInstance(editor)
              onEditorCreate(editor);
            }
            window.localStorage.removeItem("novelTable");
            window.localStorage.removeItem("novelSummary");
            dispatch(setGlobalState({ saveStatus: true, novelTable: '', novelSummary: '' }))
            debouncedUpdates(editor);
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand
            className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all"
            shouldFilter={true}
            vimBindings={true}
            filter={(value: string, search: string) => {
              return Number(value.includes(search));
            }}
          >
            <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
            <EditorCommandList className="w-60">
              {suggestionItems.filter(f => f.title !== 'AI' || quickInsertion.empty).map((item) => {
                return (
                  <EditorCommandItem
                    key={item.title}
                    onCommand={(val) => {
                      if (item.title === 'AI') {
                        const dom = window.document.getElementById(item.title)
                        if (dom) dom.click()
                      }
                      return item.command({ ...val })
                    }}
                    value={QUICK_INSERT_MENU?.[item.title]?.shortcutKeys}
                    className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  >
                    {
                      <div
                        className={
                          `flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm aria-selected:bg-accent 
                           hover:bg-accent ${item.title === 'AI' ? 'text-[#8e47f0] ' : 'text-[#606060]'} aria-selected:bg-accent`
                        }
                        id={item.title}
                        onClick={async () => {
                          if (item.title === 'AI') {
                            setOpenAiQuickInsertion((v) => ({ ...v, open: true }));
                          }
                        }}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                          {item.icon}
                        </div>
                        <div className="font-medium flex justify-between items-center cursor-pointer w-full pr-2 ">
                          <span>{QUICK_INSERT_MENU?.[item.title]?.[language] || item.title}{item.title === 'AI' ? WRITING[language] : ''}</span>
                          <span>{QUICK_INSERT_MENU?.[item.title]?.shortcutKeys}</span>
                        </div>
                      </div>
                    }
                  </EditorCommandItem>
                )
              })}
            </EditorCommandList>
          </EditorCommand>
          <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI} selectView={selectView}>
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} language={language} />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} language={language} />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <Separator orientation="vertical" />
            <ContentAction />
          </GenerativeMenuSwitch>
          {/* 查询窗口 */}
          {global.payload.global.findAndReplaceVisible && (<FindAndReplace language={language} onclose={() => { dispatch(setGlobalState({ findAndReplaceVisible: false })) }} />)}
          {load.loading && (<div className='absolute w-full h-full top-0 left-0 bg-[#00000017] z-[9] flex items-center'><LoadAnimation /></div>)}
          {
            openAiQuickInsertion.open && (
              <div className="absolute border-t text-sm bg-background md:w-[450px] w-full z-[9] rounded-[5px] px-[10px] py-[20px]"
                style={{ top: popupPosition.top + 55, left: popupPosition.left, boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)' }}>
                <MdClose className=" absolute right-0 top-0 cursor-pointer text-2xl" onClick={() => {
                  setOpenAiQuickInsertion({ open: false, isLoad: false })
                  setInsertContent('')
                  setQuickInsertion({ content: '', sub: 0, empty: true, request: '' })
                }} />
                <div className='flex justify-between items-center'>
                  <Input
                    className="border-0 h-8 text-sm "
                    ref={inputRef}
                    placeholder={QUICK_MODIFICATION[language]}
                    readOnly={openAiQuickInsertion.isLoad}
                    autoFocus
                    onChange={(e) => { setQuickInsertion((v) => ({ ...v, request: e.target.value })) }}
                    onKeyDown={(e) => {
                      setTimeout(() => {
                        const dom = window.document.getElementById("freeRewritingBut")
                        if (e?.key === "Enter" && dom) dom.click()
                      }, 10)
                    }}
                  />
                  <div id="freeRewritingBut" onClick={async () => {
                    if (!quickInsertion.request && !quickInsertion.content && !global.payload.global.novelTitle) {
                      toast({
                        duration: 2000,
                        description: AI_WRITING_TIPS[language]
                      })
                      return;
                    }
                    setOpenAiQuickInsertion((v) => ({ ...v, isLoad: true }));
                    setInsertContent(() => '')
                    await onQuickInsertion()
                  }}>
                    {
                      openAiQuickInsertion.isLoad ? <Loader2 className="animate-spin" style={{ width: 20, height: 20 }} />
                        : <MdSend className="text-[20px] cursor-pointer text-[#8e47f0]" />
                    }
                  </div>
                </div>
                {insertContent && (
                  <div className='border mt-2'>
                    <div className='p-2 mb-2 max-h-[65vh] overflow-y-auto custom-scrollbar'>
                      {insertContent.replace(/^#/, "")}
                    </div>
                    <div className='flex justify-end items-center p-2'>
                      <Button size='sm' className='mr-2' onClick={() => ReplaceQuicklyGeneratedData()}>{APPLY[language]}</Button>
                      <Button
                        size='sm'
                        onClick={() => {
                          const dom = window.document.getElementById("freeRewritingBut");
                          if (dom) dom.click()
                        }}
                      >{REGENERATE[language]}</Button>
                    </div>
                  </div>
                )}
              </div>
            )
          }
        </EditorContent>
      </EditorRoot>
    </div >
  );
};

export default TailwindAdvancedEditor;
