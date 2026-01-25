import { CLOUDINARY_CONFIG } from '../config/constants';

/**
 * Cloudinary에 이미지를 업로드합니다 (unsigned upload)
 */
export const uploadToCloudinary = async (
  dataUrl: string
): Promise<string> => {
  const { cloudName, uploadPreset } = CLOUDINARY_CONFIG;

  if (!cloudName || cloudName === 'YOUR_CLOUD_NAME') {
    throw new Error('Cloudinary 설정이 필요합니다. src/config/constants.ts를 확인하세요.');
  }

  // Data URL을 Blob으로 변환
  const blob = await dataUrlToBlob(dataUrl);

  // FormData 생성
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', uploadPreset);

  // Cloudinary에 업로드
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('이미지 업로드에 실패했습니다.');
  }

  const data = await response.json();
  return data.secure_url;
};

/**
 * Data URL을 Blob으로 변환
 */
const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  return response.blob();
};
