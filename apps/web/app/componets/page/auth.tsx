"use client";
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { setAuthLocalStorage, getAuthLocalStorage, getLocalStorage } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setGlobalState } from "@/app/store/globalSlice";
import { Input } from "@/components/tailwind/ui/input";
import { Button } from "@/components/tailwind/ui/button";
import { Checkbox } from "@/components/tailwind/ui/checkbox";
import { LanguagePopover } from "../LanguagePopover";
import { HEADER_TITLE, LANG, LANG_SHORT, LANGUAGE_LIBRARY } from "@/lib/language";

export default function Auth() {
  const router = useRouter();
  const dispatch = useAppDispatch()
  const [region, setReion] = useState("1")
  const [code, setCode] = useState('')
  const [errMessage, setErrMessage] = useState('')
  const [remCode, setRemCode] = useState(true)
  const global = useAppSelector(setGlobalState);

  useEffect(() => {
    // if (window.navigator.language.toLocaleLowerCase().indexOf("zh") === -1) document.title = "AI Document Editor"
    const urlCode = new URLSearchParams(window.location.search).get('pwd')
    const urlConfirm = new URLSearchParams(window.location.search).get(
      'confirm'
    )
    const urlRegion = new URLSearchParams(window.location.search).get(
      'region'
    )
    if (urlRegion === "0") setReion("0")
    const storageCode = getAuthLocalStorage(window, 'code')
    if (urlCode && urlConfirm === 'true') login(urlCode)
    else if (urlCode) setCode(urlCode)
    else if (urlConfirm === 'true') login()
    !urlCode && !urlConfirm && storageCode && setCode(storageCode)
  }, [])

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

  // 登录
  const login = async (code?: string) => {
    const hostname = window.location.host.split('.')[0]
    // const fetchUrl = `https://test-api2.gpt302.com/bot/v1/${hostname}`
    // const fetchUrl = `https://dash-api.302.ai/bot/v1/${hostname}`
    const fetchUrl = `${process.env.NEXT_PUBLIC_BACK_FETCH_URL}/${hostname}`
    const response = await fetch(`${fetchUrl}${code ? '?pwd=' + code : ''}`)
    // const hostname = "e0am-patent";
    // const response = await fetch(`${fetchUrl}${code ? '?pwd=7326' + code : '?pwd=7326'}`)
    if (response.status === 200) {
      const data = JSON.parse(await response.text())
      if (data.code === 0) {
        // 记住分享码
        remCode &&
          code &&
          setAuthLocalStorage(window, {
            code
          })
        setAuthLocalStorage(window, {
          api_key: data.data.api_key,
          model_name: data.data.model_name,
          region: data.data.region
        })
        // 保存数据
        dispatch(
          setGlobalState({
            ...data.data,
            code,
            renew: !global.payload.global.renew
          })
        )
        const src = getLocalStorage('src');
        router.push(src ? `/${src}` : '/');
        localStorage.removeItem('src')
      } else {
        if (data.code === -101) setErrMessage(LANGUAGE_LIBRARY[global.payload.global.language]['搜索工具已删除'])
        else if (data.code === -100) setErrMessage(LANGUAGE_LIBRARY[global.payload.global.language]['搜索工具已禁用'])
        else if (data.code === -99) setErrMessage(LANGUAGE_LIBRARY[global.payload.global.language]['分享码错误'])
        else setErrMessage(LANGUAGE_LIBRARY[global.payload.global.language]['未知错误'])
        router.push(`${window.location.pathname}`, { scroll: false });
      }
    } else {
      router.push(`${window.location.pathname}`, { scroll: false });
      setErrMessage(LANGUAGE_LIBRARY[global.payload.global.language]['网络错误'])
    }
  }

  return <div className="share-code-container">
    <div className='absolute right-3 top-3'><LanguagePopover /></div>
    <img src="https://file.302.ai/gpt/imgs/91f7b86c2cf921f61e8cf9dc7b1ec5ee.png" alt="ai-302" width="100"></img>
    <div className="share-code flex flex-col gap-2">
      <div className="flex justify-center">
        <svg
          className="lock_svg__icon"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          width="52"
          height="52"
        >
          <path
            d="M153.6 469.312v469.376h716.8V469.312H153.6zM64 384h896v640H64V384zm403.2 329.92c-26.752-14.72-44.8-42.304-44.8-73.92 0-47.104 40.128-85.312 89.6-85.312 49.472 0 89.6 38.208 89.6 85.312 0 31.616-18.048 59.136-44.8 73.92v115.968a44.8 44.8 0 0 1-89.6 0V713.92zM332.8 384h358.4V256c0-94.272-80.256-170.688-179.2-170.688-98.944 0-179.2 76.416-179.2 170.688v128zM512 0c148.48 0 268.8 114.56 268.8 256v128H243.2V256C243.2 114.56 363.52 0 512 0z"
            fill="currentColor"
          ></path>
        </svg>
      </div>
      <div className="font-bold text-xl mt-4">{LANGUAGE_LIBRARY[global.payload.global.language]['需要分享码']}</div>
      <div className="mb-5">{LANGUAGE_LIBRARY[global.payload.global.language]['创建者开启了验证, 请在下方填入分享码']}</div>
      <div className="flex justify-center mb-1">
        <Input
          className="w-3/4 text-center"
          style={{ borderColor: '#f4f4f5', backgroundColor: '#f4f4f5' }}
          placeholder={LANGUAGE_LIBRARY[global.payload.global.language]['请输入分享码']}
          defaultValue={code}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCode(e.target.value)
          }
        />
      </div>
      {errMessage && (
        <div style={{ color: 'rgb(212, 14, 14)' }}>
          <span dangerouslySetInnerHTML={{ __html: errMessage }}></span>
          ，{LANGUAGE_LIBRARY[global.payload.global.language]['更多请访问']}{' '}
          <a
            className="underline"
            style={{ color: '#0070f0' }}
            href={region === "0" ? "https://302ai.cn/" : "https://302.ai/"}
            target="_blank"
          >
            302.AI
          </a>
        </div>
      )}
      <div className="flex justify-center mt-1">
        <Button className="w-3/4" onClick={() => login(code)}>
          {LANGUAGE_LIBRARY[global.payload.global.language]['确认']}
        </Button>
      </div>
      <label
        htmlFor="remember"
        className="flex justify-center items-center gap-2 cursor-pointer"
      >
        <Checkbox
          id="remember"
          onCheckedChange={value => setRemCode(Boolean(value))}
          defaultChecked
        />
        <div>{LANGUAGE_LIBRARY[global.payload.global.language]['记住分享码']}</div>
      </label>
    </div>
  </div>
}