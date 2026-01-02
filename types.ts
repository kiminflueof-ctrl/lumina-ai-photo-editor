
export interface ImageData {
  base64: string;
  mimeType: string;
}

export interface HistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

export enum EditMode {
  REMOVE_BG = 'REMOVE_BG',
  REPLACE_BG = 'REPLACE_BG',
  ENHANCE = 'ENHANCE',
  STYLE = 'STYLE'
}

export interface ProcessingState {
  isProcessing: boolean;
  statusMessage: string;
}
