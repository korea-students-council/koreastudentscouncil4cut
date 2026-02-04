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

  // 항상 default 레이아웃 사용 (4개 영역)
  const photoAreas = [
    { x: 65, y: 78, width: 463, height: 689 },    // 좌상
    { x: 552, y: 78, width: 463, height: 689 },   // 우상
    { x: 65, y: 789, width: 463, height: 689 },   // 좌하
    { x: 552, y: 789, width: 463, height: 689 },  // 우하
  ];

  // 4장의 사진을 정확한 위치에 배치
  for (let i = 0; i < photos.length && i < 4; i++) {
    const photo = photos[i];
    const img = await loadImage(photo.dataUrl);
    const area = photoAreas[i];
    
    // 이미지를 Canvas에 그리기 (비율 유지하며 crop)
    drawImageCover(ctx, img, area.x, area.y, area.width, area.height);
  }

  // 프레임이 있으면 오버레이 (반전 없이 그대로)
  if (frameImageUrl) {
    const frameImg = await loadImage(frameImageUrl);
    console.log('프레임 로드 완료, 반전 없이 그리기');
    ctx.drawImage(frameImg, 0, 0, outputWidth, outputHeight);
    console.log('프레임 그리기 완료');
  }

  // 날짜 텍스트 추가 (프레임 하단 여백에 배치)
  addDateText(ctx, outputWidth, outputHeight);

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
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  // 프레임 하단 중앙에 배치 (y: 1500 근처)
  const x = width / 2;
  const y = height - 380; // 프레임 하단 여백 고려

  // 텍스트 외곽선
  ctx.strokeText(dateStr, x, y);
  // 텍스트
  ctx.fillText(dateStr, x, y);
  
  ctx.restore();
};
