import React, { useState } from 'react';
import FrameSelect from './components/FrameSelect';
import Camera from './components/Camera';
import PhotoSelect from './components/PhotoSelect';
import Result from './components/Result';
import { Frame, CapturedPhoto, AppStep } from './types';
import { FRAMES } from './config/constants';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('frame-select');
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);

  const handleFrameSelect = (frame: Frame) => {
    setSelectedFrame(frame);
  };

  const handleStartCamera = () => {
    if (selectedFrame) {
      setCurrentStep('camera');
    }
  };

  const handleCaptureComplete = (photos: CapturedPhoto[]) => {
    setCapturedPhotos(photos);
    // 특별 프레임(환승대한, 문체네컷)은 사진 선택 화면을 건너뛰고 바로 결과로
    if (selectedFrame?.id === 'frame-hwanseung' || selectedFrame?.id === 'frame-munche') {
      setCurrentStep('result');
    } else {
      setCurrentStep('photo-select');
    }
  };

  const handlePhotoSelectComplete = (selectedPhotos: CapturedPhoto[]) => {
    setCapturedPhotos(selectedPhotos);
    setCurrentStep('result');
  };

  const handleBackToCamera = () => {
    setCurrentStep('camera');
    setCapturedPhotos([]);
  };

  const handleBackToFrameSelect = () => {
    setCurrentStep('frame-select');
  };

  const handleRestart = () => {
    setCurrentStep('frame-select');
    setSelectedFrame(null);
    setCapturedPhotos([]);
  };

  return (
    <>
      {currentStep === 'frame-select' && (
        <FrameSelect
          frames={FRAMES}
          selectedFrame={selectedFrame}
          onSelectFrame={handleFrameSelect}
          onNext={handleStartCamera}
        />
      )}

      {currentStep === 'camera' && (
        <Camera
          onComplete={handleCaptureComplete}
          onBack={handleBackToFrameSelect}
          autoStart={true}
          frameImageUrl={selectedFrame?.imageUrl}
          targetPhotoCount={selectedFrame?.photoCount || 4}
          captureRatio={selectedFrame?.captureRatio}
        />
      )}

      {currentStep === 'photo-select' && (
        <PhotoSelect
          photos={capturedPhotos}
          onComplete={handlePhotoSelectComplete}
          onBack={handleBackToCamera}
          requiredPhotoCount={selectedFrame?.photoCount === 8 ? 4 : (selectedFrame?.photoCount || 4)}
          photosPerArea={selectedFrame?.photoCount === 8 ? 2 : 1}
        />
      )}

      {currentStep === 'result' && (
        <Result
          photos={capturedPhotos}
          frame={selectedFrame}
          onRestart={handleRestart}
        />
      )}
    </>
  );
};

export default App;
