import React, { useState, useEffect } from 'react';
import { CapturedPhoto, Frame } from '../types';
import { composeFourCutImage } from '../utils/imageComposer';
import { uploadToCloudinary } from '../utils/cloudinary';
import { generateQRCode } from '../utils/qrcode';

interface ResultProps {
  photos: CapturedPhoto[];
  frame: Frame | null;
  onRestart: () => void;
}

type ResultState = 'composing' | 'uploading' | 'success' | 'error';

const Result: React.FC<ResultProps> = ({ photos, frame, onRestart }) => {
  const [state, setState] = useState<ResultState>('composing');
  const [composedImageUrl, setComposedImageUrl] = useState<string>('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<string>('');

  useEffect(() => {
    processImages();
  }, []);

  const processImages = async () => {
    try {
      // 1. 이미지 합성
      setState('composing');
      setProgress('이미지를 합성하고 있습니다...');
      
      const frameUrl = frame?.imageUrl || undefined;
      const composedDataUrl = await composeFourCutImage(photos, frameUrl);
      setComposedImageUrl(composedDataUrl);

      // 2. Cloudinary 업로드
      setState('uploading');
      setProgress('이미지를 업로드하고 있습니다...');
      
      const uploadedUrl = await uploadToCloudinary(composedDataUrl);
      setUploadedImageUrl(uploadedUrl);

      // 3. QR 코드 생성
      setProgress('QR 코드를 생성하고 있습니다...');
      const qrUrl = await generateQRCode(uploadedUrl);
      setQrCodeUrl(qrUrl);

      setState('success');
    } catch (err) {
      console.error('처리 오류:', err);
      setState('error');
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const handleDownload = () => {
    if (!composedImageUrl) return;

    const link = document.createElement('a');
    link.href = composedImageUrl;
    link.download = `네컷사진_${new Date().getTime()}.jpg`;
    link.click();
  };

  const handleShare = async () => {
    if (!uploadedImageUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '네 컷 사진',
          text: '내 네 컷 사진을 확인해보세요!',
          url: uploadedImageUrl,
        });
      } catch (err) {
        console.error('공유 실패:', err);
      }
    } else {
      // 클립보드에 복사
      try {
        await navigator.clipboard.writeText(uploadedImageUrl);
        alert('링크가 클립보드에 복사되었습니다!');
      } catch (err) {
        console.error('복사 실패:', err);
      }
    }
  };

  if (state === 'composing' || state === 'uploading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">처리 중...</h2>
          <p className="text-gray-600">{progress}</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">오류 발생</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          {composedImageUrl && (
            <button
              onClick={handleDownload}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-secondary mb-3"
            >
              이미지 다운로드 (로컬)
            </button>
          )}
          <button
            onClick={onRestart}
            className="w-full py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">완성! 🎉</h1>
          <p className="text-gray-600">네 컷 사진이 완성되었습니다</p>
        </div>

        {/* 완성된 이미지 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden mb-4">
            {composedImageUrl && (
              <img
                src={composedImageUrl}
                alt="완성된 네 컷 사진"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>

        {/* QR 코드 */}
        {qrCodeUrl && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              QR 코드로 다운로드
            </h3>
            <div className="inline-block p-4 bg-white rounded-lg border-4 border-gray-200">
              <img
                src={qrCodeUrl}
                alt="QR 코드"
                className="w-48 h-48"
              />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              QR 코드를 스캔하면 이미지를 다운로드할 수 있습니다
            </p>
            {uploadedImageUrl && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg break-all text-xs text-gray-600">
                {uploadedImageUrl}
              </div>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <button
            onClick={handleDownload}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-secondary shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            이미지 다운로드
          </button>

          {uploadedImageUrl && (
            <button
              onClick={handleShare}
              className="w-full py-4 bg-blue-500 text-white rounded-xl font-bold text-lg hover:bg-blue-600 shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              공유하기
            </button>
          )}

          <button
            onClick={onRestart}
            className="w-full py-4 bg-gray-600 text-white rounded-xl font-bold text-lg hover:bg-gray-700"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;
