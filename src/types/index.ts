export interface Frame {
  id: string;
  name: string;
  imageUrl: string;
  thumbnail: string;
  layout?: 'default' | 'bottom-wide'; // 레이아웃 타입
  photoCount?: number; // 촬영할 사진 개수 (기본값: 4)
  captureRatio?: number; // 촬영 비율 (width/height, 기본값: 3/4)
}

export interface CapturedPhoto {
  id: number;
  dataUrl: string;
  selected?: boolean; // 선택 여부
}

export type AppStep = 'frame-select' | 'camera' | 'photo-select' | 'result';
