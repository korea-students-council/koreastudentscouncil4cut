import React, { useState } from 'react';
import FrameSelect from './components/FrameSelect';
import Camera from './components/Camera';
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
    setCurrentStep('result');
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
