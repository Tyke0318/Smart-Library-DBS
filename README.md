# Run and deploy Locally

You need:

**Step 1:** Install the **Node.js**, you can refer to its official website;

**Step 2:** Run the commands in your terminal:

```S
# Install dependencies
npm install
# Install Tailwind local dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D tailwindcss@3.4.17
```

**Step 3:** 在本地MySQL中建表，作为底层数据库。新建一个script然后运行代码即可。

Refer to the file **sql.txt**, copy the content (SQL code), paste to your local **MySQL Workbench** (or anything you can create your local database).

**Step 4:** Run the commands in your terminal:

```
# 安装数据库依赖
npm install express mysql2 cors dotenv body-parser
```

**Step 5:** 修改.env文件里的MySQL数据库密码为自己的
**Step 6:** To run locally

Open two terminals:

Terminal 1: `npm run server` (启动后端，监听 3001 端口)

Terminal 2: `npm run dev` (启动前端，监听 3000 端口)

P.S.: If you want to use the AI Library Assistant service, set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key; View prototype in: https://ai.studio/apps/drive/1HDrUabWPj2_ycSqT2CX79hOPDa86m1BU



*Dec. 23rd, 2025*
*SCU, DMCA Course Project*
*By Tyke Tan & Ji Zhou*
