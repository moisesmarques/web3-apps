import { ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { filter, uniqBy } from 'lodash';

import { createContact, getContactsList } from '@/services/contact/contact.service';

import { IContactStore, ICreatedContact } from './types';

const initialState: IContactStore = {
  importContacts: false,
  selectContactDialog: false,
  addContact: false,
  allContactsLoading: true,
  allContacts: [],
  selectedContacts: [],
  isContactImported: false,
  loadingMessage: '',
  listContactsError: '',
  createContactError: '',
  createdContactData: {} as ICreatedContact,
};

export const getContactsThunk = createAsyncThunk('contacts/list', async (userId: any) => {
  return await getContactsList(userId);
});

export const createContactsThunk = createAsyncThunk(
  'contacts/create',
  async ({ requestBody, userId }: { requestBody: any; userId: string | undefined }) => {
    return await createContact(requestBody, userId);
  }
);

const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    toggleImportModal(state: IContactStore) {
      state.importContacts = !state.importContacts;
    },
    toggleSelectContactModal(state: IContactStore) {
      state.selectContactDialog = !state.selectContactDialog;
    },
    setSelectContactModalOpen(state: IContactStore) {
      state.selectContactDialog = true;
    },
    toggleAddContactModal(state: IContactStore) {
      state.addContact = !state.addContact;
    },
    setAllContacts(state: IContactStore, { payload }: PayloadAction<any[]>) {
      state.allContacts = payload;
      state.isContactImported = true;
    },
    setAllContactsLoading(state: IContactStore, { payload }: PayloadAction<boolean>) {
      state.allContactsLoading = payload;
    },
    setSelectedContacts(state: IContactStore, { payload }: PayloadAction<any[]>) {
      state.selectedContacts = uniqBy(
        filter(payload, (contact) => !!contact?.contactId),
        (contact) => contact.contactId
      );
    },
    clearErrors: (state: IContactStore) => {
      state.listContactsError = '';
      state.createContactError = '';
    },
    resetSelectedContacts: (state: IContactStore) => {
      state.selectedContacts = [];
    },
    resetCreatedContact: (state: IContactStore) => {
      state.createdContactData = {} as ICreatedContact;
    },
    resetContacts: () => initialState,
  },
  extraReducers: (builder: ActionReducerMapBuilder<IContactStore>) => {
    builder.addCase(getContactsThunk.pending, (state: IContactStore) => {
      state.allContactsLoading = true;
    });

    builder.addCase(getContactsThunk.fulfilled, (state: IContactStore, { payload }) => {
      state.allContactsLoading = false;
      state.allContacts = payload.data;
      state.selectContactDialog = true;
    });

    builder.addCase(getContactsThunk.rejected, (state: IContactStore) => {
      state.allContactsLoading = false;
      state.listContactsError = 'Unable to load your contacts';
      state.importContacts = true;
    });

    builder.addCase(createContactsThunk.pending, (state: IContactStore) => {
      state.allContactsLoading = true;
      state.selectContactDialog = true;
      state.loadingMessage = 'Adding Contacts';
      state.createdContactData = {} as ICreatedContact;
    });

    builder.addCase(createContactsThunk.fulfilled, (state: IContactStore, { payload }) => {
      state.allContactsLoading = false;
      state.selectContactDialog = true;
      state.loadingMessage = '';
      state.addContact = false;
      state.createdContactData = payload;
    });

    builder.addCase(createContactsThunk.rejected, (state: IContactStore, { error }) => {
      state.allContactsLoading = false;
      state.loadingMessage = '';
      state.createContactError = error.message;
      state.addContact = true;
      state.createdContactData = {} as ICreatedContact;
    });
  },
});

export const {
  toggleImportModal,
  resetContacts,
  toggleSelectContactModal,
  toggleAddContactModal,
  setAllContacts,
  setSelectedContacts,
  setSelectContactModalOpen,
  clearErrors,
  resetSelectedContacts,
  resetCreatedContact,
} = contactSlice.actions;

export default contactSlice.reducer;
