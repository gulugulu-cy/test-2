import { AiOutlineSetting } from "react-icons/ai";
import { BsTranslate } from "react-icons/bs";
import { CgExport } from "react-icons/cg";
import { FiEdit3, FiFile, FiFilePlus, FiFileText, FiRefreshCw } from "react-icons/fi";
import { LuFileUp } from "react-icons/lu";
import { MdOutlineSaveAlt } from "react-icons/md";
import { PiMagicWandFill } from "react-icons/pi";
import { RiCameraLensLine, RiFindReplaceLine, RiRobot2Line, RiSpeakLine } from "react-icons/ri";
import { TfiBackLeft, TfiBackRight } from "react-icons/tfi";
import { FaFeather } from "react-icons/fa";

export interface Language { chinese: string; english: string, japanese?: string };
export const LANG = { "en-US": 'english', "zh-CN": 'chinese', "ja-JP": 'japanese' }
export const LANG_SHORT = { "en": 'english', "zh": 'chinese', "ja": 'japanese' }
export const HEADER_TITLE: Language = { chinese: 'AI 文档编辑器', english: 'AI Document Editor', japanese: 'AIドキュメントエディタ' }
export const TITLE: Language = { chinese: 'AI 智能文档', english: 'AI intelligent document', japanese: 'AIインテリジェントドキュメント' }
export const FILE: Language = { chinese: '文档', english: 'File', japanese: 'ドキュメント' }
export const AI: Language = { chinese: 'AI', english: 'AI', japanese: 'AI' }
export const EDIT: Language = { chinese: '编辑', english: 'Edit', japanese: '編集' }
export const PREFERENCE_SETTINGS: Language = { chinese: '偏好设置', english: 'Preference settings', japanese: 'プリファレンス設定' }
export const LOOKUP_PLACEHOLDER: Language = { chinese: '请输入查找内容', english: 'Please enter the search content', japanese: '検索内容を入力してください' }
export const ENTER_REPLACEMENT_CONTENT: Language = { chinese: '请输入替换内容', english: 'Please enter replacement content', japanese: '置換内容を入力してください' }


export const CAMCEL: Language = { chinese: '取消', english: 'cancel', japanese: 'キャンセル' }
export const DELETE: Language = { chinese: '删除', english: 'delete', japanese: '削除＃サクジョ＃' }
export const CANNOT_DELETE: Language = { chinese: '无法删除正在编辑的文件', english: 'Cannot delete the file being edited', japanese: '編集中のファイルを削除できませんでした' }

export const GENERATION_COMPLETED: Language = { chinese: '生成完成', english: 'Generation completed', japanese: '生成完了' }
export const GENERATION_FAILED: Language = { chinese: '生成失败', english: 'Generation failed', japanese: '生成に失敗しました' }
export const GENERATION_TITLE: Language = { chinese: '标题', english: 'Title', japanese: 'タイトル' }
export const GENERATION_CONTENT: Language = { chinese: '内容', english: 'content', japanese: '内容' }
export const IMPORT_FORMAT: Language = { chinese: '文档格式有误，不支持打开此文件', english: 'The document format is incorrect and does not support opening this file', japanese: 'ドキュメントのフォーマットに誤りがあり、このファイルを開くことはサポートされていません' }
export const EXPORTING: Language = { chinese: '正在导出，请稍等', english: 'Exporting, please wait', japanese: 'エクスポートしています、少々お待ちください' }
export const EXPORTING_RESULT: Language = { chinese: '导出完成', english: 'Export completed', japanese: 'エクスポート完了' }

export const WRITING: Language = { chinese: '写作', english: 'Writing', japanese: '文章を書く' }
export const AI_WRITING_COMPLETED: Language = { chinese: 'AI写作完成', english: 'AI writing completed', japanese: 'AI執筆完了' }
export const EDITOR_PLACEHOLDER: Language = { chinese: '输入 "/" 快速插入内容', english: 'Enter "/" to quickly insert content', japanese: '「/」クイック挿入内容を入力' }
export const AI_WRITING_TIPS: Language = { chinese: '使用AI 写作至少需要一个文章标题或一段内容或一段要求来生成内容', english: 'Using AI writing requires at least one article title, a paragraph of content, or a requirement to generate content', japanese: 'AIを使用した執筆には、少なくとも1つの記事タイトルまたはコンテンツまたは要件の1つが必要です。' }

