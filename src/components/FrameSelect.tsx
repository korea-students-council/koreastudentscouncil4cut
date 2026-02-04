import React, { useRef, useEffect, useState } from 'react';
import { Frame } from '../types';
import Toast from './Toast';

interface FrameSelectProps {
  frames: Frame[];
  selectedFrame: Frame | null;
  onSelectFrame: (frame: Frame) => void;
  onNext: () => void;
}

const FrameSelect: React.FC<FrameSelectProps> = ({
  frames,
  selectedFrame,
  onSelectFrame,
  onNext,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // 스크롤 이벤트로 중앙 프레임 감지
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const itemWidth = container.offsetWidth;
      const index = Math.round(scrollLeft / itemWidth);
      
      if (index !== currentIndex && index >= 0 && index < frames.length) {
        setCurrentIndex(index);
        onSelectFrame(frames[index]);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, frames, onSelectFrame]);

  // 초기 선택
  useEffect(() => {
    if (!selectedFrame && frames.length > 0) {
      onSelectFrame(frames[0]);
    }
  }, []);

  return (
    <div className="h-screen photobooth-bg overflow-hidden flex flex-col">
      <div className="w-full h-full flex flex-col">
        {/* 헤더 */}
        <div className="text-center py-10 px-4">
          <h1 className="text-5xl font-black text-gray-800 mb-2 brand-title">
            대한네컷
          </h1>
          <p className="text-sm text-gray-600">
            좌우로 스와이프하여 프레임을 선택하세요
          </p>
        </div>

        {/* 프레임 슬라이드 */}
        <div className="flex-1 relative">
          <div
            ref={scrollContainerRef}
            className="frame-slider h-full overflow-x-scroll overflow-y-hidden snap-x snap-mandatory flex"
            style={{
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {frames.map((frame) => (
              <div
                key={frame.id}
                className="snap-center flex-shrink-0 w-full h-full flex items-center justify-center px-4"
              >
                <div className={`bg-white rounded-3xl soft-shadow p-8 w-full max-w-lg transition-all duration-300 ${
                  selectedFrame?.id === frame.id
                    ? 'scale-100 opacity-100'
                    : 'scale-90 opacity-60'
                }`}>
                  {/* 프레임 미리보기 */}
                  <div className="aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden mb-6 relative">
                    <img
                      src={frame.thumbnail || frame.imageUrl}
                      alt={frame.name}
                      className="w-full h-full object-contain"
                    />
                    {selectedFrame?.id === frame.id && (
                      <div className="absolute top-4 right-4 bg-primary text-white rounded-full p-3 shadow-lg">
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 text-center">
                    {frame.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* 인디케이터 */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {frames.map((frame) => (
              <div
                key={frame.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  selectedFrame?.id === frame.id
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 다음 버튼 */}
        <div className="p-4">
          <button
            onClick={() => {
              if (selectedFrame) {
                // 특별 프레임(환승대한, 문체네컷) 여부 확인
                const isSpecialFrame = selectedFrame.id === 'frame-hwanseung' || selectedFrame.id === 'frame-munche';
                
                setToast({ 
                  message: isSpecialFrame 
                    ? '2초 카운트다운 후 자동으로 촬영이 시작됩니다!\n\n총 4장의 사진이 촬영됩니다.' 
                    : '2초 카운트다운 후 자동으로 촬영이 시작됩니다!\n\n총 8장의 사진이 촬영되며, 그 중 4장을 선택할 수 있습니다.', 
                  type: 'info' 
                });
                setTimeout(() => {
                  onNext();
                }, 2000);
              }
            }}
            disabled={!selectedFrame}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
              selectedFrame
                ? 'bg-primary text-white hover:bg-secondary soft-shadow'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedFrame ? ' 촬영 시작하기' : '프레임을 선택해주세요'}
          </button>
        </div>

        {/* Toast 알림 */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
            duration={2000}
          />
        )}
      </div>
    </div>
  );
};

export default FrameSelect;
