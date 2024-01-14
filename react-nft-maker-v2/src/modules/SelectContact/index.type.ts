export interface FormValues {
  email: string;
  phone: string;
}

export interface ImportContact {
  address: any;
  companies: any;
  contactId: any;
  email: { address: string }[];
  firstName: string;
  fullName: () => void;
  groups: any;
  hasValidEmail: () => void;
  job_title: string;
  lastName: string;
  locations: any;
  phone: { number?: string; type?: string }[];
  photos: any;
  primaryAddress: () => void;
  primaryEmail: () => void;
  primaryPhone: () => void;
  selectedAddress: () => void;
  selectedEmail: () => void;
  selectedPhone: () => void;
}

/**
 * @interface CustomWindow - extended window with custom props type
 * @param {cloudsponge} - cloudsponge props
 */
export interface CustomWindow extends Window {
  cloudsponge?: any;
}