export const LOOKUP: Language = { chinese: '查找', english: 'Lookup', japanese: '検索' }
export const REPLACE: Language = { chinese: '替换', english: 'Rreplace', japanese: '置換' }
export const COPY2: Language = { chinese: '复制', english: 'Copy', japanese: 'レプリケーション' }
export const INSERT: Language = { chinese: '插入', english: 'Insert', japanese: '挿入' }
export const REGENERATE: Language = { chinese: '重新生成', english: 'Regenerate', japanese: '再生成' }
export const AI_IS_THINKING: Language = { chinese: 'AI 正在思考', english: 'AI is thinking', japanese: 'AIが考えている' }
export const GENERATING_IN_PROGRESS: Language = { chinese: 'AI 正在生成中', english: 'AI is currently being generated', japanese: 'AIが生成中' }


export const REPLACE_ALL: Language = { chinese: '替换全部', english: 'replace All', japanese: 'すべて置換' }
export const CASE_SENSITIVITY: Language = { chinese: '区分大小写', english: 'Case sensitivity', japanese: '大文字と小文字の区別' }
export const REGULAR_EXPRESSION: Language = { chinese: '正则表达式', english: 'regular expression', japanese: '正規表現' }
export const DOCUMENT_TITLE: Language = { chinese: '请输入标题', english: 'Please enter a title', japanese: 'タイトルを入力してください' }

export const COPY_SUCCESSFUL: Language = { chinese: '复制成功', english: 'Copy successful', japanese: 'コピー成功' }
export const COPY_ERROR: Language = { chinese: '复制失败', english: 'Copy error', japanese: 'コピーに失敗しました' }

export const SAVE_SUCCESS_MESSAGE: Language = { chinese: '保存成功', english: 'Saved successfully', japanese: '保存に成功しました' }
export const SAVE_SUCCESS_ERROR: Language = { chinese: '保存失败', english: 'Save failed', japanese: '保存に失敗しました' }

export const COPY_CREATED_SUCCESSFULLY: Language = { chinese: '创建副本成功', english: 'Copy created successfully', japanese: 'コピーの作成に成功しました' }
export const COPY_CREATED_ERROR: Language = { chinese: '创建副本失败', english: 'Failed to create replica', japanese: 'コピーの作成に失敗しました' }

export const MORE_RECORDS_TEXT: Language = { chinese: '更多记录', english: 'More records', japanese: '追加レコード' }

export const TITLE_PLACEHOLDER: Language = { chinese: '点击输入标题', english: 'Click to enter title', japanese: '入力タイトルをクリック' }

export const SAVE_BUTTON: Language = { chinese: '保存', english: 'Save', japanese: '保存＃ホゾン＃' }
export const DETERMINE: Language = { chinese: '确认', english: 'confirm', japanese: '確認' }

export const COPY: Language = { chinese: '副本', english: 'copy', japanese: 'コピー' }

export const UNTITLED: Language = { chinese: '无标题', english: 'Untitled', japanese: 'タイトルなし' }
export const APPLY: Language = { chinese: '使用', english: 'apply', japanese: '適用' }
export const CLICK_TO_CLEAR_ALL_CHAT_RECORDS: Language = { chinese: '点击清除所有聊天记录', english: 'Click to clear all chat records', japanese: 'すべてのチャット履歴をクリアするにはクリックしてください' }


export const PLEASE_ENTER_THE_TITLE_FIRST: Language = { chinese: '请先输入标题', english: 'Please enter the title first', japanese: 'まずタイトルを入力してください' }
export const LONG_ARTICLE_REMINDER: Language = { chinese: '正文内容将被覆盖，是否继续？', english: 'The main content will be covered, do you want to continue?', japanese: '本文の内容は上書きされます。続行しますか？' }

export const NOT_SAVE_BUTTON: Language = { chinese: '不保存', english: 'Do not save', japanese: '保存しない' }

export const OPEN_NEW_FILE_TIPS: Language = { chinese: '打开新文件前是否保存当前文件', english: 'Do you want to save the current file before opening a new one', japanese: '新しいファイルを開く前に現在のファイルを保存するかどうか' }

export const NO_CONTENT_SUMMARY: Language = { chinese: '没有内容总结', english: 'No content summary', japanese: '内容のまとめがない' }
export const NO_CONTENT_REWRITE: Language = { chinese: '没有内容改写', english: 'No content rewrite', japanese: '内容の上書きがありません' }
export const NO_CONTENT_TRANSLATE: Language = { chinese: '没有内容翻译', english: 'No content translate', japanese: 'コンテンツ翻訳なし' }

