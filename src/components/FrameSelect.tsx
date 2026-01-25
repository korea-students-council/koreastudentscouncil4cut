import React from 'react';
import { Frame } from '../types';

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            대한네컷 📸
          </h1>
          <p className="text-gray-600">
            프레임을 선택하고 사진을 촬영하세요
          </p>
        </div>

        {/* 프레임 선택 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            프레임 선택
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {frames.map((frame) => (
              <button
                key={frame.id}
                onClick={() => onSelectFrame(frame)}
                className={`relative p-4 rounded-xl border-4 transition-all ${
                  selectedFrame?.id === frame.id
                    ? 'border-primary shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* 프레임 미리보기 */}
                <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                  {frame.imageUrl ? (
                    <img
                      src={frame.thumbnail || frame.imageUrl}
                      alt={frame.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <svg
                        className="w-16 h-16 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm">프레임 없음</p>
                    </div>
                  )}
                </div>
                <p className="font-semibold text-gray-800 text-center">
                  {frame.name}
                </p>
                {selectedFrame?.id === frame.id && (
                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
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
              </button>
            ))}
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          onClick={onNext}
          disabled={!selectedFrame}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            selectedFrame
              ? 'bg-primary text-white hover:bg-secondary shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          촬영 시작하기
        </button>
      </div>
    </div>
  );
};

export default FrameSelect;
