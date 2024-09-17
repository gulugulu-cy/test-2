"use client";

import { Command, CommandInput } from "@/components/tailwind/ui/command";
import { useCompletion } from "ai/react";
import { useEditor } from "novel";
import { addAIHighlight } from "novel/extensions";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { Button } from "../ui/button";
import CrazySpinner from "../ui/icons/crazy-spinner";
import Magic from "../ui/icons/magic";
import { ScrollArea } from "../ui/scroll-area";
import AISelectorCommands from "./ai-selector-commands";
import { IoIosRefresh } from "react-icons/io";
import { LuReplace } from "react-icons/lu";
import { TbRowInsertBottom } from "react-icons/tb";
import { FaRegCopy } from "react-icons/fa";
import { toast } from "../ui/use-toast";
import { AI_IS_THINKING, COPY2, COPY_ERROR, COPY_SUCCESSFUL, GENERATING_IN_PROGRESS, INSERT, QUICK_MODIFICATION, REGENERATE, REPLACE } from "@/lib/language";
import { IoMdSend } from "react-icons/io";
import AudioPlayer from "./ai-sound-playback";
import { useAppSelector } from "@/app/store/hooks";
import { setGlobalState } from "@/app/store/globalSlice";
import { getAuthLocalStorage } from "@/lib/utils";
import { ErrMessage } from "@/app/componets/ErrMessage";
//TODO: I think it makes more sense to create a custom Tiptap extension for this functionality https://tiptap.dev/docs/editor/ai/introduction

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISelector({ onOpenChange }: AISelectorProps) {
  const { editor } = useEditor();
  const global = useAppSelector(setGlobalState)
  const [inputValue, setInputValue] = useState("");
  const [submitValue, setSubmitValue] = useState<{ value: string, params: any }>({ value: '', params: {} })

  const { completion, complete, setCompletion, isLoading } = useCompletion({
    id: "novel",
    api: "/api/generate",
    onResponse: async (response) => {
      if (response.status === 429) {
        onToast('You have reached your request limit for the day.')
        return;
      }
      if (!response.ok) {
        // 尝试从响应中解析错误信息
        try {
          const errorData = await response.json();
          console.log('errorData', errorData, errorData.err_code);

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
    onError: (e) => {
      // onToast(e.message)
      // toast({
      //   duration: 2000,
      //   description: (ErrMessage(0, global.payload.global.language, global.payload.global.region))
      // })
    },
  });

  useEffect(() => {
    return () => {
      setCompletion(""); // 清空生成的值
      setSubmitValue({ value: '', params: {} })
    };
  }, []);

  const hasCompletion = completion.length > 0;

  // 复制
  const onHandleCopyResult = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        onToast(COPY_SUCCESSFUL['chinese'])
      })
      .catch(err => {
        onToast(COPY_ERROR['chinese'])
      });
  }

  // 替换
  const onReplace = () => {
    const selection = editor.view.state.selection;
    editor
      .chain()
      .focus()
      .insertContentAt(
        {
          from: selection.from,
          to: selection.to,
        },
        completion,
      )
      .run();
  }

  // 插入
  const InsertBelow = () => {
    const selection = editor.view.state.selection;
    editor
      .chain()
      .focus()
      .insertContentAt(selection.to + 1, completion)
      .run();
  }

  // 重新生成
  const onRegenerate = () => {
    setCompletion(""); // 清空上一次的生成内容
    let model = global.payload.global.language === 'chinese' ? 'deepseek-chat' : 'gpt-4o-2024-08-06';
    complete(submitValue.value, {
      body: {
        ...submitValue.params,
        api_key: global.payload.global.api_key || getAuthLocalStorage(window, "api_key") || "",
        model: global.payload.global.model_name || getAuthLocalStorage(window, "model_name") || model,
      }
    }); // 调用 complete 重新生成
  }

  const onToast = (description: string) => {
    toast({ duration: 2000, description })
  }

  return (
    <Command className="md:w-[450px] w-screen">
      {hasCompletion && submitValue.params?.body?.type !== 'reading aloud' && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="prose p-2 px-4 prose-sm">
              <Markdown>{completion}</Markdown>
            </div>
          </ScrollArea>
        </div>
      )}

      {isLoading && (
        <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-muted-foreground text-purple-500">
          <Magic className="mr-2 h-4 w-4 shrink-0  " />
          {AI_IS_THINKING[global.payload.global.language]}
          <div className="ml-2 mt-1">
            <CrazySpinner />
          </div>
        </div>
      )}
      {
        !isLoading && !hasCompletion && submitValue.params?.body?.type !== 'reading aloud' && (
          <AISelectorCommands onSelect={(value, option) => {
            console.log('============', option, value);

            setSubmitValue({ value, params: { ...option } })
            if (option.type !== 'reading aloud') {
              complete(value, {
                body: {
                  ...option,
                  api_key: global.payload.global.api_key || getAuthLocalStorage(window, "api_key") || "",
                  model: global.payload.global.model_name || getAuthLocalStorage(window, "model_name") || "deepseek-chat",
                }
              })
            }
          }} />
        )
      }
      {
        submitValue.params?.body?.type !== 'reading aloud' && (
          <div className="relative">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              placeholder={QUICK_MODIFICATION[global.payload.global.language]}
            // onFocus={() => addAIHighlight()}
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-900"
              onClick={() => {
                let model = global.payload.global.language === 'chinese' ? 'deepseek-chat' : 'gpt-4o-2024-08-06';
                if (completion) {
                  setSubmitValue({ value: completion, params: { type: "free rewriting", command: inputValue } })
                  return complete(completion, {
                    body: {
                      type: "free rewriting",
                      command: inputValue,
                      api_key: global.payload.global.api_key || getAuthLocalStorage(window, "api_key") || "",
                      model: global.payload.global.model_name || getAuthLocalStorage(window, "model_name") || model,
                    },
                  })
                }
                const slice = editor.state.selection.content();
                const text = editor.storage.markdown.serializer.serialize(slice.content);
                setSubmitValue({ value: text, params: { type: "free rewriting", command: inputValue } })
                complete(text, {
                  body: {
                    type: "free rewriting",
                    command: inputValue,
                    api_key: global.payload.global.api_key || getAuthLocalStorage(window, "api_key") || "",
                    model: global.payload.global.model_name || getAuthLocalStorage(window, "model_name") || model,
                  },
                })
              }}
            >
              <IoMdSend />
            </Button>
          </div>
        )
      }
      {
        !isLoading && hasCompletion && (
          <div className="flex justify-between ml-2 my-3">
            {
              submitValue?.params?.type !== 'free rewriting' && (
                <Button size="sm" className="text-sm" onClick={onRegenerate}><IoIosRefresh className="mr-2" />{REGENERATE[global.payload.global.language]}</Button>
              )
            }
            <div className={`${submitValue?.params?.type === 'free rewriting' && 'flex w-full justify-between'}`}>
              <Button size="sm" className="text-sm mr-2" onClick={onReplace}><LuReplace className="mr-2" />{REPLACE[global.payload.global.language]}</Button>
              <Button size="sm" className="text-sm mr-2" onClick={InsertBelow}><TbRowInsertBottom className="mr-2" />{INSERT[global.payload.global.language]}</Button>
              <Button size="sm" className="text-sm mr-2" onClick={() => { onHandleCopyResult(completion) }}><FaRegCopy className="mr-2" />{COPY2[global.payload.global.language]}</Button>
            </div>
          </div>
        )
      }
      {
        submitValue.params?.type === 'reading aloud' && (
          <AudioPlayer text={submitValue.value} />
        )
      }
      <div >
      </div>
    </Command>
  );
}
