
export interface ClientStoreLocation {
  id: number;
  label: string;
  description?: string;
  comment?: string;
  locationType?: string;
  createdAt?: string;
  updatedAt?: string;
  openTap?: boolean;
  customerPinCode?: string;
  openedAt?: string;
  status?: string;
  tapId?: string;
  isPinValid?: boolean;
}

export interface ClientStoreLocationRequest {
  label: string;
  id?: number;
  description?: string;
  comment?: string;
  locationType?: string;
  openTap?: boolean;
  customerPinCode?: string;
  openedAt?: string;
  status?: string;
  tapId?: string;
}
