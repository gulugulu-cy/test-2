"use client";
import { defaultEditorContent } from "@/lib/content";
import { EditorContent, EditorRoot, type EditorInstance, type JSONContent, } from "novel";
import { ImageResizer, handleCommandNavigation } from "novel/extensions";
import { useEffect, useState } from "react";
import { defaultExtensions } from "./extensions";
import { handleImageDrop, handleImagePaste } from "novel/plugins";
import { uploadFn } from "./image-upload";
import { slashCommand } from "./slash-command";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setGlobalState } from "@/app/store/globalSlice";
import Highlight from '@tiptap/extension-highlight';
import DualScreenButton from "./DualScreenButton";
import { toast } from "./ui/use-toast";
import { getAuthLocalStorage, getLocalStorage } from "@/lib/utils";
import { ErrMessage } from "@/app/componets/ErrMessage";
import React from "react";
import ky from "ky";
import { Loader2 } from "lucide-react";
import { SUMMARY_LOADING } from "@/lib/language";

const extensions = [...defaultExtensions, slashCommand, Highlight.configure({ multicolor: true })];

interface IProps { className: string, editorInstance: EditorInstance | null, language: 'chinese' | 'english' | 'japanese' }
const TailwindAdvancedEditorCopy = (props: IProps) => {
  const dispatch = useAppDispatch()
  const [lingo, setLingo] = useState('')
  const [title, setTitle] = useState('');
  const [load, setLoad] = useState(false);
  const [butDisabled, setButDisabled] = useState(true);
  const global = useAppSelector(setGlobalState);
  const [controller, setController] = useState(null);
  const { className, language, editorInstance } = props;
  const [initialContent, setInitialContent] = useState<null | JSONContent>(null);
  const [editorInstanceCopy, setEditorInstanceCopy] = useState<EditorInstance | null>(null);
  const [allTranslateStatus, setAllTranslateStatus] = useState(1);
  const [saveNumber, setSaveNumber] = useState(-1);

  useEffect(() => {
    setInitialContent(defaultEditorContent);
  }, []);

  useEffect(() => {
    const { replaceStatus, saveStatus, translateDualScreen } = global.payload.global;
    if (saveStatus) {
      if (controller && saveNumber > 2) {
        controller.abort();
      }
      setSaveNumber((v) => v + 1)
    } else {
      if (!replaceStatus) {
        dispatch(setGlobalState({ replaceStatus: true }))
      }

      if (saveNumber > 2 && replaceStatus && editorInstance && editorInstanceCopy && translateDualScreen) {
        setSaveNumber(1)
        if (allTranslateStatus === 1) {
          editorInstanceCopy.chain().clearContent().run();
          onGenerateContentOrTitle()
          return;
        }
        // 获取当前操作的内容和下标
        const state = editorInstance.state;
        const selection = state.selection;
        // 获取当前选区所在的块（block）
        const resolvedPos = state.doc.resolve(selection.anchor);
        // @ts-ignore
        const blockIndex = resolvedPos.path[1]; // 获取块的下标
        const blockNode = state.doc.child(blockIndex);
        const markdown = editorInstance.storage.markdown.getMarkdown()
        const markdownBlocks = markdown.split('\n\n');
        // 获取当前块的 Markdown 数据
        const blockContent = markdownBlocks[blockIndex];
        if (!blockContent) return;
        const updateBlockContent = (blockIndex) => {
          const { state } = editorInstanceCopy;
          // 获取文档的内容
          const doc = state.doc;
          // 获取块的节点
          let [from, to] = [0, 0];
          for (let i = 0; i < blockIndex; i++) {
            from += doc.child(i).nodeSize;
          }
          // 计算块的结束位置 (to)
          if (doc.childCount > blockIndex) {
            const blockNode = doc.child(blockIndex);
            to = from + blockNode.nodeSize;
          }
          console.log(from, to, blockContent);
          onGenerateContentOrTitle(lingo, { from, to, blockContent })
        };
        updateBlockContent(blockIndex)
      }
    }
  }, [global.payload.global.saveStatus])

  useEffect(() => {
    // 确保编辑器内容更新
    if (editorInstanceCopy) {
      editorInstanceCopy.commands.setContent(initialContent || []);
      const title = localStorage.getItem('novel-title')
      setTitle(title)
    }
  }, [initialContent]);

  useEffect(() => {
    if ((global.payload.global.translateDualScreen || global.payload.global.rewriteDualScreen) && editorInstanceCopy) {
      setSaveNumber(1)
      if (controller) {
        controller.abort()
      }
      setTimeout(() => {
        editorInstanceCopy.chain().clearContent().run();
        onGenerateContentOrTitle()
      }, 10)
    }
  }, [global.payload.global.translateDualScreen, global.payload.global.rewriteDualScreen, global.payload.global.freeRewritingStatus, global.payload.global.translateDualLanguage, editorInstanceCopy])

  const onGenerateContentOrTitle = async (lingo?: string, position?: { from: number, to: number, blockContent: string }) => {
    setLoad(true);
    let [name, lang, content] = ['', '', ''];
    const { api_key, model_name, region, translateDualLanguage, language } = global.payload.global
    let allTranslate = 1;
    const onreq = async (params: any, title?: boolean) => {
      const newController = new AbortController();
      setController(newController);
      let model = language === 'chinese' ? 'deepseek-chat' : 'gpt-4o-2024-08-06';
      const data = {
        name,
        params,
        api_key: api_key || getAuthLocalStorage(window, "api_key") || "",
        model: model_name || getAuthLocalStorage(window, "model_name") || model,
      }
      if (!params.content) return;
      try {
        const res = await ky('/api/generateWriting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data }),
          signal: newController.signal,
          timeout: false
        })
        if (res?.body && res.ok) {
          const temp: any = await res.json();
          if (temp?.data) {
            if (temp?.data.choices[0]?.message?.content && editorInstanceCopy) {
              const output = temp.data.choices[0].message.content;
              const endPosition = editorInstanceCopy.state.doc.content.size;
              const data = output.replace(/(\r\n|\n|\r)/gm, "");
              if (position) {
                if (position.to < 1) {
                  editorInstanceCopy.chain().focus().insertContentAt(position.from, data).run();
                } else {
                  editorInstanceCopy.chain().focus().insertContentAt({ ...position }, data).run();
                }
              } else if (title) {
                setTitle(output)
                setSaveNumber(0)
              } else {
                editorInstanceCopy.chain().focus().insertContentAt(endPosition - 2, language ? data : output).run();
              }
              toast({
                duration: 2000,
                description: ({ chinese: '加载完成', english: 'Loading completed', japanese: 'ロード完了' }[language])
              })
            }
          }
        } else {
          try {
            const resJson: any = await res.json();
            allTranslate = -1
            if (resJson?.error?.err_code) {
              toast({
                duration: 2000,
                description: (ErrMessage(resJson?.error.err_code, language, region))
              })
              return;
            }
          } catch (error) {
            allTranslate = -1
            toast({
              duration: 2000,
              description: (ErrMessage(0, language, region))
            })
          }
        }
      } catch (error) {
        if (error?.name === 'AbortError') {
          if (allTranslateStatus) {
            allTranslate = -1
          }
          return;
        }
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
      }
    }

    if (global.payload.global.rewriteDualScreen) {
      name = global.payload.global.freeRewritingText ? 'free rewriting' : 'rewrite';
      content = getLocalStorage('markdown')
      const title = localStorage.getItem('novel-title')
      setTitle(title)
      await onRewriteDualScreen({ content, tips: global.payload.global.freeRewritingText }, name)
      if (allTranslate !== -1) {
        setAllTranslateStatus(0)
      }
    }
    if (global.payload.global.translateDualScreen) {
      setButDisabled(true)
      editorInstance.setEditable(false)
      name = 'translate';
      lang = lingo || translateDualLanguage
      if (position) {
        await onreq({ content: position.blockContent, language: lang })
      } else {
        setTitle('')
        // 翻译标题
        const title = localStorage.getItem('novel-title')
        if (title) {
          await onreq({ content: title, language: lang }, true)
        }
        const contentData = editorInstance.storage.markdown.getMarkdown()
        await onRewriteDualScreen({ content: contentData, language: lang }, name)
        setAllTranslateStatus(0)
      }
      setButDisabled(false)
      setLoad(false);
      editorInstance.setEditable(true)
      setSaveNumber(1)
    }
  }

  // 全文改写
  const onRewriteDualScreen = async (params: any, name) => {
    const { api_key, model_name } = global.payload.global
    setSaveNumber(0)
    setButDisabled(true)
    editorInstance.setEditable(false)
    let model = language === 'chinese' ? 'deepseek-chat' : 'gpt-4o-2024-08-06';
    const data = {
      name,
      params,
      api_key: api_key || getAuthLocalStorage(window, "api_key") || "",
      model: model_name || getAuthLocalStorage(window, "model_name") || model,
    }
    let outputData = '';
    try {
      const newController = new AbortController();
      setController(newController);
      const res = await ky('/api/generateWritingStream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data }),
        timeout: false,
        signal: newController.signal,
      })
      if (res?.body && res.ok) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let partialData = '';
        const read = async () => {
          const readerRead = await reader.read();
          const { done, value } = readerRead;
          if (done) {
            setLoad(false);
            setButDisabled(false)
            editorInstance.setEditable(true)
            setSaveNumber(1)
            toast({
              duration: 2000,
              description: ({ chinese: '加载完成', english: 'Loading completed', japanese: 'ロード完了' }[language])
            })
            setTimeout(() => {
              window.scrollTo({
                top: 0,
                behavior: 'smooth', // 平滑滚动
              });
            }, 10)
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
                  const endPosition = editorInstanceCopy.state.doc.content.size;
                  if (!outputData.endsWith('-')) {
                    editorInstanceCopy
                      .chain()
                      .focus()
                      .insertContentAt({ from: 0, to: endPosition }, outputData)
                      .run();
                    setSaveNumber(0)
                  }
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
            setLoad(false);
            editorInstance.setEditable(true)
            setSaveNumber(1)
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
          setLoad(false);
          editorInstance.setEditable(true)
          setSaveNumber(1)
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
      setLoad(false);
      editorInstance.setEditable(true)
      setSaveNumber(1)
      // setLoad(false);
      setButDisabled(false)
      // editorInstance.setEditable(true)
      // setSaveNumber(1)
      // return;
    }
  }

  if (!initialContent) return null;

  return (
    <div className={`relative w-full border-l`} style={{ height: 'revert' }}>
      <EditorRoot>
        {load && (<div className='sticky mr-3 top-[50px] flex justify-end items-center z-[9999] text-[#8e47f0] text-sm'>
          {SUMMARY_LOADING[language]}
          <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
        </div>)}
        <div className={`${className} px-[35px] pt-[5px] pb-[25px] flex items-center  shadow-none`}>
          <p className="text-3xl font-bold border-0">{title}</p>
        </div>
        <EditorContent
          initialContent={initialContent}
          extensions={extensions}
          editable={false}
          injectCSS={true}
          className={`editorInstanceCopy relative w-full border-muted bg-background ${className} editorContent shadow-none`}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onCreate={({ editor }) => {
            setEditorInstanceCopy(editor)
          }}
          onUpdate={({ editor }) => {
            setEditorInstanceCopy(editor)
          }}
          slotAfter={<ImageResizer />}
        >
          {!butDisabled ?
            <DualScreenButton
              language={language}
              title={title}
              editorInstanceCopy={editorInstanceCopy}
              editorInstance={editorInstance}
              onRegenerate={(lingo?: string) => {
                if (editorInstanceCopy) {
                  setLingo(lingo)
                  setTitle('')
                  editorInstanceCopy.chain().clearContent().run();
                  setAllTranslateStatus(1)
                  setSaveNumber(0)
                  if (global.payload.global.rewriteDualScreen) {
                    onGenerateContentOrTitle()
                  }
                }
              }} />
            : <></>
          }
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default TailwindAdvancedEditorCopy;