export const SUMMARY_LOADING: Language = { chinese: 'AI正在思考，请稍后', english: 'AI is thinking, please wait', japanese: 'AIが考えていますので、しばらくお待ちください' }
// export const TRANSLATION_LOADING: Language = { chinese: 'AI 正在对内容翻译，请稍等', english: 'AI is translating the content, please wait', japanese: 'AI がコンテンツを翻訳していますので、少々お待ちください' }

export const FULL_TEXT_SUMMARY_MSG: Language = { chinese: '全文总结完成', english: 'The full text summary is completed', japanese: '全文のまとめ' }

export const QUICK_MODIFICATION: Language = { chinese: '请输入要求,默认续写', english: 'Please enter the requirements, default continuation', japanese: 'デフォルトの更新に必要な条件を入力してください' }

export const COPAI_GENERATED_COMTENT_TOOLTIPY: Language = { chinese: 'AI一键生成正文', english: 'AI generates text with just one click', japanese: 'AIワンタッチで本文を生成する' }

export const AI_GENERATED_TITLE_TOOLTIP: Language = { chinese: 'AI一键生成标题', english: 'AI generates titles with just one click', japanese: 'AIワンタッチでタイトル生成' }

export const RIGHT_TAB_BRAIN_MAP_TITLE: Language = { chinese: '全文总结-脑图', english: 'Full text summary - Brain diagram', japanese: '全文まとめ-脳図' }
export const RIGHT_TAB_TABLE_TITLE: Language = { chinese: '全文总结-表格', english: 'Full text summary - table', japanese: '全文のまとめ-表' }

export const TAB_BRAIN_MAP: Language = { chinese: '脑图', english: 'Brain map', japanese: '脳図' }
export const TAB_TABLE: Language = { chinese: '表格', english: 'Table', japanese: 'テーブル' }

export const DOWNLOAD: Language = { chinese: '下载', english: 'Download', japanese: 'ダウンロード' }
export const COPY_CSV: Language = { chinese: '复制CSV', english: 'Copy CSV', japanese: 'CSVのコピー' }
export const RECENTLY_EDITED: Language = { chinese: '最近编辑', english: 'Recently edited', japanese: '最近の編集' }
export const NO_RECENT_EDITING_RECORDS: Language = { chinese: '最近无编辑记录', english: 'No recent editing records', japanese: '最近編集されていないレコード' }
export const SUMMARIZING_THE_ENTIRE_TEXT: Language = { chinese: '正在总结全文，请稍等', english: 'Summarizing the entire text, please wait a moment', japanese: '全文をまとめていますので、少々お待ちください' }
export const PICTURE_UPLOADING_IN_PROGRESS: Language = { chinese: '图片上传中。。。', english: 'Picture uploading in progress', japanese: '画像アップ中。。。' }

export const DELETE_RECORD: Language = { chinese: '是否确认删除文件，删除后将无法复原', english: 'Are you sure to delete the file? Once deleted, it cannot be restored', japanese: 'ファイルの削除を確認するか、削除すると元に戻すことができません' }


// 快速插入菜单
export const QUICK_INSERT_MENU: { [key: string]: Language & { shortcutKeys: string } } = {
    'AI': { chinese: 'AI', english: 'AI', shortcutKeys: '/a', japanese: 'ai' },
    'Text': { chinese: '正文', english: 'Text', shortcutKeys: '/c', japanese: 'テキスト' },
    'Heading 1': { chinese: '标题1', english: 'Heading 1', shortcutKeys: '/t', japanese: 'タイトル1' },
    'Heading 2': { chinese: '标题2', english: 'Heading 2', shortcutKeys: '/tt', japanese: 'タイトル2' },
    'Heading 3': { chinese: '标题3', english: 'Heading 3', shortcutKeys: '/ttt', japanese: 'タイトル3' },
    'Numbered List': { chinese: '有序列表', english: 'Numbered List', shortcutKeys: '/o', japanese: '順序付きリスト' },
    'Bullet List': { chinese: '无序列表', english: 'Bullet List', shortcutKeys: '/b', japanese: '無秩序リスト' },
    'Image': { chinese: '图片', english: 'Image', shortcutKeys: '/i', japanese: '画像' },
    'Link': { chinese: '链接', english: 'Link', shortcutKeys: '/l', japanese: 'リンク＃リンク＃' },
    'Quote': { chinese: '引用', english: 'Quote', shortcutKeys: '/r', japanese: '参照＃サンショウ＃' },
    'Code': { chinese: '代码块', english: 'Code', shortcutKeys: '/e', japanese: 'コードブロック' },
    'Divider': { chinese: '分割线', english: 'Divider', shortcutKeys: '/d', japanese: '分割線ぶんかつせん' },
}

