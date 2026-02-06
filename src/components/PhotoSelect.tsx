import React, { useState } from 'react';
import { CapturedPhoto } from '../types';

interface PhotoSelectProps {
  photos: CapturedPhoto[];
  onComplete: (selectedPhotos: CapturedPhoto[]) => void;
  onBack: () => void;
  requiredPhotoCount?: number; // 선택할 사진 개수 (기본값: 4)
  photosPerArea?: number; // 사용하지 않지만 호환성을 위해 남겨둠
}

const PhotoSelect: React.FC<PhotoSelectProps> = ({ 
  photos, 
  onComplete, 
  onBack, 
  requiredPhotoCount = 4,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const togglePhoto = (photoId: number) => {
    if (selectedIds.includes(photoId)) {
      // 이미 선택된 사진이면 선택 해제
      setSelectedIds(selectedIds.filter(id => id !== photoId));
    } else {
      // 최대 개수만큼만 선택 가능
      if (selectedIds.length < requiredPhotoCount) {
        setSelectedIds([...selectedIds, photoId]);
      }
    }
  };

  const handleComplete = () => {
    if (selectedIds.length === requiredPhotoCount) {
      // 선택된 사진들을 순서대로 정렬하여 반환
      const selectedPhotos = selectedIds
        .map((id, index) => {
          const photo = photos.find(p => p.id === id);
          return photo ? { ...photo, id: index + 1 } : null;
        })
        .filter((photo): photo is CapturedPhoto => photo !== null);
      
      onComplete(selectedPhotos);
    }
  };

  return (
    <div className="h-screen photobooth-bg-alt overflow-hidden flex flex-col">
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
        {/* 헤더 */}
        <div className="text-center py-2 px-3 flex-shrink-0">
          <div className="text-2xl mb-1">🖼️</div>
          <h1 className="text-xl font-black text-gray-800 mb-1">
            사진 선택
          </h1>
          <p className="text-xs text-gray-600 font-medium mb-1.5">
            마음에 드는 사진 {requiredPhotoCount}장을 선택해주세요
          </p>
          <div className="inline-block bg-white rounded-full px-3 py-1.5 soft-shadow">
            <span className="text-lg font-black text-primary">
              {selectedIds.length}
            </span>
            <span className="text-gray-600 font-bold text-xs">
              {' '}/ {requiredPhotoCount}
            </span>
          </div>
        </div>

        {/* 사진 그리드 - 전체 사진 표시 */}
        <div className="flex-1 overflow-y-auto px-3 min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="bg-white rounded-xl p-2 soft-shadow mb-2">
            <div className="grid grid-cols-2 gap-2 pb-2">
              {photos.map((photo, index) => {
                const isSelected = selectedIds.includes(photo.id);
                const selectionOrder = selectedIds.indexOf(photo.id) + 1;

                return (
                  <button
                    key={photo.id}
                    onClick={() => togglePhoto(photo.id)}
                    className={`relative aspect-[463/689] rounded-xl overflow-hidden transition-all transform ${
                      isSelected
                        ? 'ring-4 ring-primary scale-[0.98] shadow-lg'
                        : 'hover:scale-[1.02] shadow-md hover:shadow-lg'
                    }`}
                    disabled={!isSelected && selectedIds.length >= requiredPhotoCount}
                  >
                    <img
                      src={photo.dataUrl}
                      alt={`사진 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* 사진 번호 */}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>

                    {/* 선택 순서 표시 */}
                    {isSelected && (
                      <>
                        <div className="absolute inset-0 bg-primary bg-opacity-20 flex items-center justify-center">
                          <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                            <span className="text-2xl font-black">{selectionOrder}</span>
                          </div>
                        </div>
                        
                        {/* 체크 표시 */}
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1.5 shadow-lg">
                          <svg
                            className="w-4 h-4"
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
                      </>
                    )}

                    {/* 선택 불가 오버레이 */}
                    {!isSelected && selectedIds.length >= requiredPhotoCount && (
                      <div className="absolute inset-0 bg-black bg-opacity-50" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex-shrink-0 px-3 pt-3 pb-2 space-y-1.5 bg-gray-50 border-t border-gray-200 safe-bottom" style={{ zIndex: 10 }}>
          <button
            onClick={handleComplete}
            disabled={selectedIds.length !== requiredPhotoCount}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all transform ${
              selectedIds.length === requiredPhotoCount
                ? 'bg-primary text-white hover:bg-secondary soft-shadow hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedIds.length === requiredPhotoCount
              ? ' 선택 완료'
              : `${requiredPhotoCount - selectedIds.length}장 더 선택`}
          </button>

          <button
            onClick={onBack}
            className="w-full py-2.5 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all text-xs"
          >
             다시 촬영하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoSelect;
