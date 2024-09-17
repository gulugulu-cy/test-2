import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  // 获取 lang 参数或请求头中的语言
  const langParam = request.nextUrl.searchParams.get("lang");
  const headerLang = request.headers.get("x-locale");
  let locale = langParam ? langParam.split('-')[0] : headerLang;

  // 检查 locale 是否在支持的语言列表中，否则使用默认语言
  if (!["zh", "en", "ja"].includes(locale || "")) {
    locale = "en";
  }

  // 检查当前路径是否已经包含语言前缀
  const currentLocale = url.pathname.split('/')[1];
  if (["zh", "en", "ja"].includes(currentLocale)) {
    locale = currentLocale;
  } else {
    // 如果路径不包含语言前缀，进行重定向
    url.pathname = `/${locale}${url.pathname}`;
    url.searchParams.delete("lang"); // 移除 lang 参数以避免重复参数
    return NextResponse.redirect(url);
  }

  // 设置响应头中的语言
  const response = NextResponse.next();
  response.headers.set("x-locale", locale || "en");
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
