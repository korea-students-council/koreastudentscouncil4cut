import QRCode from 'qrcode';

/**
 * URL을 기반으로 QR 코드 Data URL을 생성합니다
 */
export const generateQRCode = async (url: string): Promise<string> => {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('QR 코드 생성 실패:', error);
    throw new Error('QR 코드 생성에 실패했습니다.');
  }
};
