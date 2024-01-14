import axios from 'axios';

import { API_FILES_CREATE } from '@/constants/api';
import { postRequest } from '@/services/utils';

export type ICreateFileProps = {
  walletId: string;
  token: string;
  file: File | undefined;
};

export const uploadNftFile = async ({ walletId, token, file }: ICreateFileProps) => {
  if (!file) {
    throw new Error('File is required');
  }
  const response = await postRequest(
    API_FILES_CREATE(walletId),
    {
      name: file.name,
      path: URL.createObjectURL(file),
      description: JSON.stringify({
        name: file.name,
        type: file.type,
        size: file.size,
      }),
      storageProvider: 'S3',
    },
    {
      headers: {
        Authorization: token,
      },
    }
  );

  const fileUploadHeaders = {
    'Content-Type': file.type,
  };

  await axios.create().put(response.data.url, file, {
    headers: fileUploadHeaders,
  });

  return {
    walletId: response.data.walletId,
    fileId: response.data.fileId,
    filePath: response.data.publicUrl,
  };
};
