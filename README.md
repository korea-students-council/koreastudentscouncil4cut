# 대한네컷 - 웹 기반 네 컷 사진 서비스

백엔드 없이 동작하는 웹 기반 네 컷 사진 서비스입니다.

## 🎯 주요 기능

- 📸 웹캠을 이용한 4장 연속 촬영
- 🖼️ 프레임 선택 및 오버레이
- 🎨 Canvas API를 이용한 이미지 합성
- ☁️ Cloudinary 업로드
- 📱 QR 코드 생성
- 💯 모바일 친화적인 UI

## 🛠️ 기술 스택

- **React** - UI 라이브러리
- **Vite** - 빌드 도구
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **HTML Canvas API** - 이미지 합성
- **Cloudinary** - 이미지 호스팅
- **QRCode.js** - QR 코드 생성

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. Cloudinary 설정

프로젝트 루트에 `.env` 파일을 생성하고 Cloudinary 정보를 입력하세요:

```bash
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

#### 📸 Cloudinary 상세 설정 가이드:

**Step 1: 회원가입**
1. [Cloudinary](https://cloudinary.com) 접속
2. "Sign Up for Free" 클릭
3. 이메일로 가입 (무료 플랜: 25 credits/월)

**Step 2: Cloud Name 확인**
1. 로그인 후 Dashboard로 이동
2. 왼쪽 상단에 **Cloud name** 표시됨 (예: `dxyz12345`)
3. 이 값을 `.env`의 `VITE_CLOUDINARY_CLOUD_NAME`에 입력

**Step 3: Upload Preset 생성**
1. 왼쪽 메뉴에서 **Settings** (톱니바퀴 아이콘) 클릭
2. **Upload** 탭 선택
3. 스크롤해서 **Upload presets** 섹션 찾기
4. **Add upload preset** 클릭
5. 다음과 같이 설정:
   - **Preset name**: `photo_booth_unsigned` (원하는 이름)
   - **Signing Mode**: **Unsigned** ⚠️ (중요!)
   - **Folder**: `photo-booth` (선택사항)
   - **Unique filename**: ✅ 체크
   - **Overwrite**: ❌ 해제
6. **Save** 클릭
7. 생성된 preset 이름을 `.env`의 `VITE_CLOUDINARY_UPLOAD_PRESET`에 입력

**Step 4: 최종 확인**

`.env` 파일:
```bash
VITE_CLOUDINARY_CLOUD_NAME=dxyz12345
VITE_CLOUDINARY_UPLOAD_PRESET=photo_booth_unsigned
```

> ⚠️ **중요**: Unsigned 모드가 아니면 업로드가 실패합니다!  
> 💡 **팁**: `.env` 파일은 Git에 올라가지 않으니 안전합니다

### 3. 프레임 이미지 추가

`public/frames` 폴더에 프레임 이미지를 추가하세요:

```
public/
└── frames/
    ├── frame-1.png
    ├── frame-1-thumb.png
    ├── frame-2.png
    ├── frame-2-thumb.png
    ├── frame-3.png
    └── frame-3-thumb.png
```

프레임 이미지는 **PNG 형식**이어야 하며, **투명 배경**을 사용해야 합니다.

또는 `src/config/constants.ts`에서 Cloudinary URL로 변경할 수 있습니다:

```typescript
export const FRAMES: Frame[] = [
  {
    id: 'frame-1',
    name: '클래식',
    imageUrl: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/frame-1.png',
    thumbnail: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/frame-1-thumb.png',
  },
  // ...
];
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 확인하세요.

### 5. 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 📁 프로젝트 구조

```
대한네컷/
├── public/
│   └── frames/              # 프레임 이미지 폴더
│       ├── frame-1.png
│       └── ...
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── FrameSelect.tsx  # 프레임 선택
│   │   ├── Camera.tsx       # 카메라 촬영
│   │   └── Result.tsx       # 결과 화면
│   ├── config/
│   │   └── constants.ts     # 설정 및 상수
│   ├── types/
│   │   └── index.ts         # TypeScript 타입 정의
│   ├── utils/
│   │   ├── imageComposer.ts # Canvas 이미지 합성
│   │   ├── cloudinary.ts    # Cloudinary 업로드
│   │   └── qrcode.ts        # QR 코드 생성
│   ├── App.tsx              # 메인 앱 컴포넌트
│   ├── main.tsx             # 진입점
│   └── index.css            # 전역 스타일
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎨 주요 컴포넌트

### 1. FrameSelect (프레임 선택)

사용자가 프레임을 선택할 수 있는 UI를 제공합니다.

```typescript
<FrameSelect
  frames={FRAMES}
  selectedFrame={selectedFrame}
  onSelectFrame={handleFrameSelect}
  onNext={handleStartCamera}
/>
```

### 2. Camera (카메라 촬영)

getUserMedia API를 사용하여 카메라에 접근하고, 타이머 기반으로 4장의 사진을 촬영합니다.

```typescript
<Camera
  onComplete={handleCaptureComplete}
  onBack={handleBackToFrameSelect}
