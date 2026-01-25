import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CapturedPhoto } from '../types';
import { PHOTO_CONFIG } from '../config/constants';

interface CameraProps {
  onComplete: (photos: CapturedPhoto[]) => void;
  onBack: () => void;
}

type CameraState = 'ready' | 'countdown' | 'capturing' | 'completed';

const Camera: React.FC<CameraProps> = ({ onComplete, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>('ready');
  const [countdown, setCountdown] = useState(PHOTO_CONFIG.countdownSeconds);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [error, setError] = useState<string>('');

  // 카메라 시작
  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user', // 전면 카메라 우선
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (mounted && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        console.error('카메라 접근 오류:', err);
        setError('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 카메라 정리
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // 사진 캡처
  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 좌우 반전 (셀카 모드)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.95);
  }, []);

  // 촬영 시작
  const startCapturing = useCallback(() => {
    setState('countdown');
    setCountdown(PHOTO_CONFIG.countdownSeconds);

    let count = PHOTO_CONFIG.countdownSeconds;
    const countdownInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count === 0) {
        clearInterval(countdownInterval);
        setState('capturing');

        // 첫 번째 사진 촬영
        const dataUrl = capturePhoto();
        if (dataUrl) {
          const newPhoto: CapturedPhoto = {
            id: 1,
            dataUrl,
          };
          setCapturedPhotos([newPhoto]);
          setCurrentPhotoIndex(1);

          // 나머지 사진들을 순차적으로 촬영
          let photoIndex = 2;
          const captureInterval = setInterval(() => {
            if (photoIndex > PHOTO_CONFIG.photoCount) {
              clearInterval(captureInterval);
              setState('completed');
              return;
            }

            const dataUrl = capturePhoto();
            if (dataUrl) {
              const newPhoto: CapturedPhoto = {
                id: photoIndex,
                dataUrl,
              };
              setCapturedPhotos((prev) => [...prev, newPhoto]);
              setCurrentPhotoIndex(photoIndex);
            }
            photoIndex++;
          }, PHOTO_CONFIG.delayBetweenPhotos);
        }
      }
    }, 1000);
  }, [capturePhoto]);

  // 완료 처리
  const handleComplete = () => {
    if (capturedPhotos.length === PHOTO_CONFIG.photoCount) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      onComplete(capturedPhotos);
    }
  };

  // 재촬영
  const handleRetry = () => {
    setState('ready');
    setCapturedPhotos([]);
    setCurrentPhotoIndex(0);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">오류</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50">
        <button
          onClick={onBack}
          className="text-white px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20"
        >
          ← 뒤로
        </button>
        <div className="text-white font-bold">
          {currentPhotoIndex > 0 && `${currentPhotoIndex} / ${PHOTO_CONFIG.photoCount}`}
        </div>
      </div>

      {/* 카메라 뷰 */}
      <div className="flex-1 relative flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* 카운트다운 오버레이 */}
        {state === 'countdown' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-white text-9xl font-bold animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* 촬영 중 표시 */}
        {state === 'capturing' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-xl shadow-xl">
              📸 촬영 중... {currentPhotoIndex} / {PHOTO_CONFIG.photoCount}
            </div>
          </div>
        )}
      </div>

      {/* 촬영된 사진 미리보기 */}
      {capturedPhotos.length > 0 && (
        <div className="bg-black bg-opacity-50 p-4">
          <div className="flex gap-2 overflow-x-auto">
            {capturedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-white"
              >
                <img
                  src={photo.dataUrl}
                  alt={`사진 ${photo.id}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 컨트롤 버튼 */}
      <div className="p-6 bg-black bg-opacity-50">
        {state === 'ready' && (
          <button
            onClick={startCapturing}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-secondary shadow-lg"
          >
            촬영 시작
          </button>
        )}

        {state === 'completed' && (
          <div className="flex gap-4">
            <button
              onClick={handleRetry}
              className="flex-1 py-4 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700"
            >
              다시 찍기
            </button>
            <button
              onClick={handleComplete}
              className="flex-1 py-4 bg-primary text-white rounded-xl font-bold hover:bg-secondary shadow-lg"
            >
              완료
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Camera;
