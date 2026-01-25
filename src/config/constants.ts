// 프레임 데이터 설정
// 실제 사용 시 public/frames 폴더에 PNG 파일을 추가하거나
// Cloudinary URL로 변경하세요

import { Frame } from '../types';

export const FRAMES: Frame[] = [
  {
    id: 'frame-1',
    name: '클래식',
    imageUrl: '/frames/frame-1.png',
    thumbnail: '/frames/frame-1-thumb.png',
  },
  {
    id: 'frame-2',
    name: '하트',
    imageUrl: '/frames/frame-2.png',
    thumbnail: '/frames/frame-2-thumb.png',
  },
  {
    id: 'frame-3',
    name: '빈티지',
    imageUrl: '/frames/frame-3.png',
    thumbnail: '/frames/frame-3-thumb.png',
  },
  {
    id: 'no-frame',
    name: '프레임 없음',
    imageUrl: '',
    thumbnail: '',
  },
];

// Cloudinary 설정 (unsigned upload 사용)
// 환경 변수는 .env 파일에서 설정하세요
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
};

// 네 컷 사진 설정
export const PHOTO_CONFIG = {
  outputWidth: 1080, // 최종 이미지 너비
  outputHeight: 1920, // 최종 이미지 높이 (세로형 4:3 비율)
  photoCount: 4, // 촬영할 사진 개수
  countdownSeconds: 3, // 촬영 전 카운트다운 시간
  delayBetweenPhotos: 2000, // 각 촬영 간격 (밀리초)
};
