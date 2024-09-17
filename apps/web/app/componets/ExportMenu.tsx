import { saveAs } from 'file-saver';
import { CgExport } from "react-icons/cg";
import { LuFileJson } from "react-icons/lu";
import { FaRegFilePdf } from "react-icons/fa";
import { asBlob } from 'html-docx-ts-improve';
import { FaRegFileWord } from "react-icons/fa";
import { GrDocumentTxt } from "react-icons/gr";
import { BsFiletypeHtml } from "react-icons/bs";
import { IoIosArrowForward } from "react-icons/io";
import { AiOutlineFileMarkdown } from "react-icons/ai";
import { EXPORTING, EXPORTING_RESULT, UNTITLED, type Language } from "@/lib/language";
import { Button } from "@/components/tailwind/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/tailwind/ui/popover";
import { toast } from '@/components/tailwind/ui/use-toast';
import ky from 'ky';
import { ErrMessage } from './ErrMessage';
import { setGlobalState } from '../store/globalSlice';
import { useAppSelector } from '../store/hooks';

interface IProps { language: 'chinese' | 'english' | 'japanese' }

export function ExportMenu(props: IProps) {
  const global = useAppSelector(setGlobalState);
  const { language } = props;
  const exportMenuList: Array<Language & { type: string, icon: any }> = [
    { type: 'json', japanese: '構造化文書 (.json)', chinese: '结构化文档 (.json)', english: 'Structured document (.json)', icon: (<LuFileJson />) },
    { type: 'docx', japanese: 'Word (.docx)', chinese: 'Word (.docx)', english: 'Word (.docx)', icon: (<FaRegFileWord />) },
    { type: 'pdf', japanese: 'PDF (.pdf)', chinese: 'PDF (.pdf)', english: 'PDF (.pdf)', icon: (<FaRegFilePdf />) },
    { type: 'md', japanese: 'Markdown (.md)', chinese: 'Markdown (.md)', english: 'Markdown (.md)', icon: (<AiOutlineFileMarkdown />) },
    { type: 'txt', japanese: '本文ドキュメント(.txt)', chinese: '本文文档 (.txt)', english: 'This document (.txt)', icon: (<GrDocumentTxt />) },
    { type: 'html', japanese: 'HTML (.htm)', chinese: 'HTML (.htm)', english: 'HTML (.htm)', icon: (<BsFiletypeHtml />) },
  ]

  // 导出 HTML 文件
  const exportHTML = () => {
    let htmlContent = window.localStorage.getItem('html-content');
    const title = window.localStorage.getItem('novel-title');
    if (!htmlContent) {
      onToast({ chinese: '没有可导出的 HTML 内容。', english: 'There is no HTML content available for export.', japanese: 'エクスポート可能なHTMLコンテンツはありません。' }[language])
      return;
    }
    // 手动拼接 H1 标签内容
    const newContent = `<h1 style="text-align: center;">${title || UNTITLED[language]}</h1>`;

    // 提取 <body> 标签内的内容
    const bodyContent = htmlContent.match(/<body[^>]*>((.|[\n\r])*)<\/body>/im)[1];

    // 创建居中的 div 容器，并设置最大宽度，将原有 body 内容包裹其中
    const containerDiv = `
    <div style="max-width: 960px; width: 100%; margin: 0 auto; padding: 20px; box-sizing: border-box;">
      ${bodyContent}
    </div>
  `;

    // 用新的 div 包裹后的内容替换掉原来的 <body> 内容
    htmlContent = htmlContent.replace(/<body[^>]*>((.|[\n\r])*)<\/body>/im, `<body>${newContent}${containerDiv}</body>`);

    // 创建 Blob 对象
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    // 创建一个隐藏的 a 元素用于触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || UNTITLED[language]}.html`; // 设置下载的文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // 释放 URL 对象
    URL.revokeObjectURL(url);

  };

  // 导出 Markdown 文件
  const exportMarkdown = () => {
    let markdownContent = window.localStorage.getItem('markdown');
    const title = window.localStorage.getItem('novel-title');
    if (!markdownContent) {
      onToast({ chinese: '没有可导出的 Markdown 内容。', english: 'There is no Markdown content available for export.', japanese: 'エクスポート可能なMarkdownコンテンツはありません。' }[language])
      return;
    }
    markdownContent = `#${title}\n${markdownContent}`;
    // 创建 Blob 对象
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    // 创建一个隐藏的 a 元素用于触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || UNTITLED[language]}.md`; // 设置下载的文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // 释放 URL 对象
    URL.revokeObjectURL(url);
    toast({
      duration: 3000,
      description: EXPORTING_RESULT[language]
    })
  };

  // 导出 JSON 文件
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
    toast({
      duration: 3000,
      description: EXPORTING_RESULT[language]
    })
  };

  // 导出 txt 文件
  const exportTxt = () => {
    let txtContent = window.localStorage.getItem('txt-content');
    const title = window.localStorage.getItem('novel-title');

    if (!txtContent) {
      onToast({ chinese: '没有可导出的 Txt 内容。', english: 'There is no Txt content available for export.', japanese: 'エクスポート可能なTxtコンテンツはありません。' }[language])
      return;
    }
    txtContent = `${title}\n\n${txtContent}`
    // 创建 Blob 对象
    const blob = new Blob([txtContent], { type: 'text/markdown;charset=utf-8' });
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    // 创建一个隐藏的 a 元素用于触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || UNTITLED[language]}.txt`; // 设置下载的文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // 释放 URL 对象
    URL.revokeObjectURL(url);
    toast({
      duration: 3000,
      description: EXPORTING_RESULT[language]
    })
  };

  // 导出docx
  const exportDocx = () => {
    let htmlContent = window.localStorage.getItem('html-content')
    const title = window.localStorage.getItem('novel-title');
    if (!htmlContent) {
      onToast({ chinese: '没有可导出的内容。', english: 'There is no content available for export.', japanese: 'エクスポート可能なコンテンツはありません。' }[language])
    }
    // 手动拼接 H1 标签内容
    const newContent = `<h1 style="text-align: center;">${title || UNTITLED[language]}</h1>`;
    // 找到 <body> 标签的位置并插入新内容
    htmlContent = htmlContent.replace('<body>', `<body>${newContent}`);
    asBlob(htmlContent).then(data => {
      saveAs(data, `${title || UNTITLED[language]}.docx`)
    })
    toast({
      duration: 3000,
      description: EXPORTING_RESULT[language]
    })
  }

  // 导出pdf
  const exportPdf = async () => {
    const { api_key, language, region } = global.payload.global
    // const fetchUrl = `https://abcd-storm.havethefeb.autos/api/pdf`;
    // const fetchUrl = `https://abcd-storm.tools302.com.autos/api/pdf`;
    const fetchUrl = process.env.NEXT_PUBLIC_PDF_FETCH_URL;
    const markdownContent = window.localStorage.getItem('markdown')
    const title = window.localStorage.getItem('novel-title');
    if (!markdownContent) {
      onToast({ chinese: '没有可导出的内容。', english: 'There is no content available for export.', japanese: 'エクスポート可能なコンテンツはありません。' }[language])
    }
    try {
      const resp = await ky.post(fetchUrl, {
        headers: {
          Authorization: `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: markdownContent,
          title: title,
          urlToInfo: [],
          taskId: '',
          api_key
        }),
        timeout: false,
      });

      const data = await resp.blob();
      if (data.size > 0) {
        const url = URL.createObjectURL(data);
        // 创建一个隐藏的 <a> 元素用于触发下载
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title || UNTITLED[language]}.pdf`; // 设置下载的文件名
        document.body.appendChild(link);
        link.click();
        // 下载后移除 URL 对象和 <a> 元素
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({
          duration: 3000,
          description: EXPORTING_RESULT[language]
        })
      }
    } catch (error) {
      toast({
        duration: 2000,
        description: (ErrMessage(error?.err_code, language, region))
      })
    }
  }

  const onClickButton = (type: string) => {
    toast({
      duration: 3000,
      description: EXPORTING[language]
    })
    switch (type) {
      case 'html':
        exportHTML()
        break;
      case 'md':
        exportMarkdown()
        break;
      case 'json':
        exportJSON()
        break;
      case 'txt':
        exportTxt()
        break;
      case 'docx':
        exportDocx()
        break;
      case 'pdf':
        exportPdf()
        break;
      default:
        break;
    }
  }

  const onToast = (description: string) => {
    toast({ duration: 2000, description })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="hover:text-[#8e47f0] w-full justify-between flex" size="sm">
          <div className="flex items-center">
            <CgExport className="mr-2" />
            {{ chinese: '导出', english: 'export', japanese: "導出" }[language]}
          </div>
          <IoIosArrowForward />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" p-1 z-[9999]" align='start' side='right' >
        <div>
          {
            exportMenuList.map((item) => (
              <Button variant="ghost" key={item.english} className="hover:text-[#8e47f0] w-full flex justify-between" size="sm" onClick={() => { onClickButton(item.type) }}>
                <div className="flex items-center">
                  {item?.icon}
                  <span className="ml-2">{item[language]}</span>
                </div>
              </Button>
            ))
          }
        </div>
      </PopoverContent>
    </Popover>
  )
}
