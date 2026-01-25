import { PHOTO_CONFIG } from '../config/constants';
import { CapturedPhoto } from '../types';

/**
 * Canvas에 네 컷 사진을 합성하고 프레임을 오버레이합니다
 */
export const composeFourCutImage = async (
  photos: CapturedPhoto[],
  frameImageUrl?: string
): Promise<string> => {
  const { outputWidth, outputHeight } = PHOTO_CONFIG;
  
  // Canvas 생성
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context를 가져올 수 없습니다.');
  }

  // 배경을 흰색으로 설정
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, outputWidth, outputHeight);

  // 각 사진의 높이 계산 (4등분)
  const photoHeight = outputHeight / 4;

  // 4장의 사진을 순서대로 그리기
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const img = await loadImage(photo.dataUrl);
    
    const y = i * photoHeight;
    
    // 이미지를 Canvas에 그리기 (비율 유지하며 crop)
    drawImageCover(ctx, img, 0, y, outputWidth, photoHeight);
  }

  // 날짜 텍스트 추가
  addDateText(ctx, outputWidth, outputHeight);

  // 프레임이 있으면 오버레이
  if (frameImageUrl) {
    const frameImg = await loadImage(frameImageUrl);
    ctx.drawImage(frameImg, 0, 0, outputWidth, outputHeight);
  }

  // Canvas를 Data URL로 변환
  return canvas.toDataURL('image/jpeg', 0.95);
};

/**
 * 이미지를 로드하는 헬퍼 함수
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * 이미지를 비율 유지하며 Canvas에 그리기 (cover 방식)
 */
const drawImageCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const imgRatio = img.width / img.height;
  const areaRatio = width / height;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = img.width;
  let sourceHeight = img.height;

  if (imgRatio > areaRatio) {
    // 이미지가 더 넓음 - 좌우를 자름
    sourceWidth = img.height * areaRatio;
    sourceX = (img.width - sourceWidth) / 2;
  } else {
    // 이미지가 더 높음 - 상하를 자름
    sourceHeight = img.width / areaRatio;
    sourceY = (img.height - sourceHeight) / 2;
  }

  ctx.drawImage(
    img,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height
  );
};

/**
 * Canvas에 날짜 텍스트 추가
 */
const addDateText = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  ctx.save();
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  const x = width / 2;
  const y = height - 30;

  // 텍스트 외곽선
  ctx.strokeText(dateStr, x, y);
  // 텍스트
  ctx.fillText(dateStr, x, y);
  
  ctx.restore();
};