/>
```

**주요 기능:**
- 카운트다운 (기본 3초)
- 4회 연속 촬영 (각 2초 간격)
- 촬영된 사진 미리보기
- 재촬영 기능

### 3. Result (결과 화면)

촬영된 사진을 Canvas로 합성하고, Cloudinary에 업로드한 후 QR 코드를 생성합니다.

```typescript
<Result
  photos={capturedPhotos}
  frame={selectedFrame}
  onRestart={handleRestart}
/>
```

## 🖼️ 이미지 합성 로직

`src/utils/imageComposer.ts`에서 Canvas API를 사용하여 이미지를 합성합니다:

1. **Canvas 생성** - 1080x1920 크기의 세로형 Canvas
2. **배경 그리기** - 흰색 배경
3. **4장의 사진 배치** - 각 사진을 4등분 영역에 배치
4. **날짜 텍스트 추가** - 하단에 현재 날짜 표시
5. **프레임 오버레이** - 투명 PNG 프레임을 최상단에 배치

```typescript
const composedImageUrl = await composeFourCutImage(photos, frameImageUrl);
```

## ☁️ Cloudinary 업로드

`src/utils/cloudinary.ts`에서 unsigned upload를 사용하여 이미지를 업로드합니다:

```typescript
const uploadedUrl = await uploadToCloudinary(composedImageUrl);
```

## 📱 QR 코드 생성

`src/utils/qrcode.ts`에서 업로드된 이미지 URL로 QR 코드를 생성합니다:

```typescript
const qrCodeUrl = await generateQRCode(uploadedUrl);
```

## ⚙️ 설정 옵션

`src/config/constants.ts`에서 다양한 옵션을 조정할 수 있습니다:

```typescript
export const PHOTO_CONFIG = {
  outputWidth: 1080,        // 최종 이미지 너비
  outputHeight: 1920,       // 최종 이미지 높이
  photoCount: 4,            // 촬영할 사진 개수
  countdownSeconds: 3,      // 카운트다운 시간
  delayBetweenPhotos: 2000, // 촬영 간격 (밀리초)
};
```

## 📱 모바일 지원

- 반응형 디자인 (Tailwind CSS)
- 터치 친화적인 UI
- viewport 설정으로 확대/축소 방지
- Web Share API 지원

## 🔒 제약 사항

- **백엔드 없음** - 모든 로직이 클라이언트에서 실행
- **로그인/회원가입 없음** - 별도의 인증 불필요
- **데이터베이스 없음** - 상태는 세션 내에서만 유지
- **HTTPS 필요** - getUserMedia는 HTTPS 환경에서만 동작

## 🚀 배포

### Vercel / Netlify

```bash
npm run build
```

빌드된 `dist` 폴더를 Vercel, Netlify 등에 배포하세요.

### GitHub Pages

```bash
# vite.config.ts에 base 경로 추가
export default defineConfig({
  base: '/repo-name/',
  // ...
})

npm run build
```

## 🎯 사용 흐름

1. **프레임 선택** - 원하는 프레임 선택 (또는 프레임 없음)
2. **촬영 시작** - "촬영 시작하기" 버튼 클릭
3. **카운트다운** - 3초 카운트다운 후 자동 촬영
4. **4회 촬영** - 2초 간격으로 4장 자동 촬영
5. **확인/재촬영** - 촬영된 사진 확인 후 완료 또는 재촬영
6. **결과 확인** - 합성된 이미지, QR 코드 확인
7. **다운로드/공유** - 이미지 다운로드 또는 공유

## 💡 팁

### 프레임 제작 팁

- PNG 형식 (투명 배경)
- 1080x1920 해상도 권장
- 사진이 보일 영역을 투명하게 유지
- 프레임 테두리는 불투명하게

### 개발 팁

- 개발 중에는 Cloudinary 설정 없이도 로컬 다운로드 가능
- 프레임 이미지를 먼저 추가하고 테스트
- 모바일 디버깅은 Chrome DevTools의 Device Mode 사용

## 🐛 문제 해결

### 카메라 접근 안 됨
- HTTPS 환경인지 확인
- 브라우저 권한 설정 확인
- localhost에서는 HTTP도 허용됨

### Cloudinary 업로드 실패
- ✅ `.env` 파일이 루트에 있는지 확인
- ✅ Cloud name과 Upload preset 정확한지 확인
- ✅ Upload preset이 **Unsigned**로 설정되어 있는지 확인
- ✅ 브라우저 콘솔에서 에러 메시지 확인
- ✅ `.env` 파일 수정 후 개발 서버 재시작 (`npm run dev`)

### 프레임이 표시되지 않음
- 프레임 이미지 경로 확인
- PNG 투명 배경 확인
- 이미지 로딩 오류 콘솔 확인

## 📄 라이선스

MIT

## 🤝 기여

이슈와 PR을 환영합니다!

---

Made by Taeyoung
