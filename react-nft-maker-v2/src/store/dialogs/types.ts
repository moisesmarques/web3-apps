export interface IDialogsStatus {
  isSendNftDialogOpen: boolean;
  isCreateNftDialogOpen: boolean;
  isSelectContactOpen: boolean;
  isSelectContactLater: boolean;
  selectedNftId?: string;
  setSelectedNftToFirstPosition?: boolean;
}
