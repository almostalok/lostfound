# Lost&Found — AI-Powered Lost & Found Platform

> **Lost something? Let AI find it.**

Lost&Found is a full-stack web application that connects people who have lost items with those who have found them. It uses Google Gemini AI for intelligent item matching (including image analysis), AI-generated verification questions to confirm true ownership, and a secure messaging system — all built privacy-first.

---

## ✨ Features

| Feature | Description |
|---|---|
| **AI Matching** | Automatically compares lost and found reports by category, description, location, date, and uploaded photos using Google Gemini 2.5 Flash. |
| **Image Analysis** | Uploaded item photos are sent directly to the Gemini multimodal API for visual matching. |
| **Verified Claims** | When a potential match is found, Gemini generates two custom verification questions that only the true owner can answer. |
| **Secure Messaging** | Once ownership is verified, a private conversation channel opens between the reporter and the finder. |
| **Dashboard** | Users can track all their lost/found reports and view match scores in one place. |
| **Browse** | Public listing of unclaimed found items, filterable by category. |
| **Authentication** | Secure email-based auth powered by Supabase. |
| **Privacy First** | Finder identity and sensitive item details remain hidden until ownership is verified. |

---

## 🛠 Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router, Server Actions)
- **Language** — TypeScript
- **Styling** — [Tailwind CSS v4](https://tailwindcss.com)
- **Database** — [Prisma ORM](https://www.prisma.io) with SQLite (dev) / PostgreSQL (prod)
- **Auth** — [Supabase](https://supabase.com) (SSR)
- **AI** — [Google Gemini 2.5 Flash](https://ai.google.dev) via `@google/generative-ai`
- **Animations** — [Framer Motion](https://www.framer.com/motion/) + [Lenis](https://lenis.studiofreight.com) smooth scroll
- **Icons** — [Lucide React](https://lucide.dev)

---

## 🏗 Project Structure

```
src/
├── app/
│   ├── actions.ts          # All Server Actions (submit, match, verify, chat)
│   ├── auth/               # Login, register, OAuth callback pages
│   ├── browse/             # Public browse page
│   ├── chat/               # Real-time messaging UI
│   ├── dashboard/          # User dashboard
│   ├── messages/           # Conversations list
│   ├── report-found/       # Found item report form
│   ├── report-lost/        # Lost item report form
│   ├── verify/             # Ownership verification flow
│   ├── layout.tsx          # Root layout with nav
│   └── page.tsx            # Landing page
├── components/
│   ├── AuthNav.tsx          # Auth-aware navigation
│   └── SmoothScrolling.tsx  # Lenis scroll wrapper
└── lib/
    ├── prisma.ts            # Prisma client singleton
    └── supabase.ts          # Supabase client helpers

prisma/
└── schema.prisma           # Database schema (User, LostItem, FoundItem, Match, Conversation, Message)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (for authentication)
- A [Google AI Studio](https://aistudio.google.com) API key (for Gemini matching)

### 1. Clone the repository

```bash
git clone https://github.com/almostalok/lostfound.git
cd lostfound
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔄 How It Works

```
User reports a lost item
        │
        ▼
Server Action saves item → triggers AI matching
        │
        ▼
Gemini compares description + photos against found items
        │
        ▼
Matches with score > 0.40 are stored (score ≥ 0.75 → item marked "matched")
        │
        ▼
Claimant initiates verification → Gemini generates 2 owner-specific questions
        │
        ▼
Claimant answers → Gemini judges answers against the real found-item details
        │
      ┌─┴──────────────────┐
   Verified               Rejected
      │
      ▼
Private conversation opens between reporter & finder
```

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## 🗄 Database Schema

The Prisma schema defines six models:

- **User** — registered users with optional phone and Aadhar verification fields
- **LostItem** — lost item reports (name, category, description, location, date, photos, status)
- **FoundItem** — found item reports (category, description, location, date, photos, status)
- **Match** — AI-generated match between a lost and found item, including a `match_score`
- **Conversation** — private chat channel created after a verified match
- **Message** — individual messages within a conversation

---

## 🌐 Deployment

### Vercel (recommended)

1. Push the repository to GitHub.
2. Import the project on [Vercel](https://vercel.com/new).
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`) in the Vercel dashboard.
4. Switch the Prisma datasource to PostgreSQL and update `DATABASE_URL` for production.
5. Deploy.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
