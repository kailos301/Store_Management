export interface SameDayOrderingError {
  code: string;
  additionalInfo: Array<{
    id: number;
    offerName: string;
  }>;
}
