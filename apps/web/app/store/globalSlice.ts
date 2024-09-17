import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'
import type { JSONContent } from 'novel'

interface GlobalStateProps {
  api_key: string
  model_name: string
  code: string
  region: number
  language: 'chinese' | 'english' | 'japanese'
  wideLayout: number, // 布局模式 1.宽布局 0.正常
  novelContent: null | JSONContent, // 当前编辑框的内容
  saveStatus: boolean; // 输入状态
  searchText: string; // 查询文本
  findAndReplaceVisible: boolean; // 打开查找窗口
  renew: boolean; // 更新文档
  dualScreen: boolean; // 打开双屏
  translateDualScreen: boolean; // 打开翻译双屏
  translateDualLanguage: ''; // 选择翻译的语言
  rewriteDualScreen: boolean; // 打开全文改写双屏
  markdown: string;// markdown数据
  novelTitle: string; // 文件标题
  novelSummary: string; // 全文总结
  novelTable: string; // 全文总结表格
  freeRewritingText: string; // 全局自由改写内容
  freeRewritingStatus: boolean; // 全局自由改写
  editorStatus: boolean; // 新的文件
  titleRecord: {
    oldTitle: string,
    status: boolean,
  }
  replaceStatus: boolean;
  chatSelectText: string; // 聊天室选中的编辑器内容
}

export const globalStateSlice = createSlice({
  name: 'global',
  initialState: {
    api_key: '',
    model_name: '',
    code: '',
    region: 0,
    language: 'chinese',
    wideLayout: 0,
    novelContent: null,
    saveStatus: false,
    searchText: '',
    findAndReplaceVisible: false,
    renew: true,
    translateDualScreen: false,
    rewriteDualScreen: false,
    markdown: '',
    novelTitle: '',
    novelSummary: '',
    novelTable: '',
    translateDualLanguage: '',
    replaceStatus: true,
    freeRewritingText: '',
    freeRewritingStatus: false,
    editorStatus: true,
    titleRecord: {
      oldTitle: '',
      status: false,
    },
    chatSelectText: '',
  } as GlobalStateProps,
  reducers: {
    setGlobalState: (
      state: GlobalStateProps,
      action: PayloadAction<{
        [key in keyof GlobalStateProps]?: GlobalStateProps[key]
      }>
    ) => {
      const {
        api_key, code, model_name, region, wideLayout, novelContent, saveStatus, searchText, freeRewritingStatus,
        findAndReplaceVisible, renew, translateDualScreen, rewriteDualScreen, markdown, novelTitle, editorStatus,
        novelSummary, novelTable, translateDualLanguage, language, replaceStatus, freeRewritingText, titleRecord,
        chatSelectText
      } = action.payload
      if (api_key !== undefined) state.api_key = api_key
      if (code !== undefined) state.code = code
      if (model_name !== undefined) state.model_name = model_name
      if (region !== undefined) state.region = region
      if (wideLayout !== undefined) state.wideLayout = wideLayout
      if (novelContent !== undefined) state.novelContent = novelContent
      if (saveStatus !== undefined) state.saveStatus = saveStatus
      if (searchText !== undefined) state.searchText = searchText
      if (findAndReplaceVisible !== undefined) state.findAndReplaceVisible = findAndReplaceVisible
      if (renew !== undefined) state.renew = renew
      if (translateDualScreen !== undefined) state.translateDualScreen = translateDualScreen
      if (rewriteDualScreen !== undefined) state.rewriteDualScreen = rewriteDualScreen
      if (markdown !== undefined) state.markdown = markdown
      if (novelTitle !== undefined) state.novelTitle = novelTitle
      if (novelSummary !== undefined) state.novelSummary = novelSummary
      if (novelTable !== undefined) state.novelTable = novelTable
      if (translateDualLanguage !== undefined) state.translateDualLanguage = translateDualLanguage
      if (language !== undefined) state.language = language
      if (replaceStatus !== undefined) state.replaceStatus = replaceStatus
      if (freeRewritingText !== undefined) state.freeRewritingText = freeRewritingText
      if (freeRewritingStatus !== undefined) state.freeRewritingStatus = freeRewritingStatus
      if (editorStatus !== undefined) state.editorStatus = editorStatus
      if (titleRecord !== undefined) state.titleRecord = titleRecord
      if (chatSelectText !== undefined) state.chatSelectText = chatSelectText
    }
  }
})

export const { setGlobalState } = globalStateSlice.actions
export const selectGlobal = (state: RootState) => state.global
export default globalStateSlice.reducer