export const AI_TYPE: { [key: string]: Language } = {
    'Summary': { chinese: '总结', english: 'Summary', japanese: 'まとめ' },
    'Translate': { chinese: '翻译', english: 'Translate', japanese: '翻訳' },
    'Continued writing': { chinese: '续写', english: 'Continued writing', japanese: '更新' },
    'Expand written article': { chinese: '扩写', english: 'Expand written article', japanese: 'エキスパンダ' },
    'Abbreviation': { chinese: '缩写', english: 'Abbreviation', japanese: '省略形' },
    'Rewrite': { chinese: '改写', english: 'Rewrite', japanese: '上書き' },
    'Reading aloud': { chinese: '朗读', english: 'Reading aloud', japanese: '朗読する' },
}

export const DUAL_SCREEN_BUTTON: Array<Language> = [
    { chinese: '全文复制', english: 'Full text copying', japanese: 'フルテキストコピー' },
    { chinese: '替换全文', english: 'Replace entire text', japanese: '全文を置換' },
    { chinese: '创建副本', english: 'Create copy', japanese: 'コピーの作成' },
    { chinese: '重新生成', english: 'Regenerate', japanese: '再生成' },
    { chinese: '关闭', english: 'Close', japanese: '閉じる' },
]

// 文档菜单
export const actinFileMenu: { [key: string]: Array<Language & { ShortcutKeys?: string, icon?: any }> } = {
    'file': [
        { chinese: '新文件', english: 'new file', japanese: '新規ファイル', icon: (<FiFile />) },
        { chinese: '打开本地文档', english: 'Open local document', japanese: 'ローカルドキュメントを開く', icon: (<LuFileUp />) },
        { chinese: '创建副本', english: 'Create a copy', japanese: 'コピーの作成', icon: (<FiFilePlus />) },

    ],
    'actionFile': [
        { chinese: '保存', english: 'preservation', japanese: '保存＃ホゾン＃', icon: (<MdOutlineSaveAlt />) },
        { chinese: '导出', english: 'export', japanese: 'エクスポート＃エクスポート＃', icon: (<CgExport />) },
    ]
}

// 编辑菜单
export const actinEditMenu: { [key: string]: Array<Language & { ShortcutKeys?: string, icon?: any }> } = {
    'history': [
        { chinese: '撤销', english: 'revoke', japanese: '元に戻す', ShortcutKeys: 'Ctrl + Z', icon: (<TfiBackLeft />) },
        { chinese: '恢复', english: 'recovery', japanese: 'リカバリ', ShortcutKeys: 'Ctrl + Y', icon: (<TfiBackRight />) },
    ],
    'find': [
        { chinese: '查找和替换', english: 'Find and Replace', japanese: '検索と置換', ShortcutKeys: 'Ctrl + F', icon: (<RiFindReplaceLine />) },
    ]
}



// ai菜单
export const actinAIMenu: Array<Language & { icon: any }> = [
    { chinese: '全文总结', english: 'Full text summary', japanese: '全文のまとめ', icon: (<RiCameraLensLine />) },
    { chinese: '全文翻译', english: 'Full text translation', japanese: '全文翻訳', icon: (<BsTranslate />) },
    { chinese: '全文改写', english: 'Full text rewriting', japanese: '全文上書き', icon: (<FiRefreshCw />) },
    { chinese: '全文朗读', english: 'Full text reading', japanese: '全文朗読', icon: (<RiSpeakLine />) },
    { chinese: 'AI 聊天', english: 'AI chat', japanese: 'AI チャット', icon: (<RiRobot2Line />) },
    { chinese: '一键生成长文', english: 'One click generation of long articles', japanese: 'ワンクリックで長文を生成', icon: (<FaFeather className="text-[#8e47f0]" />) },
]

// 按钮名称
export const onButtonName = {
    'File': { name: FILE, icon: (<FiFileText />) },
    'Edit': { name: EDIT, icon: (<FiEdit3 />) },
    'AI': { name: AI, icon: (<PiMagicWandFill />) },
    'Preference': { name: PREFERENCE_SETTINGS, icon: (<AiOutlineSetting />) },
}

export const appearances = [
    { chinese: '明亮', english: 'Light', japanese: '明るい', theme: 'light' },
    { chinese: '系统', english: 'System', japanese: 'システム', theme: 'system' },
    { chinese: '暗黑', english: 'Dark', japanese: '暗い', theme: 'dark' },
];

