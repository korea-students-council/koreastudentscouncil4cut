export interface Frame {
  id: string;
  name: string;
  imageUrl: string;
  thumbnail: string;
}

export interface CapturedPhoto {
  id: number;
  dataUrl: string;
}

export type AppStep = 'frame-select' | 'camera' | 'result';
