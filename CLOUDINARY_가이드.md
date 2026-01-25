# 🌥️ Cloudinary 완벽 설정 가이드

이미지를 업로드하고 QR 코드를 생성하려면 Cloudinary 설정이 필요합니다.

## 📋 전체 과정 (5분 소요)

1. ✅ Cloudinary 회원가입
2. ✅ Cloud Name 확인
3. ✅ Upload Preset 생성 (**Unsigned 모드**)
4. ✅ `.env` 파일에 정보 입력
5. ✅ 개발 서버 재시작

---

## 1️⃣ Cloudinary 회원가입

### 단계:
1. https://cloudinary.com 접속
2. **"Sign Up for Free"** 클릭
3. 이메일로 가입

### 무료 플랜:
- ✅ 25 credits/월 (약 25GB 저장공간 + 대역폭)
- ✅ 이미지 최적화, 변환, CDN 포함
- ✅ 신용카드 불필요

---

## 2️⃣ Cloud Name 확인

### 단계:
1. 로그인 후 **Dashboard** 이동
2. 왼쪽 상단에 **Cloud name** 표시됨
   ```
   Cloud name: dxyz12345
   ```
3. 이 값을 복사하세요

### 예시:
- Cloud name: `dxyz12345`
- Cloud name: `my-photo-app`
- Cloud name: `test-account-123`

---

## 3️⃣ Upload Preset 생성 (중요!)

### 단계:

**A. Settings 접근**
1. 왼쪽 메뉴에서 **Settings** (톱니바퀴 ⚙️) 클릭
2. 상단 탭에서 **Upload** 선택
3. 아래로 스크롤해서 **Upload presets** 섹션 찾기

**B. Preset 생성**
1. **"Add upload preset"** 버튼 클릭
2. 다음과 같이 설정:

| 항목 | 설정 값 | 설명 |
|------|---------|------|
| **Preset name** | `photo_booth_unsigned` | 원하는 이름 (영문, 숫자, 언더스코어만) |
| **Signing Mode** | ⚠️ **Unsigned** | 🔴 매우 중요! 반드시 Unsigned 선택 |
| **Folder** | `photo-booth` | (선택사항) 업로드될 폴더 |
| **Unique filename** | ✅ 체크 | 파일명 중복 방지 |
| **Overwrite** | ❌ 해제 | 덮어쓰기 방지 |
| **Access mode** | `public` | 공개 접근 |

3. 하단의 **Save** 버튼 클릭

### ⚠️ 중요: Unsigned vs Signed

- ✅ **Unsigned**: 클라이언트에서 직접 업로드 가능 (우리가 필요한 방식)
- ❌ **Signed**: 서버 서명 필요 (백엔드 없어서 사용 불가)

---

## 4️⃣ .env 파일 설정

### 단계:

**A. `.env` 파일 열기**
프로젝트 루트에 있는 `.env` 파일을 엽니다.

**B. 정보 입력**
```bash
VITE_CLOUDINARY_CLOUD_NAME=dxyz12345
VITE_CLOUDINARY_UPLOAD_PRESET=photo_booth_unsigned
```

### 실제 예시:

**예시 1: Cloud name이 `myapp123`이고 preset이 `unsigned_preset`**
```bash
VITE_CLOUDINARY_CLOUD_NAME=myapp123
VITE_CLOUDINARY_UPLOAD_PRESET=unsigned_preset
```

**예시 2: Cloud name이 `demo-account`이고 preset이 `web_upload`**
```bash
VITE_CLOUDINARY_CLOUD_NAME=demo-account
VITE_CLOUDINARY_UPLOAD_PRESET=web_upload
```

---

## 5️⃣ 개발 서버 재시작

환경 변수 변경 후 **반드시** 서버를 재시작해야 합니다!

```bash
# Ctrl + C로 서버 중단
# 그 다음 다시 시작
npm run dev
```

---

## 🧪 테스트 방법

### 1. 개발 서버 실행
```bash
npm run dev
```

### 2. 브라우저 접속
http://localhost:3000

### 3. 촬영 및 업로드 테스트
1. 프레임 선택
2. 4장 촬영
3. 완료 버튼 클릭
4. "이미지를 업로드하고 있습니다..." 표시
5. QR 코드 생성 확인

### 4. 업로드 확인
Cloudinary Dashboard → **Media Library**에서 업로드된 이미지 확인

---

## 🐛 문제 해결

### ❌ "Cloudinary 설정이 필요합니다"
**원인**: `.env` 파일이 비어있거나 잘못됨

**해결**:
```bash
# .env 파일 확인
cat .env

# 올바른 형식인지 확인
VITE_CLOUDINARY_CLOUD_NAME=실제값
VITE_CLOUDINARY_UPLOAD_PRESET=실제값
```

### ❌ "Upload preset not found"
**원인**: Preset 이름이 틀렸거나 생성되지 않음

**해결**:
1. Cloudinary Dashboard → Settings → Upload
2. Upload presets에서 이름 다시 확인
3. `.env`에 정확히 입력

### ❌ "Invalid signature"
**원인**: Preset이 **Signed** 모드로 설정됨

**해결**:
1. Cloudinary Dashboard → Settings → Upload
2. 해당 Preset 클릭
3. Signing Mode를 **Unsigned**로 변경
4. Save

### ❌ 환경 변수가 안 읽힘
**원인**: 서버 재시작 안 함

**해결**:
```bash
# Ctrl + C로 중단
npm run dev  # 다시 시작
```

### ❌ "Failed to fetch"
**원인**: 네트워크 문제 또는 Cloudinary 서비스 오류

**해결**:
1. 인터넷 연결 확인
2. 브라우저 콘솔에서 정확한 에러 확인
3. VPN 사용 중이면 해제 시도

---

## 🎯 최종 체크리스트

완료했는지 확인하세요:

- [ ] Cloudinary 회원가입 완료
- [ ] Cloud name 확인 (Dashboard 왼쪽 상단)
- [ ] Upload Preset 생성 (Signing Mode: **Unsigned**)
- [ ] `.env` 파일에 정보 입력
- [ ] `.env` 파일에 실제 값 입력 (빈칸 아님)
- [ ] 개발 서버 재시작 (`npm run dev`)
- [ ] 브라우저에서 촬영 → 업로드 테스트
- [ ] Cloudinary Media Library에서 업로드 확인

---

## 💡 추가 팁

### 보안
- ✅ `.env` 파일은 Git에 올라가지 않음 (`.gitignore`에 등록됨)
- ✅ Unsigned 모드도 Cloudinary에서 업로드 제한 설정 가능
- ✅ Settings → Security에서 IP 제한, 파일 크기 제한 가능

### 용량 관리
- 무료 플랜: 25 credits/월
- 사진 1장 (약 2MB): ~0.002 credits
- 약 10,000장까지 무료로 업로드 가능
- Dashboard에서 사용량 확인 가능

### 폴더 구조
Preset에서 Folder를 `photo-booth`로 설정했다면:
- 업로드된 이미지는 `photo-booth/` 폴더에 저장됨
- Media Library에서 폴더별로 확인 가능

---

## 📞 추가 도움

Cloudinary 공식 문서:
- https://cloudinary.com/documentation
- https://cloudinary.com/documentation/upload_presets

문제가 계속되면:
1. 브라우저 콘솔 (F12) 확인
2. Network 탭에서 업로드 요청 확인
3. Response 에러 메시지 확인

---

**완료하면 바로 촬영하고 QR 코드를 받을 수 있습니다! 🎉**
