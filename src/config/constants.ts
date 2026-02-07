// 프레임 데이터 설정
// 실제 사용 시 public/frames 폴더에 PNG 파일을 추가하거나
// Cloudinary URL로 변경하세요

import { Frame } from '../types';

export const FRAMES: Frame[] = [
  {
    id: 'frame-white',
    name: '대한네컷 화이트',
    imageUrl: '/frames/frame-white.png',
    thumbnail: '/frames/frame-white.png',
    layout: 'default',
    photoCount: 6, // 6장 촬영 후 4장 선택
  },
  {
    id: 'frame-black',
    name: '대한네컷 블랙',
    imageUrl: '/frames/frame-black.png',
    thumbnail: '/frames/frame-black.png',
    layout: 'default',
    photoCount: 6, // 6장 촬영 후 4장 선택
  },
  {
    id: 'frame-hwanseung',
    name: '환승대한',
    imageUrl: '/frames/frame-hwanseung.png',
    thumbnail: '/frames/frame-hwanseung.png',
    layout: 'default', // 4개 영역
    photoCount: 4, // 4장만 촬영 (각 영역마다 1장씩)
    captureRatio: 463 / 689, // 각 영역의 비율로 촬영
  },
  {
    id: 'frame-munche',
    name: '문체네컷',
    imageUrl: '/frames/frame-munche.png',
    thumbnail: '/frames/frame-munche.png',
    layout: 'default',
    photoCount: 4, // 4장만 촬영 (각 영역마다 1장씩)
    captureRatio: 463 / 689,
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
  outputWidth: 1080, // 최종 이미지 너비 (프레임 원본 비율)
  outputHeight: 1920, // 최종 이미지 높이 (프레임 원본 비율)
  totalPhotoCount: 8, // 촬영할 전체 사진 개수
  selectedPhotoCount: 4, // 최종 선택할 사진 개수
  countdownSeconds: 7, // 촬영 전 카운트다운 시간 (10초)
  captureInterval: 1000, // 각 촬영 간격 (밀리초)
};
