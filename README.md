# llm-chatbot

**clone the respository**
git clone https://github.com/piyushjha0409/llm-chatbot.git
cd llm-chatbot

# Install server dependencies
cd chatApp_backend
`npm install`

**copy an .env.example file and make it .env and fill credentials and api key**
DATABASE_URL= <url>

GEMINI_KEY=<api_key>

JWT_SECRET=<"string">

**for prisma you can run :**

**for pushing schema to database**
`npx prisma db push`

 **for generating client **
`npx prisma generate`

**For running the server **
`npm run dev`

# Install client dependencies
cd chatApp_frontend
`npm install`

**For running client **
`npm run dev`



![image](https://github.com/user-attachments/assets/cc7557ae-5765-4164-9780-ddbf02f0163a)
