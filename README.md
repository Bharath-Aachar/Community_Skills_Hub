# Community Skills Hub

> A centralized platform for discovering, sharing, registering for, and tracking community events, workshops, hackathons, bootcamps, and skill-building opportunities.

---

## 🚀 Task 1 — Welcome Page Implementation

The Welcome Page (`/`) serves as the gateway to the Community Skills Hub platform, introducing its core mission and allowing visitors to choose between the **Participant** and **Organizer** experiences.

### Key Highlights
- **Navigation Bar**: Responsive white header with brand logo, quick navigation links (Home, About), and authentication entry points (`Log In`, `Sign Up`).
- **Hero Section**: Visually engaging dark purple gradient overlay over an atmospheric event crowd background with centered typography and entrance animations.
  - Headline: *"Every Opportunity. One Place."*
  - Supporting text: *"Discover workshops, explore events, connect with communities, and manage your learning journey — all in one place."*
  - Badge: *"DISCOVER • LEARN • CONNECT"*
- **Role Selection Cards**: Side-by-side interactive selection cards for:
  - **Participant (`/explore`)**: For learners to browse workshops, register, and track their skill milestones.
  - **Organizer (`/admin/login`)**: For community leaders to publish events, manage registrations, and track attendance.
- **About Platform**: Three feature highlight pillars:
  1. *Discover Opportunities*
  2. *Stay Organized*
  3. *Grow Together*
- **Footer**: Branding, mission statement, navigation links, and dynamic copyright.
- **Placeholder Pages**: Safe placeholder destinations for `/explore`, `/admin/login`, `/login`, `/signup`, and `/about` with zero 404 errors.

---

## 🎨 Design System & Palette

- **Primary Purple**: `#7543DF`
- **Deep Purple**: `#302063`
- **Light Purple**: `#F4F0FF`
- **Dark Text**: `#242136`
- **Muted Text**: `#64607D`
- **Pure White**: `#FFFFFF`

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 & PostCSS
- **Icons**: [Lucide React](https://lucide.dev/)
- **Package Manager**: pnpm

---

## 📁 Project Structure

```
community-skills-hub/
├── public/                 # Static assets & icons
├── src/
│   ├── app/
│   │   ├── about/          # /about dedicated route
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   └── login/      # /admin/login Organizer placeholder
│   │   │       └── page.tsx
│   │   ├── explore/        # /explore Participant placeholder
│   │   │   └── page.tsx
│   │   ├── login/          # /login Auth placeholder
│   │   │   └── page.tsx
│   │   ├── signup/         # /signup Auth placeholder
│   │   │   └── page.tsx
│   │   ├── globals.css     # Global styles, Tailwind & theme variables
│   │   ├── layout.tsx      # Root HTML layout with metadata
│   │   └── page.tsx        # Welcome Page (Home /)
│   └── components/
│       ├── AboutSection.tsx        # Platform feature highlights
│       ├── Footer.tsx              # Platform footer & copyright
│       ├── HeroSection.tsx         # Large hero with background overlay
│       ├── Logo.tsx                # Reusable brand logo mark
│       ├── Navbar.tsx              # Responsive navigation & mobile drawer
│       ├── PlaceholderPage.tsx     # Reusable shell for placeholder routes
│       └── RoleSelectionCards.tsx  # Participant & Organizer selection cards
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

---

## 🏃 Getting Started Locally

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start the Development Server
```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Linting
```bash
# Run ESLint checks
pnpm run lint

# Compile production build
pnpm run build

# Start production server
pnpm run start
```
