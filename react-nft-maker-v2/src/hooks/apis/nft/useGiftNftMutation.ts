import { AxiosError } from 'axios';
import { useMutation } from 'react-query';

import { useAppDispatch } from '@/hooks/useReduxTypedHooks';
import { giftNftService } from '@/services/nft/gift.service';
import { setJustSignedUp } from '@/store/auth';
import { setAllContacts } from '@/store/contacts';
import { sendNftSuccess } from '@/store/nft';

type IUseSendNftMutation = {
  setLoader: (value: boolean) => void;
  toggleModal: () => void;
  setError: (value: string) => void;
  selectedNftId: string | undefined;
};

type IMutation = {
  nftId: string;
  contactIds?: any;
};

export const useGiftNftMutation = ({ setLoader, toggleModal, setError, selectedNftId }: IUseSendNftMutation) => {
  const dispatch = useAppDispatch();

  return useMutation(
    async ({ nftId, contactIds }: IMutation) => {
      const response = await giftNftService({
        nftId,
        body: {
          contactIds: Array.isArray(contactIds) ? contactIds : [contactIds],
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
        // dispatch(sendNftSuccess('b7zqP4vyzMq8GOTFlU9mA')); // NEED TO REMOVE THIS AFTER API HAS BEEN FIXED
      },
      onSuccess() {
        dispatch(sendNftSuccess(selectedNftId || ''));
        dispatch(setAllContacts([]));
        dispatch(setJustSignedUp(false));
        setLoader(false);
        toggleModal();
      },
    }
  );
};
