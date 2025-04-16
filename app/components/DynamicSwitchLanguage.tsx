"use client"
import { setUserLocale } from "@/services/locale"
import { Locale } from "../../i18n/config"
import {
 Disclosure,
 DisclosureButton,
 DisclosurePanel,
 Menu,
 MenuButton,
 MenuItem,
 MenuItems,
} from "@headlessui/react"
import {
 Bars3Icon,
 BellIcon,
 XMarkIcon,
 GlobeAltIcon,
} from "@heroicons/react/24/outline"
const languageOptions = [
 { name: "English", locale: "en" },
 { name: "Chinese", locale: "zh" },
]

export const DynamicSwitchLanguage = () => {
 const handleLocaleChange = (locale: string) => {
  setUserLocale(locale as Locale)
 }
 return (
  <Menu as="div" className="relative ml-3">
   <MenuButton className="relative right-4 flex rounded-full text-gray-400  text-sm  focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
    <GlobeAltIcon className="h-6 w-6" aria-hidden="true" />
   </MenuButton>
   <MenuItems
    transition
    className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
   >
    {languageOptions.map((option) => (
     <MenuItem key={option.name}>
      <button
       onClick={() => handleLocaleChange(option.locale)}
       className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
       {option.name}
      </button>
     </MenuItem>
    ))}
   </MenuItems>
  </Menu>
 )
}
