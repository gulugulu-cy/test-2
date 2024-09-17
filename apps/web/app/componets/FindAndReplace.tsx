import { useEditor } from "novel";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { MdOutlineCheckBox } from "react-icons/md";
import { Input } from "@/components/tailwind/ui/input";
import { Button } from "@/components/tailwind/ui/button";
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { CASE_SENSITIVITY, ENTER_REPLACEMENT_CONTENT, LOOKUP, LOOKUP_PLACEHOLDER, REGULAR_EXPRESSION, REPLACE, REPLACE_ALL } from "@/lib/language";

interface IProps {
  language: 'chinese' | 'english' | 'japanese',
  onclose: () => void,
}

export default function FindAndReplace(props: IProps) {
  const { editor } = useEditor();
  const { language, onclose } = props;
  const [load, setLoad] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceTetx, setReplaceText] = useState('');
  const [findLocation, setFindLocation] = useState([]);
  const [findLocationIndex, setFindLocationIndex] = useState(0);
  const [checkBox, setCheckBox] = useState({ replace: false, caseSensitivity: false, regularExpression: false })

  const onCheckbox = [
    { name: REPLACE[language], key: 'replace' },
    { name: CASE_SENSITIVITY[language], key: 'caseSensitivity' },
    { name: REGULAR_EXPRESSION[language], key: 'regularExpression' },
  ]

  useEffect(() => {
    if (load && !findLocation.length && findText && editor) {
      findLocationRule(findText);
    }
  }, [load])

  useEffect(() => {
    return () => {
      findLocation.forEach(({ from, to }) => {
        editor.chain().setTextSelection({ from, to }).unsetHighlight().run();
      });
    }
  }, [findLocation])

  useEffect(() => {
    if (findText && editor) {
      onMatchCharacters(findText);
    }
  }, [checkBox.caseSensitivity, checkBox.regularExpression])


  // 替换所有匹配的内容
  const onReplaceAll = () => {
    if (editor && findLocation.length && replaceTetx) {
      findLocation.forEach((item) => {
        const { from, to } = item;
        editor.chain().focus().setTextSelection({ from, to })  // 选中指定区域
          .deleteSelection()  // 删除选中的内容
          .insertContent(replaceTetx)  // 插入新内容
          .run();
      })
    }
  }

  // 替换单个匹配的内容
  const onReplaceOne = () => {
    if (editor && findLocation.length && replaceTetx) {
      if (findLocationIndex - 1 >= 0) {
        const { from, to } = findLocation[findLocationIndex - 1];
        editor.chain().focus().setTextSelection({ from, to })  // 选中指定区域
          .deleteSelection()  // 删除选中的内容
          .insertContent(replaceTetx)  // 插入新内容
          .run();
      }
    }
  }

  // 匹配查找的位置
  const onFindLocation = () => {
    if (findLocation.length && editor) {
      let fromTemp = 0;
      if (findLocationIndex === findLocation.length) {
        const { from, to } = findLocation[0];
        fromTemp = from;
        // 把前面的高亮还原
        editor.chain().setTextSelection(findLocation[findLocation.length - 1]).toggleHighlight({ color: '#adf4ff' }).run();
        editor.chain().setTextSelection({ from, to }).toggleHighlight({ color: '#ffeaad' }).run()
        setFindLocationIndex(1)
      } else {
        if (findLocationIndex !== 0) {
          // 把前面的高亮还原
          editor.chain().setTextSelection(findLocation[findLocationIndex - 1]).toggleHighlight({ color: '#adf4ff' }).run();
        }
        const { from, to } = findLocation[findLocationIndex];
        fromTemp = from;
        editor.chain().setTextSelection({ from, to }).toggleHighlight({ color: '#ffeaad' }).run();
        setFindLocationIndex((v) => v + 1)
      }

      const { node } = editor.view.domAtPos(fromTemp);
      if (node.nodeType === Node.TEXT_NODE) {
        // 获取文本节点的父元素
        const parentElement = node.parentElement;
        console.log(parentElement);
        if (parentElement) {
          const { top, left } = parentElement.getBoundingClientRect();
          window.scrollTo({
            top: top + window.scrollY - (window.innerHeight / 2),
            left: 0,
            behavior: 'smooth'
          });
        } else {
          console.warn('Parent element not found for the text node.');
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        //@ts-ignore
        const { top, left } = node.getBoundingClientRect();
        window.scrollTo({
          top: top + window.scrollY - (window.innerHeight / 2),
          left: 0,
          behavior: 'smooth'
        });
      }
    }
  }

  // 查询规则
  const findLocationRule = (value: string) => {
    const matches = [];
    if (checkBox.caseSensitivity) {
      editor.state.doc.descendants((node, pos) => {
        if (node.isText) {
          const text = node.text;
          let startIndex = 0;
          let matchIndex;
          while ((matchIndex = text.indexOf(value, startIndex)) !== -1) {
            // 计算在整个文档中的位置
            const from = pos + matchIndex;
            const to = from + value.length;
            matches.push({ from, to });
            // 更新开始位置以继续查找后续匹配项
            startIndex = matchIndex + value.length;
          }
        }
      });
    } else if (checkBox.regularExpression) {
      const regex = new RegExp(value, "igm");
      editor.state.doc.descendants((node, pos) => {
        if (node.isText) {
          const text = node.text;
          let match;
          // 重置正则表达式的lastIndex，以便从头开始匹配
          regex.lastIndex = 0;
          // 使用exec进行逐个匹配
          while ((match = regex.exec(text)) !== null) {
            const from = pos + match.index;
            const to = from + match[0].length;
            matches.push({ from, to });
            // 注意：regex.exec会自动更新lastIndex，因此无需手动更新
          }
        }
      });
    } else {
      editor.state.doc.descendants((node, pos) => {
        if (node.isText) {
          const text = node.text?.toLowerCase();
          const findTextTemp = value.toLowerCase();
          let startIndex = 0;
          let matchIndex;
          console.log(text.indexOf(text, startIndex));
          while ((matchIndex = text.indexOf(findTextTemp, startIndex)) !== -1) {
            // 计算在整个文档中的位置
            const from = pos + matchIndex;
            const to = from + value.length;
            matches.push({ from, to });
            // 更新开始位置以继续查找后续匹配项
            startIndex = matchIndex + value.length;
          }
        }
      });
    }
    setFindLocation(matches);
    if (matches.length) {
      setFindLocationIndex(0)
      // 高亮所有匹配项
      matches.forEach(({ from, to }) => {
        editor.chain().setTextSelection({ from, to }).toggleHighlight({ color: '#adf4ff' }).run()
      });
    }
    setLoad(false)
  }

  // 查找匹配内容
  const onMatchCharacters = (value: string) => {
    if (editor) {
      if (findLocation.length) {
        findLocation.forEach(({ from, to }) => {
          editor.chain().setTextSelection({ from, to: to + replaceTetx.length }).unsetHighlight().run();
        });
        setFindLocation([]);
        setLoad(true)
      } else {
        findLocationRule(value)
      }
    }
  }

  return (
    <div className={`fixed top-[60px] border p-3 right-5 w-80 bg-background z-[99999] rounded-sm transition-all `}>
      <IoClose className="absolute right-2 top-2 text-[18] cursor-pointer" onClick={() => onclose()} />
      <div className="mb-3">
        <div className="text-[14px] mb-1">{LOOKUP[language]}</div>
        <Input
          className="h-7"
          id="findText"
          autoFocus={true}
          placeholder={LOOKUP_PLACEHOLDER[language]}
          value={findText}
          onChange={(e) => {
            setFindText(e.target.value)
            onMatchCharacters(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const dom = window.document.getElementById('lookup');
              if (dom) {
                dom.click();
              }
            }
          }}
        />
      </div>
      <div className={`${checkBox.replace ? 'block' : 'hidden'} mb-3`}>
        <div className="text-[14px] mb-1">{REPLACE[language]}</div>
        <Input value={replaceTetx} className="h-7" placeholder={ENTER_REPLACEMENT_CONTENT[language]} onChange={(e) => { setReplaceText(e.target.value) }} />
      </div>
      <div className="flex justify-between">
        {
          onCheckbox.map((item => (
            <div
              key={item.key}
              className="flex items-center cursor-pointer"
              onClick={() => {
                setCheckBox(v => {
                  if (item.key === 'caseSensitivity') {
                    return { ...v, [item.key]: !v[item.key], ['regularExpression']: false };
                  } else if (item.key === 'regularExpression') {
                    return { ...v, [item.key]: !v[item.key], ['caseSensitivity']: false };
                  }
                  return { ...v, [item.key]: !v[item.key] };
                })
              }}
            >
              {!checkBox[item.key] ? <MdOutlineCheckBoxOutlineBlank className="text-[25px]" /> : <MdOutlineCheckBox className="text-[25px]" />}
              <span className="text-sm ml-1">{item.name}</span>
            </div>
          )))
        }
      </div>
      <div className={`${checkBox.replace ? 'block' : 'hidden'} mt-3 flex justify-between`}>
        <Button onClick={onFindLocation} id="lookup" className="w-full mx-1 h-8" size="sm">{LOOKUP[language]}</Button>
        <Button className="w-full mx-1 h-8" size="sm" onClick={onReplaceOne}>{REPLACE[language]}</Button>
        <Button className="w-full mx-1 h-8" size="sm" onClick={onReplaceAll}>{REPLACE_ALL[language]}</Button>
      </div>
    </div>
  )
}