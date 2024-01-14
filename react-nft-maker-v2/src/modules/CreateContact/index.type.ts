export interface FormValues {
  email: string;
  phone: string;
}

export interface ImportContact {
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

export interface CreateContactValues {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
}

/**
 * @interface CustomWindow - extended window with custom props type
 * @param {cloudsponge} - cloudsponge props
 */
export interface CustomWindow extends Window {
  cloudsponge?: any;
}
