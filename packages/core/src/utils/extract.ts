import { find } from 'linkifyjs';

export const extractLink = (text: string) => {
  const urls = find(text, 'url');
  if (!urls.length) {
    return;
  }

  return urls[0].value;
}
