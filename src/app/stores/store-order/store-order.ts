export type ClientStoreOrderStatus = 'SUBMITTED' | 'RECEIVED' | 'CLOSED' | 'CANCELLED' | 'DELETED';

export interface ClientStoreOrder {
  uuid: string;
  status: ClientStoreOrderStatus;
  location?: string;
  createdAt: string;
}
export interface OrderPdfResponse {
  blob: Blob;
  filename: string;
}

export interface BulkOrderUpdateRequest {
  uuids: string[];
  status: ClientStoreOrderStatus;
  isReady: boolean;
}
