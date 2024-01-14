import { AxiosError } from 'axios';
import { useMutation } from 'react-query';

import { useAppDispatch } from '@/hooks/useReduxTypedHooks';
import { sendNftService } from '@/services/nft/send.service';
import { setJustSignedUp } from '@/store/auth';
import { setAllContacts, setSelectedContacts } from '@/store/contacts';
import { sendNftSuccess } from '@/store/nft';

type IUseSendNftMutation = {
  setLoader: (value: boolean) => void;
  toggleModal: () => void;
  setError: (value: string) => void;
};

type IMutation = {
  nftId: string;
  recipientId: string;
};

export const useSendNftMutation = ({ setLoader, toggleModal, setError }: IUseSendNftMutation) => {
  const dispatch = useAppDispatch();

  const clearState = (): void => {
    dispatch(setAllContacts([]));
    dispatch(setSelectedContacts([]));
    dispatch(setJustSignedUp(false));
  };

  return useMutation(
    async ({ nftId, recipientId }: IMutation) => {
      const response = await sendNftService({
        nftId,
        body: {
          recipientId,
        },
      });
      return response.data;
    },
    {
      onMutate() {
        setLoader(true);
      },
      onError(data: AxiosError) {
        setLoader(false);
        setError(data.message);
        dispatch(sendNftSuccess('b7zqP4vyzMq8GOTFlU9mA')); // NEED TO REMOVE THIS AFTER API HAS BEEN FIXED
        clearState();
      },
      onSuccess(data) {
        dispatch(sendNftSuccess(data.data.nftId));
        clearState();
        setLoader(false);
        toggleModal();
      },
    }
  );
};
