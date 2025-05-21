# Easyplit 🧾

**Easyplit** is a web application for managing shared expenses between people. It allows users to create groups, record debts, split amounts equally or by percentage, make payments, and view balance summaries between individuals or within groups.

The project focuses on both user experience and backend reliability, using modern technologies and a clean full-stack architecture.

---

## 🛠️ Tech Stack

- **Next.js 15** (Client & Server components)
- **TypeScript**
- **Prisma** (ORM)
- **PostgreSQL** (Database)
- **Tailwind CSS** (Styling)
- **NextAuth.js** (Email and Google authentication)
- **Nodemailer** (Email delivery)

---

## 🚀 Getting Started

### 1. 🔥 Clone the repository

```bash
git clone https://github.com/your-username/easyplit.git
cd easyplit
```

---

### 2. 📦 Install dependencies

```bash
npm install
# or
yarn install
```

---

### 3. 🔐 Environment Variables

Rename the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

---

Then fill in the required values below:

### 4. 🌐 Application URLs

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

> These values are used for client-side navigation and server API calls.

---

### 5. 🗄️ Database

Add your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/postgres
```

Then apply the database schema using Prisma:

```bash
npx prisma migrate dev
```

Or, if the schema is already created:

```bash
npx prisma db push
```

---

### 6. 📧 Nodemailer (for email sending)

Configure your SMTP email credentials:

```env
NODEMAILER_USER=your_email@gmail.com
NODEMAILER_PASSWORD=your_app_password
```

> For Gmail, it's recommended to create an "App Password".

---

### 7. 🔐 NextAuth.js

```env
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=http://localhost:3000
```

Generate a secure secret with:

```bash
openssl rand -base64 32
```

---

### 8. 🔐 Google Authentication (optional)

If you want to enable Google login via NextAuth:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> You can get these from [Google Developer Console](https://console.developers.google.com/)

---

### 9. ▶️ Running the app

Once everything is configured, run the development server:

```bash
npm run dev
# or
yarn dev
```

The app will be available at: `http://localhost:3000`

---

## ✅ Setup Checklist

- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] `.env.local` configured
- [ ] Database migrated
- [ ] NextAuth and Nodemailer configured

---

## 📌 Notes

- This app is under active development. New features will be added in upcoming commits.
- Production environment will use Supabase for database hosting, and Vercel for deployment.
