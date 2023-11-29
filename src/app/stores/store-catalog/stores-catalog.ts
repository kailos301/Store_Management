import { Language } from 'src/app/api/types/Language';

export interface CategoriesListResponse {
  categories: Category[];
}

export interface Category {
  name: string;
  categoryId: number;
  offers: Offer[];
  position: number;
  availability: number;
  catalogId: number;
}

export interface StoreCatalog {
  categories: Category[];
  offers: Offer[];
  catalogId: number;
  currency: string;
}

export interface TranslateCatalogXlsResponse {
  blob: Blob;
  filename: string;
}

export interface ToUpdateCatalogXlsResponse {
  blob: Blob;
  filename: string;
}
export interface PatchSaveOfferView {
  offerId: number;
  name: string;
  stockLevel: number;
  isOrderable: boolean;
  isStockCheckEnabled: boolean;
  isslotagaistcheckenabled: boolean;
}

export interface SaveOfferView {
  offerId: number;
  name: string;
  shortDescription: string;
  externalProductId: string;
  longDescription: string;
  price: number;
  stockLevel: number;
  incrementbyLevel: number;
  discount: number;
  categoryId: number;
  position: number;
  scheduleId: number;
  discountType: string;
  isSellable: boolean;
  isStockCheckEnabled: boolean;
  isslotagaistcheckenabled: boolean;
  countAgainstSlots: string;
  isOrderable: boolean;
  standardImage: string;
  languageTranslation: ContentItemModel[];
  hierarchyLevel: string;
  contentItemId: number;
  categories: SaveCategoryView[];
  priceDescription: string;
  parentOfferId: number;
  variants: SaveOfferView[];
  priceDecimal: number;
  discountDecimal: number;
  attributeDtos: KeyValuePair[];
  vatPercentage?: number;
  preselected: boolean;
  vatExternalId: string;
}

export interface SaveCategoryView {
  categoryId: number;
  name: string;
  shortDescription: string;
  longDescription: string;
  position: number;
  scheduleId: number;
  catalogId: number;
  aliasName: string;
  isSellable: boolean;
  languageTranslation: ContentItemModel[];
  hierarchyLevel: string;
  contentItemId: number;
  min: number;
  max: number;
  offers: SaveOfferView[];
  groupType: string;
  parentOfferId: number;
  countAgainstSlots: string;
  orderMultipleSameItem?: boolean;
  orderMultipleSameItem1?: boolean;
  orderMultipleSameItem2?: boolean;
}

export interface SaveOfferPositionView {
  offers: Offer[];
}
export interface SaveCategoryPositionView {
  categories: Category[];
}

export interface AssociateOffersView {
  offers: Offer[];
}
export interface AssociateCategoriesView {
  categories: Category[];
}

export interface Offer {
  offerId: number;
  name: string;
  price: number;
  discount: number;
  categoryId: number;
  position: number;
  availability: number;
  contentItem?: ContentItemModel[];
  discountType: string;
  aliasName?: string;
  sellable: boolean;
  global?: boolean;
  catalogId: number;
  image?: ImageData;  // needed to be (at least optionally) defined for public interface
  options?: any[];    // needed to be (at least optionally) defined for public interface
  standardImage: string;
  countAgainstSlots: string;
  attributeDtos: KeyValuePair[];
}

export interface ContentItemModel {
  languageId: number;
  name?: string;
  shortDescription?: string;
  longDescription?: string;
  priceDescription?: string;
}

export interface ContentItemView {
  languageTranslation?: ContentItemModel[];
  standardImage?: string;
}


export interface OrderItem {
  itemName?: string;
  offerId: number;
  quantity: number;
  totalPrice?: number;
  uuid?: string;
}

export interface Availability {
  id: number;
  startTime: string;
  endTime: string;
}

export interface UploadFileResponse {
  fileName: string;
  fileDownloadUri: string;
  fileType: string;
  size: number;
}
export interface TranslationDialogData {
  languageList: Language[];
  translation: ContentItemModel;
  mode: string;
  source: string;
}

export interface DeleteDialogData {
  mode: string;
  message: string;
}

export interface KeyValuePair {
  key: string;
  value: boolean;
}

export interface ImportCatalogData {
  externalDomain: string;
  externalReference: string;
}

export interface ImportCatalogResponse {
  message: string;
  status: string;
  storeId: number;
}

export interface OfferImageResponse {
  blob: Blob;
  filename: string;
}
