import { useState } from "react"
// import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { useAppSelector } from "@/app/store/hooks"
import { selectGlobal } from "@/app/store/globalSlice"
import { getAuthLocalStorage } from "@/lib/utils"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/tailwind/ui/dialog"

export default function ToolInfo({ language }: { language: 'chinese' | 'english' | 'japanese' }) {
  const global = useAppSelector(selectGlobal)
  const [info, setInfo] = useState("")
  async function getInfo() {
    const hostname = window.location.host.split('.')[0].replace(":", "")
    const url = new URL(`${process.env.NEXT_PUBLIC_BACK_FETCH_URL}/${hostname}`)
    const params = new URLSearchParams(url.searchParams)
    const code = global.code || getAuthLocalStorage(window, "code")
    code && params.append('pwd', code)
    url.search = params.toString()
    const response = await fetch(url, { headers: { Lang: { 'chinese': 'cn', 'english': 'en', 'japanese': 'jp' }[language] } })
    const responseText = await response.text()
    const data = JSON.parse(responseText).data
    setInfo(data.info)
  }

  return (
    <Dialog onOpenChange={getInfo}>
      <DialogTrigger className=" ml-3">
        <svg className=" cursor-pointer" width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.877075 7.49972C0.877075 3.84204 3.84222 0.876892 7.49991 0.876892C11.1576 0.876892 14.1227 3.84204 14.1227 7.49972C14.1227 11.1574 11.1576 14.1226 7.49991 14.1226C3.84222 14.1226 0.877075 11.1574 0.877075 7.49972ZM7.49991 1.82689C4.36689 1.82689 1.82708 4.36671 1.82708 7.49972C1.82708 10.6327 4.36689 13.1726 7.49991 13.1726C10.6329 13.1726 13.1727 10.6327 13.1727 7.49972C13.1727 4.36671 10.6329 1.82689 7.49991 1.82689ZM8.24993 10.5C8.24993 10.9142 7.91414 11.25 7.49993 11.25C7.08571 11.25 6.74993 10.9142 6.74993 10.5C6.74993 10.0858 7.08571 9.75 7.49993 9.75C7.91414 9.75 8.24993 10.0858 8.24993 10.5ZM6.05003 6.25C6.05003 5.57211 6.63511 4.925 7.50003 4.925C8.36496 4.925 8.95003 5.57211 8.95003 6.25C8.95003 6.74118 8.68002 6.99212 8.21447 7.27494C8.16251 7.30651 8.10258 7.34131 8.03847 7.37854L8.03841 7.37858C7.85521 7.48497 7.63788 7.61119 7.47449 7.73849C7.23214 7.92732 6.95003 8.23198 6.95003 8.7C6.95004 9.00376 7.19628 9.25 7.50004 9.25C7.8024 9.25 8.04778 9.00601 8.05002 8.70417L8.05056 8.7033C8.05924 8.6896 8.08493 8.65735 8.15058 8.6062C8.25207 8.52712 8.36508 8.46163 8.51567 8.37436L8.51571 8.37433C8.59422 8.32883 8.68296 8.27741 8.78559 8.21506C9.32004 7.89038 10.05 7.35382 10.05 6.25C10.05 4.92789 8.93511 3.825 7.50003 3.825C6.06496 3.825 4.95003 4.92789 4.95003 6.25C4.95003 6.55376 5.19628 6.8 5.50003 6.8C5.80379 6.8 6.05003 6.55376 6.05003 6.25Z" fill="#c1c1c1" fillRule="evenodd" clipRule="evenodd"></path></svg>
      </DialogTrigger>
      <DialogContent className="z-[99999] lg:px-6 lg:py-5 pl-2 pr-3 fixed left-[50%] top-[50%] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {{ chinese: "关于 AI 文档编辑器", english: "About AI Document Editor", japanese: 'AIドキュメントエディタについて' }[language]}
          </DialogTitle>
        </DialogHeader>
        <div
          className={`lg:pl-6 pl-3 ${!info?.length && `min-h-[300px]`}`}
          dangerouslySetInnerHTML={{ __html: info }}
        ></div>
        <DialogFooter>
          <DialogClose></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}