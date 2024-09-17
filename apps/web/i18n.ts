// import { getRequestConfig } from "next-intl/server";
// import { notFound } from "next/navigation";

export const locales = ["zh"] as const;

// export default getRequestConfig(async ({ locale }) => {
//   if (!locales.includes(locale as (typeof locales)[number])) notFound();

//   return {
//     messages: (await import(`./message/${locale}.json`)).default,
//   };
// });
