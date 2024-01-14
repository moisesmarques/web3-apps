import { AxiosError } from 'axios';

import { INftItemType } from '@/services/nft/list.service';

export const getErrorMessage = (json: AxiosError) => {
  return json?.response?.data?.message
    ? json?.response?.data?.message
    : json?.response?.data?.errors.length
    ? json?.response?.data?.errors
    : 'Error while processing your request';
};

export const useRouter = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return jest.spyOn(require('next/router'), 'useRouter');
};

export const removeAllEmptyData = (object: any) => {
  for (const key in object) {
    if (!object[key]) {
      // remove data if it's empty / undefined / null
      delete object[key];
    }
  }
  return object;
};

export const removeNumbersFromString = (data: string) => {
  return data.replace(/[^A-Za-z ]+/g, '');
};

export const isValidateEmail = (email: string | null) =>
  String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

export const isValidPhoneNumber = (phone: string | null) =>
  String(phone).match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/);

export const timeAgo = (current: any, previous: any) => {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + ' seconds ago';
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago';
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago';
  } else if (elapsed < msPerMonth) {
    return 'approximately ' + Math.round(elapsed / msPerDay) + ' days ago';
  } else if (elapsed < msPerYear) {
    return 'approximately ' + Math.round(elapsed / msPerMonth) + ' months ago';
  } else {
    return 'approximately ' + Math.round(elapsed / msPerYear) + ' years ago';
  }
};

export const getFileType = (url: string) => {
  switch (getFileExtension(url).toUpperCase()) {
    case 'PNG':
    case 'JPG':
    case 'JPEG':
    case 'WEBP':
      return 'image';
    case 'MP3':
      return 'audio';
    case 'MP4':
      return 'video';
    case 'MOV':
      return 'video';
    case 'HEVC':
      return 'video';
    default:
      return undefined;
  }
};

export const getFileExtension = (url: string) => {
  const regx = /\#|\?/;
  return url.split('.')?.pop()?.split(regx)[0] ?? '';
};

export const doesAccountStringHaveValidCharacters = (accountString: any) => {
  const matchesCharacterRequirements = /^[a-z_0-9-]+$/i.test(accountString);
  const hasUppercaseLetter = /[A-Z]+?/.test(accountString);

  return matchesCharacterRequirements && !hasUppercaseLetter;
};

export const removeSpecialCharacters = /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi;

export const convertFileUrlToBase64 = async (url: string) => {
  const data = await fetch(url);
  const blob = await data.blob();
  const reader = new FileReader();
  await reader.readAsDataURL(blob);
  const base64Data = reader.result as string;

  return base64Data;
};

export const isObjectEmpty = (obj: object) => Object.keys(obj).length === 0;

export const selectNFT = (allNft: Array<INftItemType>, id: string, isChecked: boolean): INftItemType[] => {
  // First unselect all
  const allUnselectedNft = allNft?.map((nft) => ({
    ...nft,
    isSelected: false,
  }));

  const nftToSelect = allUnselectedNft.findIndex((obj) => obj.id === id);

  const objectsBeforeIndex = allUnselectedNft.slice(0, nftToSelect);
  const objectsAfterIndex = allUnselectedNft.slice(nftToSelect + 1);
  const [objectWhichNeedToSelect] = allUnselectedNft.slice(nftToSelect, nftToSelect + 1);

  const selectedNft = {
    ...objectWhichNeedToSelect,
    isSelected: !isChecked,
  };

  return [...objectsBeforeIndex, selectedNft, ...objectsAfterIndex];
};

export const sha256Encrypted = async (string: string) => {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(string));
  const unit8Array: any = new Uint8Array(hash);
  return btoa(String.fromCharCode(...unit8Array));
};
