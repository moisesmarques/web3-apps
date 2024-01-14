import { Fragment, useEffect, useState } from 'react';

import { CircularProgress } from '@mui/material';

import { convertFileUrlToBase64 } from '@/utils/helper';

import { DivAudioElement, DivImageElement, DivVideoElement } from './MediaItem.styles';

const MediaItem = ({ file, src }: { file?: File | undefined; src?: string }) => {
  const [data, setData] = useState<string | undefined | any>();

  useEffect(() => {
    if (src) {
      setData(convertFileUrlToBase64(src));
    }
  }, [src]);

  return (
    <Fragment>
      {data &&
        (file?.type?.includes('video') || src?.includes('video') ? (
          <DivVideoElement controls src={src} />
        ) : file?.type?.includes('audio') || src?.includes('audio') ? (
          <DivAudioElement controls>
            <source src={src} />
          </DivAudioElement>
        ) : !(file?.type?.includes('video') || src?.includes('video')) &&
          !(file?.type?.includes('audio') || src?.includes('audio')) ? (
          <DivImageElement alt="uploaded file" src={src} />
        ) : (
          <CircularProgress size={100} />
        ))}
      {file &&
        !data &&
        (file?.type?.includes('video') ? (
          <DivVideoElement controls src={URL.createObjectURL(file)} />
        ) : file?.type?.includes('audio') ? (
          <DivAudioElement controls>
            <source src={URL.createObjectURL(file)} />
          </DivAudioElement>
        ) : (
          file instanceof File && <DivImageElement alt="uploaded file" src={URL.createObjectURL(file)} />
        ))}
    </Fragment>
  );
};
export default MediaItem;