export const TIMBRE: { [key: string]: Language } = {
    'Xiaoxiao': { chinese: '晓晓', english: 'Xiaoxiao', japanese: 'と知っている' },
    'Brian': { chinese: '布瑞恩', english: ' Brian', japanese: 'ブライアン' },
    'Seraphina': { chinese: '塞拉芬娜', english: 'Seraphina', japanese: 'セラフィーヌ' },
    'Remy': { chinese: '雷米', english: 'Remy', japanese: 'レミ' },
}


export const LANGUAGE_LIBRARY = {
    "chinese": {
        '记住分享码': '记住分享码',
        '重新登录': '重新登录',
        '确认': '确认',
        '更多请访问': '更多请访问',
        '请输入分享码': '请输入分享码',
        '创建者开启了验证, 请在下方填入分享码': '创建者开启了验证, 请在下方填入分享码',
        '需要分享码': '需要分享码',
        '搜索工具已删除': '搜索工具已删除',
        '搜索工具已禁用': '搜索工具已禁用',
        '分享码错误': '分享码错误',
        '未知错误': '未知错误',
        '网络错误': '网络错误',
        '请联系': '请联系',
        '客服': '客服',
        '账户凭证丢失，请': '账户凭证丢失，请',
        '该工具已禁用/删除': '该工具已禁用/删除',
        '网络错误，请稍后重试': '网络错误，请稍后重试',
        '账户余额不足，创建属于自己的工具': '账户余额不足，创建属于自己的工具',
        '账户总额度已达上限': '账户总额度已达上限',
        '账户日额度已达上限': '账户日额度已达上限',
        '当前无可用通道': '当前无可用通道',
        '该免费工具在本小时的额度已达上限,请访问': '该免费工具在本小时的额度已达上限,请访问',
        '生成属于自己的工具': '生成属于自己的工具'
    },
    "english": {
        '记住分享码': 'Remember to share code',
        '重新登录': 'Login again',
        '确认': 'Confirm',
        '更多请访问': 'For more, please visit',
        '请输入分享码': 'Please enter the sharing code',
        '创建者开启了验证, 请在下方填入分享码': 'The creator has enabled verification. Please fill in the sharing code below',
        '需要分享码': 'Need to share code',
        '搜索工具已删除': 'The search tool has been removed',
        '搜索工具已禁用': 'Search tool disabled',
        '分享码错误': 'Sharing code error',
        '未知错误': 'unknown error',
        '网络错误': 'network error',
        '请联系': 'Please contact',
        '客服': 'customer service',
        '账户凭证丢失，请': 'Account voucher lost, please',
        '该工具已禁用/删除': 'This tool has been disabled/removed',
        '网络错误，请稍后重试': 'Network error, please try again later',
        '账户余额不足，创建属于自己的工具': 'Insufficient account balance, create your own tool',
        '账户总额度已达上限': 'The total account limit has reached the upper limit',
        '账户日额度已达上限': 'The daily limit of the account has been reached',
        '当前无可用通道': 'There are currently no available channels',
        '该免费工具在本小时的额度已达上限,请访问': "This free tool's hour quota reached maximum limit. Please view",
        '生成属于自己的工具': 'to create your own tool'
    },
    "japanese": {
        '记住分享码': '共有コードを記憶する',
        '重新登录': '再ログイン',
        '确认': '確認',
        '更多请访问': '詳細については、',
        '请输入分享码': '共有コードを入力してください',
        '创建者开启了验证, 请在下方填入分享码': '作成者は検証を開始しました。下に共有コードを記入してください',
        '需要分享码': '共有コードが必要',
        '搜索工具已删除': '検索ツールが削除されました',
        '搜索工具已禁用': '検索ツールが無効になっています',
        '分享码错误': '共有コードエラー',
        '未知错误': '不明なエラー',
        '网络错误': 'ネットワークエラー',
        '请联系': 'お問い合わせください',
        '客服': 'カスタマーサービス',
        '账户凭证丢失，请': 'アカウント証明書を紛失しました',
        '该工具已禁用/删除': 'このツールは無効/削除されました',
        '网络错误，请稍后重试': 'ネットワークエラー、後で再試行してください',
        '账户余额不足，创建属于自己的工具': 'アカウント残高が不足しているため、独自のツールを作成する',
        '账户总额度已达上限': '口座総額度が上限に達しました',
        '账户日额度已达上限': '口座日限度額が上限に達しました',
        '当前无可用通道': '現在使用可能なチャネルはありません',
        '该免费工具在本小时的额度已达上限,请访问': 'この無料ツールは、この時間の限度に達しています。',
        '生成属于自己的工具': '独自のツールを生成する'
    }
}