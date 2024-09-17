import { locales } from "./i18n";
import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const { redirect, usePathname, useRouter } = createSharedPathnamesNavigation({ locales });
