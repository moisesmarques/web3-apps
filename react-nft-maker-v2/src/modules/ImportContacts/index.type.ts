export interface FormValues {
  email: string;
  phone: string;
}

export interface ImportContact {
  address: any;
  companies: any;
  email: any;
  contactId: string;
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

export interface ImportContactsProps {
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: { address: string; type: string }[];
  phone: { number: string; type: string }[];
  address: [
    {
      street?: string;
      city?: string;
      region?: string;
      country?: string;
      postalCode?: string;
      type?: string;
    }
  ];
  companies: string[];
  groups: string[];
  importSource: string;
  appId?: string;
}

/**
 * @interface CustomWindow - extended window with custom props type
 * @param {cloudsponge} - cloudsponge props
 */
export interface CustomWindow extends Window {
  cloudsponge?: any;
}
