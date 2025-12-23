/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",       // 关键：扫描根目录下的代码文件
    "./services/**/*.{js,ts,jsx,tsx}", // 扫描 services 文件夹
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}