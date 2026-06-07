import { createI18n } from 'vue-i18n'
import fr from './fr.json'
import en from './en.json'

export type SupportedLocale = 'fr' | 'en'

const savedLocale = (localStorage.getItem('locale') as SupportedLocale) || 'fr'

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'fr',
  messages: { fr, en },
})

export function setLocale(locale: SupportedLocale) {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
}

export function getLocale(): SupportedLocale {
  return i18n.global.locale.value as SupportedLocale
}
