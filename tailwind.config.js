/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D6AAF',      // 파란색으로 변경
        secondary: '#3B82F6',    // 대한학생회 파랑
        koreaGreen: '#059669',
        koreaBlue: '#2563EB',
        // 파스텔 컬러
        pastelPink: '#FFE8F0',
        pastelBlue: '#E8F4FF',
        pastelMint: '#E8FFF5',
        pastelLavender: '#F3E8FF',
        pastelPeach: '#FFE8E8',
        pastelYellow: '#FFF8E8',
      }
    },
  },
  plugins: [],
}
