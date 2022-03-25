import path from 'path';
import { I18n } from 'i18n';

export const i18n = new I18n();

i18n.configure({
    directory: path.join(__dirname, '../../locales'),
    defaultLocale: 'en',
});
