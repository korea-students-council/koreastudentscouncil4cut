import React, { useState, useEffect } from 'react';
import { CapturedPhoto, Frame } from '../types';
import { composeFourCutImage } from '../utils/imageComposer';
import { uploadToCloudinary } from '../utils/cloudinary';
import { generateQRCode } from '../utils/qrcode';
import Toast from './Toast';

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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    processImages();
  }, []);

  const processImages = async () => {
    try {
      // 1. 이미지 합성 (프레임 위에 사진 배치)
      setState('composing');
      setProgress('이미지를 합성하고 있습니다...');
      
      // 선택한 프레임을 사용하여 합성
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
        setToast({ message: '링크가 클립보드에 복사되었습니다!', type: 'success' });
      } catch (err) {
        console.error('복사 실패:', err);
        setToast({ message: '복사에 실패했습니다.', type: 'error' });
      }
    }
  };

  if (state === 'composing' || state === 'uploading') {
    return (
      <div className="h-screen photobooth-bg-alt flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl soft-shadow p-5 max-w-md text-center">
          <div className="text-3xl mb-3 animate-bounce">✨</div>
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary mx-auto mb-3"></div>
          <h2 className="text-lg font-bold text-gray-800 mb-1.5">처리 중...</h2>
          <p className="text-gray-600 text-xs">{progress}</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="h-screen photobooth-bg-alt flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl soft-shadow p-5 max-w-md text-center">
          <div className="text-3xl mb-2">😢</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-3 text-xs">{error}</p>
          {composedImageUrl && (
            <button
              onClick={handleDownload}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-secondary mb-1.5 soft-shadow text-sm"
            >
              💾 이미지 다운로드
            </button>
          )}
          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 text-sm"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen photobooth-bg-alt flex flex-col overflow-hidden">
      <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
        {/* 헤더 */}
        <div className="text-center py-2 px-3 flex-shrink-0">
          <h1 className="text-xl font-black text-gray-800 mb-0.5">완성!</h1>
          <p className="text-gray-600 text-xs font-medium">네 컷 사진이 완성되었습니다</p>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 flex flex-col px-3 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* 완성된 이미지 */}
          <div className="bg-white rounded-2xl soft-shadow p-2 mb-2 flex items-center justify-center">
            <div className="bg-gray-50 rounded-xl overflow-hidden" style={{ aspectRatio: 1080 / 1920, maxHeight: '60vh', width: 'auto' }}>
              {composedImageUrl && (
                <img
                  src={composedImageUrl}
                  alt="완성된 네 컷 사진"
                  className="w-full h-full"
                  style={{ objectFit: 'contain' }}
                />
              )}
            </div>
          </div>

          {/* QR 코드 - 더 컴팩트하게 */}
          {qrCodeUrl && (
            <div className="bg-white rounded-xl soft-shadow p-2 text-center flex-shrink-0">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-800">📱 QR 코드로 다운로드</span>
              </div>
              <div className="inline-block p-1.5 bg-gray-50 rounded-lg">
                <img
                  src={qrCodeUrl}
                  alt="QR 코드"
                  className="w-20 h-20"
                />
              </div>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex-shrink-0 px-3 pt-3 space-y-1.5 bg-gradient-to-t from-gray-100 to-transparent safe-bottom">
          <button
            onClick={handleDownload}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-secondary soft-shadow flex items-center justify-center gap-1.5 transform hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            이미지 다운로드
          </button>

          {uploadedImageUrl && (
            <button
              onClick={handleShare}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 soft-shadow flex items-center justify-center gap-1.5 transform hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              공유하기
            </button>
          )}

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-gray-500 text-white rounded-xl font-bold text-xs hover:bg-gray-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            🔄 처음으로 돌아가기
          </button>
        </div>
      </div>

      {/* Toast 알림 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Result;
