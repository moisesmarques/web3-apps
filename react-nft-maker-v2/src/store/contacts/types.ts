export interface ImportContact {
  contactId: any;
  address: any;
  companies: any;
  email: any;
  firstName: string;
  fullName: () => void;
  groups: any;
  hasValidEmail: () => void;
  job_title: string;
  lastName: string;
  locations: any;
  phone: any;
  photos: any;
  primaryAddress: () => void;
  primaryEmail: () => void;
  primaryPhone: () => void;
  selectedAddress: () => void;
  selectedEmail: () => void;
  selectedPhone: () => void;
}

export interface ICreatedContact {
  contactId: string;
  email?: any;
  firstName: string;
  isFavorite: boolean;
  lastName: string;
  userId: string;
  phone?: any;
}

export interface IContactStore {
  importContacts: boolean;
  selectContactDialog: boolean;
  addContact: boolean;
  allContacts: ImportContact[] | [];
  allContactsLoading: boolean;
  selectedContacts: ImportContact[] | [];
  isContactImported: boolean;
  loadingMessage: string;
  listContactsError: string;
  createContactError: string | undefined;
  createdContactData: ICreatedContact;
}
