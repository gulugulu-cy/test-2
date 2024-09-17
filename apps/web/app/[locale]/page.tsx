"use server";
import Home from "../componets/page/home";
import { detectLocale } from "@/lib/utils";
// import { detectLocale } from "@/util/locale-util";
import type { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";

const languages = [
  { locale: "zh", url: "/zh" },
  { locale: "en", url: "/en" },
  { locale: "ja", url: "/ja" },
  { locale: "de", url: "/de" },
  { locale: "fr", url: "/fr" },
  { locale: "ko", url: "/ko" },
];

type Props = {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const headers_ = headers();
  const hostname = headers_.get("host");

  const previousImages = (await parent).openGraph?.images || [];

  const info = {
    zh: {
      title: "AI文档编辑器",
      description: "一键生成长文档，提升写作效率和内容质量",
      image: "/word_zh.jpg",
    },
    en: {
      title: "AI Document Editor",
      description: "Generate lengthy documents with one click, enhancing writing efficiency and content quality",
      image: "/word_en.jpg",
    },
    ja: {
      title: "AIドキュメントエディター",
      description:
        "ワンクリックで長文を生成し、執筆の効率と内容の質を向上させる",
      image: "/word_ja.jpg",
    },
  };

  let locale = detectLocale(
    (searchParams && (searchParams.lang as string)) || params.locale || "en"
  ) as keyof typeof info;

  if (!(locale in info)) {
    locale = "en";
  }

  return {
    title: info[locale as keyof typeof info].title,
    description: info[locale as keyof typeof info].description,
    metadataBase: new URL(
      (hostname as string).includes("localhost")
        ? "http://localhost:3000"
        : `https://${hostname}`
    ),
    alternates: {
      canonical: `/${locale}`,
      languages: languages
        .filter((item) => item.locale !== locale)
        .map((item) => ({
          [item.locale]: `${item.url}`,
        }))
        .reduce((acc, curr) => Object.assign(acc, curr), {}),
    },
    openGraph: {
      url: `/${locale}`,
      images: [info[locale as keyof typeof info].image, ...previousImages],
    },
    twitter: {
      site: (hostname as string).includes("localhost")
        ? `http://localhost:3000/${locale}`
        : `https://${hostname}/${locale}`,
      images: [info[locale as keyof typeof info].image, ...previousImages],
    },
  };
}
export default async function Page() {
  return <Home />;
}
