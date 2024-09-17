// { chinese: '全文总结', english: 'Full text summary', icon: (<RiCameraLensLine />) },
// { chinese: '全文翻译', english: 'Full text translation', icon: (<BsTranslate />) },
// { chinese: '全文改写', english: 'Full text rewriting', icon: (<FiRefreshCw />) },
// { chinese: '全文改写', english: 'Full text reading', icon: (<RiSpeakLine />) },

interface IToolParameter {
  content: string, title: string, language: string, tips: string, request: string
}
export const cueWord: { [key: string]: (params: IToolParameter) => Array<{ role: string, content: string }> } = {
  // 全文总结
  'Full text summary': (params: Pick<IToolParameter, 'content' | 'title'>) => {
    return [
      {
        role: 'user',
        content: "You are a helpful assistant which expert in content summarize." +
          "You can generate high quality and professional summary for content, with some key features and questions about the origin." +
          "You must return the result in Markdown format, the result language must same as the input content." +
          "If no title provided, you should generate a concise title which language is same as the content for it." +
          "Here's the output example, all headings should be translated to the language which same as the input content: " +
          "```markdown" +
          "# Summary" +

          "## Abstract" +
          "- <only 1 concise abstract of the content>" +

          "## Title" +
          "- <title of the content>" +

          "## Key features" +
          "- <key features 1>" +
          "- <key features n...>" +

          "## Questions" +
          "- <questions 1>" +
          "- <questions n...>" +

          "----- above the example -----" +

          "Now let's start your task by perform the following content and actions." +
          "Title: " + params.title +
          "Content: " +
          params.content +
          "1. Identify the language of the input." +
          "2. Generate the summary by above requirements." +
          "3. Output and translate the result into the detected language."
      }
    ]
  },

  // 全文总结表格
  'Full text summary Table': (params: Pick<IToolParameter, 'content' | 'title'>) => {
    return [
      {
        role: 'user',
        content: `You are a helpful assistant which can extract the key points from content and summarize to a table.
You must read the content user provided carefully, then plan the header for the result.
Before your action, you should detect language of the input content, the result language must same as the input content.
The result must be only one single CSV table, make sure it's correct encoding.
NEVER use markdown table format, NEVER include the markdown code blocks:`+ "'```' or '```csv'." +
          "Return the result directly, never add explantions and notes." +

          "Example output:" +
          "header 1,header 2" +
          "value 1,value 2" +

          "Following is the input content:''" +
          params.content
      }
    ]
  },

  // 生成标题
  "generate title": (params: Pick<IToolParameter, 'content'>) => {
    return [
      {
        role: 'user',
        content: `You are a helpful assistant which can generate a high quality title for a article.
Before your action, you should detect the language of the input content.
Then generate a title for this content into the language detected, the title should be professional and concise.
Return the plain text result directly, do not add explanations and notes.

Following is the input content:"""
${params.content}
"""
`
      }
    ]
  },

  // 生成内容
  "generate content": (params: Pick<IToolParameter, 'content'>) => {
    return [
      {
        role: 'user',
        content: `You are a helpful assistant which can generate a high quality article from a title.
Before your action, you should detect the language of the input content.
Design a outline for this content in the same language detected.
The outline tree level must be limited in 3, you only can use these markdown heading for outline tree: '#', '##' and '###'.
For example:"""
# Title
## Heading 1
### Subheadings
## Heading 2
### Subheadings
...
"""

The input title: ${params.content}
`
      }
    ]
  },

  // 生成内容2
  "generate content2": () => {
    return [
      {
        role: 'user',
        content: "Generate a article based on the title and outlines, limit in 1000 words." +
          "You should choice a right tone to write the content, make sure match the title and outlines." +
          "The language must be same as the detected language." +
          "Return the result in markdown format, never add explanations and notes." +
          "You don't need to wrap the content in markdown code block: '```' or '```markdown'."
      }
    ]
  },

  // 全文翻译
  'translate': (params: Pick<IToolParameter, 'content' | 'language'>) => {
    return [
      {
        role: 'user',
        content: `You are a helpful assistant which expert in translate content into any languages fluently.
You must return the best quality version, ensure that the content flows naturally and avoids an AI-generated feel.
Before your action, you should detect language of the input content.
The target language is ${params.language}.
If the content's language same as the target language, you should return the original content directly.
You must keep the markdown format as same as the original content.
If the input is not in markdown format, please just output the text.
Return the result directly, never add explantions, greetings and notes.
Following is the input content you need to translate:<input_text>
${params.content}
</input_text>`
      }
    ]
  },

  // 全文改写 / 改写
  'rewrite': (params: Pick<IToolParameter, 'content'>) => {
    return [
      {
        role: 'user',
        content: `You are a helpful assistant which expert in rewrite content.
You can rewrite the content to a high quality and professional version.
Before your action, you should detect language of the input content, the result language must same as the input content.
Return the result directly, never add explantions and notes.

----- Following is the input content -----
${params.content}
`
      }
    ]
  },

  // 自由改写
  'free rewriting': (params: Pick<IToolParameter, 'content' | 'tips'>) => {
    return [
      {
        role: 'user',
        content: `You are a helpful assistant which can help me to modify my text.
Before your action, you should detect language of the input content.
If i do not specific the target language, the result language must same as the input content.
You must output the result directly, do not add explanations and notes.
I will give you a modification request, you must follow it and modify the text in your own words.

Following is the input content:"""
${params.content}
"""

My modification request is: ${params.tips}.
`
      }
    ]
  },

  // 快速插入
  'quick insertion': (params: Pick<IToolParameter, 'content' | 'title' | 'request'>) => {
    return [
      {
        role: 'user',
        content: "You are a helpful assistant which expert in writing articles." +
          "Continue to write the article based on the title and content I provided, make sure the style and tone like the original content." +
          "If the content or title is empty, you must follow the request to write the article completely." +
          "You may need to finish the current paragraph if the sentence is incomplete and keep it in the same format." +
          "Ensure that the content flows naturally and avoids an AI-generated feel." +
          "You must return the result in markdown format, the result language must same as the input content." +
          "Before your task, you should detect the language of the input content." +
          "Return the result directly, never add explanations and notes." +
          "Only return the content your generated, never return the title and first part if it's not empty." +
          "Never wrapped the result in code block with '```'." +

          "The title of this article:" + params.title +

          "The following is the first part of this article: " +
          params.content +


          "Now write the next part based on the requests:" +
          params.request +
          ""
      }
    ]
  },

  // 总结
  'summary': (params: Pick<IToolParameter, 'content'>) => {
    return [
      {
        role: 'user',
        content: `You are a helpful assistant which can help me to summarize content.
You should detect language of the input content before your action, the result language must same as the input content.
You must summrize the content into a short, concise sentence.
You must output the result directly, do not add explanations and notes.

----- Following is the input content -----
${params.content}
----- Above is the input content -----
`
      }
    ]
  },

  //超长文写作
  'Ultra long writing': (params: Pick<IToolParameter, 'title'>) => {
    return [
      {
        role: 'user',
        content: `You are a helpful assistant which expert in break down the long-form writing instruction into multiple sub-sections.
Each section will guide the writing of several paragraphs in the essay, and must include the key points, section title and word count requirements for that section.

Writing instruction:<text>${params.title}</text>

Break it down in the following format line by line:<format>
Section 1 - [ section title ] - Word count: 300 - Describe the key points of the section in detail
Section 2 - [ section title ] - Word count: 1000 - Describe the key points of the section in detail
...
Section n - [ section title ] - Word count: 600 - Describe the key points of the section in detail
</format>

Make sure that each sections is clear, consistent and specific, and that all sections cover the entire content of the wirting instruction.
Break down the sections of the instruction should be finely and enrichment, approach the instruction from different viewpoints.
Each section's paragraph should be no less than 500 words and no more than 2000 words.
Do not output any other content, do not add total word count or summary.
Output language must be same as the writing instruction.`
      }
    ]
  },

}



