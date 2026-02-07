import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CapturedPhoto } from '../types';
import { PHOTO_CONFIG } from '../config/constants';

interface CameraProps {
  onComplete: (photos: CapturedPhoto[]) => void;
  onBack: () => void;
  autoStart?: boolean;
  frameImageUrl?: string;
  targetPhotoCount?: number; // 촬영할 사진 개수 (기본값: 8)
  captureRatio?: number; // 촬영 비율 width/height (기본값: 3/4)
}

type CameraState = 'ready' | 'countdown' | 'capturing' | 'completed';

const Camera: React.FC<CameraProps> = ({ 
  onComplete, 
  onBack, 
  autoStart = false, 
  frameImageUrl,
  targetPhotoCount = 8,
  captureRatio = 3 / 4 // 기본값: 3:4 비율
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>('ready');
  const [countdown, setCountdown] = useState(PHOTO_CONFIG.countdownSeconds);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [error, setError] = useState<string>('');

  // 실제 촬영할 사진 개수
  const totalPhotoCount = targetPhotoCount;

  // 카메라 시작
  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user', // 전면 카메라 우선
            width: { ideal: 1080 },
            height: { ideal: 1440 },
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

  // 사진 캡처 (화면에 보이는 그대로 캡처: 카메라 + 프레임)
  const capturePhoto = useCallback(async () => {
    // 화면에 보이는 카메라 뷰 영역을 찾기
    const cameraViewElement = document.querySelector('.camera-view-container');
    if (!cameraViewElement) return null;

    try {
      // html2canvas를 사용하지 않고 직접 캡처
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      if (!video) return null;

      // 캡처할 크기 설정
      const aspectRatio = captureRatio;
      const videoRatio = video.videoWidth / video.videoHeight;

      console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
      console.log('Video ratio:', videoRatio);
      console.log('Target aspect ratio:', aspectRatio);

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = video.videoWidth;
      let sourceHeight = video.videoHeight;

      // objectFit: 'cover' 방식으로 크롭
      if (videoRatio > aspectRatio) {
        // 비디오가 더 넓음 - 좌우를 자름
        sourceWidth = video.videoHeight * aspectRatio;
        sourceX = (video.videoWidth - sourceWidth) / 2;
        console.log('비디오가 더 넓음, 좌우 자름:', { sourceX, sourceWidth });
      } else {
        // 비디오가 더 높음 - 상하를 자름
        sourceHeight = video.videoWidth / aspectRatio;
        sourceY = (video.videoHeight - sourceHeight) / 2;
        console.log('비디오가 더 높음, 상하 자름:', { sourceY, sourceHeight });
      }

      // 캔버스 크기를 원본 크롭된 크기로 설정
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;

      console.log('Canvas size:', canvas.width, 'x', canvas.height);

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // 좌우 반전 (셀카 모드)
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      
      // 카메라 영상만 캡처 (프레임 제외)
      ctx.drawImage(
        video,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, sourceWidth, sourceHeight
      );

      console.log('캡처 완료');

      return canvas.toDataURL('image/jpeg', 0.95);
    } catch (error) {
      console.error('캡처 오류:', error);
      return null;
    }
  }, [captureRatio, frameImageUrl]);


  // 촬영 시작 - 매번 카운트다운 후 자동 촬영
  const startCapturing = useCallback(() => {
    setState('countdown');
    setCountdown(PHOTO_CONFIG.countdownSeconds);

    let photoIndex = 0;
    let count = PHOTO_CONFIG.countdownSeconds;

    const captureWithCountdown = async () => {
      // 사진 촬영
      if (photoIndex < totalPhotoCount) {
        setState('capturing');
        const dataUrl = await capturePhoto();
        if (dataUrl) {
          photoIndex++;
          const newPhoto: CapturedPhoto = {
            id: photoIndex,
            dataUrl,
          };
          setCapturedPhotos((prev) => [...prev, newPhoto]);
          setCurrentPhotoIndex(photoIndex);
        }

        // 짧은 지연 후 다음 단계로 (플래시 애니메이션 시간과 동일)
        await new Promise(resolve => setTimeout(resolve, 500));

        // 마지막 사진이면 완료
        if (photoIndex >= totalPhotoCount) {
          setState('completed');
          return;
        }

        // 다음 카운트다운 시작
        setState('countdown');
        count = PHOTO_CONFIG.countdownSeconds;
        setCountdown(count);
      }
    };

    const countdownInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count === 0) {
        captureWithCountdown();
        count = PHOTO_CONFIG.countdownSeconds;
      }
    }, 1000);

    // 컴포넌트 언마운트 시 정리
    return () => clearInterval(countdownInterval);
  }, [capturePhoto, totalPhotoCount]);

  // 자동 시작
  useEffect(() => {
    if (autoStart && stream && state === 'ready') {
      // 카메라가 준비되면 자동으로 촬영 시작
      const timer = setTimeout(() => {
        startCapturing();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoStart, stream, state, startCapturing]);

  // 완료 처리
  const handleComplete = () => {
    if (capturedPhotos.length === totalPhotoCount) {
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
      <div className="h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl soft-shadow p-5 max-w-md text-center">
          <div className="text-3xl mb-2">😢</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">카메라 오류</h2>
          <p className="text-gray-600 mb-3 text-xs">{error}</p>
          <button
            onClick={onBack}
            className="w-full py-2.5 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 soft-shadow text-sm"
          >
            🔙 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-2 bg-black bg-opacity-50 flex-shrink-0">
        <button
          onClick={onBack}
          className="text-white px-3 py-2 rounded-xl hover:bg-white hover:bg-opacity-20 font-bold transition-all text-sm"
        >
          ← 뒤로
        </button>
        <div className="text-white font-bold text-sm bg-black bg-opacity-50 px-3 py-1.5 rounded-full">
          {currentPhotoIndex > 0 ? `${currentPhotoIndex} / ${captureRatio && captureRatio !== 3/4 ? 4 : totalPhotoCount}` : '📸'}
        </div>
      </div>

      {/* 카메라 뷰 */}
      <div className="relative flex items-center justify-center bg-black camera-view-container flex-1" style={{ minHeight: 0 }}>
        {/* 특별 프레임 모드 (환승대한, 문체네컷): rect 영역을 화면 전체로 확대 */}
        {captureRatio && captureRatio !== 3/4 ? (
          <div 
            className="relative overflow-hidden"
            style={(() => {
              const currentArea = state === 'ready' ? 0 : Math.min(currentPhotoIndex, 3);
              const areas = [
                { x: 65, y: 78, width: 463, height: 689 },    // 1번째
                { x: 552, y: 78, width: 463, height: 689 },   // 2번째
                { x: 65, y: 789, width: 463, height: 689 },   // 3번째
                { x: 552, y: 789, width: 463, height: 689 },  // 4번째
              ];
              const area = areas[currentArea];
              
              // viewport는 rect 영역의 비율
              return {
                aspectRatio: `${area.width}/${area.height}`,
                height: '100%',
                width: 'auto',
              };
            })()}
          >
            {/* 카메라 영상 (전체 화면, 확대 없음) */}
            <div className="absolute inset-0">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full"
                style={{
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // 좌우 반전
                }}
              />
            </div>
            
            {/* 프레임 오버레이 - rect 영역만 crop해서 확대 */}
            {frameImageUrl && (
              <div 
                className="absolute pointer-events-none z-20"
                style={(() => {
                  const currentArea = state === 'ready' ? 0 : Math.min(currentPhotoIndex, 3);
                  const areas = [
                    { x: 65, y: 78, width: 463, height: 689 },
                    { x: 552, y: 78, width: 463, height: 689 },
                    { x: 65, y: 789, width: 463, height: 689 },
                    { x: 552, y: 789, width: 463, height: 689 },
                  ];
                  const area = areas[currentArea];
                  const frameWidth = 1080;
                  const frameHeight = 1920;
                  
                  // 프레임 전체를 확대해서 rect 영역이 viewport를 채우도록
                  return {
                    width: `${(frameWidth / area.width) * 100}%`,
                    height: `${(frameHeight / area.height) * 100}%`,
                    left: `${-(area.x / area.width) * 100}%`,
                    top: `${-(area.y / area.height) * 100}%`,
                    transform: 'scaleX(-1)', // 좌우 반전
                  };
                })()}
              >
                <img
                  src={frameImageUrl}
                  alt="프레임"
                  className="w-full h-full"
                  style={{ 
                    objectFit: 'contain',
                    transform: 'scaleX(-1)', // 프레임도 좌우 반전
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          /* 일반 모드 (기본 프레임) - 프레임 오버레이 없이 */
          <div 
            className="relative overflow-hidden"
            style={{ aspectRatio: '3/4', height: '100%', width: 'auto' }}
          >
            <div className="absolute inset-0">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full"
                style={{
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                }}
              />
            </div>
          </div>
        )}
        
        {/* 캡처 영역 가이드 (프레임이 없을 때만) */}
        {!frameImageUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative h-full w-auto" style={{ aspectRatio: `${captureRatio}` }}>
              {/* 테두리 가이드 */}
              <div className="absolute inset-0 border-4 border-white opacity-60 shadow-lg"></div>
              {/* 모서리 강조 */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary"></div>
              {/* 안내 텍스트 */}
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-2 py-1 rounded-full text-xs whitespace-nowrap font-bold shadow-lg">
                 이 영역이 촬영됩니다
              </div>
            </div>
          </div>
        )}

        {/* 카운트다운 - 상단에 작게 표시 */}
        {state === 'countdown' && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-primary text-white px-6 py-3 rounded-full font-bold text-2xl shadow-lg animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* 촬영 순간 플래시 효과 */}
        {state === 'capturing' && (
          <div className="absolute inset-0 bg-white z-10 pointer-events-none animate-flash" />
        )}
      </div>

      {/* 촬영된 사진 미리보기 */}
      {capturedPhotos.length > 0 && (
        <div className="bg-black bg-opacity-50 p-1.5 flex-shrink-0">
          <div className="flex gap-1 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            {capturedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border border-white"
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
      <div className="px-3 pt-3 bg-black bg-opacity-50 flex-shrink-0 safe-bottom">
        {state === 'ready' && (
          <div className="text-center">
            <p className="text-white text-xs mb-2 font-bold">
              {PHOTO_CONFIG.countdownSeconds}초 카운트 후 자동 촬영
            </p>
            <button
              onClick={startCapturing}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold text-base hover:bg-secondary soft-shadow transform hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
               촬영 시작하기
            </button>
          </div>
        )}

        {(state === 'capturing' || state === 'countdown') && currentPhotoIndex > 0 && (
          <div className="text-center text-white">
            <div className="mb-2">
              <p className="text-base font-black mb-0.5">
                {capturedPhotos.length} / {captureRatio && captureRatio !== 3/4 ? 4 : totalPhotoCount}
              </p>
              <p className="text-xs text-gray-300">
                {state === 'countdown' 
                  ? `${countdown}초 후 다음 촬영...` 
                  : '촬영 완료!'}
              </p>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(capturedPhotos.length / totalPhotoCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {state === 'completed' && (
          <div className="space-y-2">
            <div className="text-center text-white mb-1">
              <p className="text-base font-black mb-0.5">
                {totalPhotoCount}장 촬영 완료!
              </p>
              <p className="text-xs text-gray-300">
                {captureRatio && captureRatio !== 3/4 ? '결과를 확인하세요' : '마음에 드는 사진을 선택하세요'}
              </p>
            </div>
            <button
              onClick={handleComplete}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold text-base hover:bg-secondary soft-shadow transform hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {captureRatio && captureRatio !== 3/4 ? ' 결과 보기' : ' 사진 선택하러 가기'}
            </button>
            <button
              onClick={handleRetry}
              className="w-full py-2.5 bg-gray-600 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
               다시 찍기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Camera;
