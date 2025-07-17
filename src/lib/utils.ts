import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Price } from './supabase/supabase.types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: Price) => {
  const priceString = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency || undefined,
    minimumFractionDigits: 0,
  }).format((price?.unit_amount || 0) / 100);
  return priceString;
};

export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL ??
    'http://localhost:3000/';

  url = url.includes('http') ? url : `https://${url}`;
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};

export const postData = async ({ url, data }: { url: string; data?: { price: Price } }) => {
  const res: Response = await fetch(url, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw Error(res.statusText);
  }
  return res.json();
};

export const toDateTime = (secs: number) => {
  var t = new Date('1970-01-01T00:30:00Z');
  t.setSeconds(secs);
  return t;
};

export const isUuid = (uuid: string) => {
  const length = uuid.length;
  if (length !== 36) {
    return false;
  }

  const charCode0 = '0'.charCodeAt(0);
  const charCode9 = '9'.charCodeAt(0);
  const charCodeA = 'A'.charCodeAt(0);
  const charCodeF = 'F'.charCodeAt(0);
  const charCodeLowerA = 'a'.charCodeAt(0);
  const charCodeLowerF = 'f'.charCodeAt(0);
  const charCodeAt = uuid.charCodeAt.bind(uuid);

  for (let i = 0; i < length; i++) {
    const charCode = charCodeAt(i);
    let isValidCharCode;

    // Check for hyphens at positions 8, 13, 18, 23
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      isValidCharCode = charCode === 45; // 45 is the char code for '-'
    } else {
      // Check for valid hex characters (0-9, a-f, A-F)
      isValidCharCode =
        (charCode >= charCode0 && charCode <= charCode9) ||
        (charCode >= charCodeA && charCode <= charCodeF) ||
        (charCode >= charCodeLowerA && charCode <= charCodeLowerF);
    }
    if (!isValidCharCode) {
      return false;
    }
  }
  return true;
};
