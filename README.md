# Power Vac

Built with **Next.js 16**, **Directus CMS** (hosted on Railway), and **Tailwind CSS v4**.

## Getting Started

```bash
pnpm dev
```

The site runs at [http://localhost:3000](http://localhost:3000). Collections not yet migrated to Directus use local mock data automatically.

## Scripts

```bash
pnpm dev      # Start dev server
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Environment Variables

See `.env.example` for all available variables. Key ones:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_DIRECTUS_URL` | Directus API URL |
| `DIRECTUS_STATIC_TOKEN` | Read access token (server-only) |
| `DIRECTUS_FORM_BOT_TOKEN` | Form submission token (server-only) |
| `REVALIDATE_SECRET` | Webhook auth secret (server-only) |
| `ENABLE_PROTOTYPES` | Set `true` to enable prototype routes |

## Connecting Directus

Directus is hosted on [Railway](https://railway.app). Create a new Directus service on Railway, then:

1. Update `.env.local` with your Railway Directus URL and tokens
2. Create collections in Directus matching the types in `src/lib/directus.ts`
3. Set up public read access for your collections (Settings > Access Control > Public)
4. Set up a Directus webhook:
   - **URL**: `https://yoursite.com/api/revalidate?secret=YOUR_REVALIDATE_SECRET`
   - **Method**: POST
   - **Triggers**: items.create, items.update, items.delete
5. Configure visual editor preview URLs in Directus collection settings:
   - **Preview URL**: `https://yoursite.com/preview/home?token=__TOKEN__`

## Claude Code Setup

To give Claude full context when working on this project, set up the Directus MCP server so Claude can query your Directus schema and collections directly.

### Directus MCP Server

Add the Directus MCP server to your Claude Code configuration (`.claude/settings.json` or global settings):

```json
{
  "mcpServers": {
    "directus": {
      "command": "npx",
      "args": ["-y", "@anthropic/directus-mcp-server"],
      "env": {
        "DIRECTUS_URL": "https://your-directus-instance.up.railway.app",
        "DIRECTUS_TOKEN": "your-static-token"
      }
    }
  }
}
```

This allows Claude to:
- Browse your Directus collections and fields
- Understand the schema when adding new pages or types
- Keep `src/lib/directus.ts` type definitions in sync with your actual Directus schema

The `CLAUDE.md` file in the project root provides Claude with all the architectural patterns and conventions for this project.

## Prototypes

Build visual mockups for clients using your real components and theme, deployed via Netlify branch previews.

### Step-by-Step Example: "Acme Homepage" Prototype

**1. Create a branch from main:**

```bash
git checkout main
git pull origin main
git checkout -b prototype/acme-homepage
```

**2. Add client assets** (images, logos, etc.):

```
public/prototypes/acme-homepage/
  hero.jpg
  logo.png
```

**3. Create your prototype component(s):**

Create a `_components` folder alongside the `page.tsx`:

```
src/app/(prototypes)/prototypes/[project]/_components/
  acme-homepage.tsx
```

Example component (`acme-homepage.tsx`):

```tsx
import Image from "next/image";

export function AcmeHomepage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <section className="mb-16 text-center">
        <Image
          src="/prototypes/acme-homepage/logo.png"
          alt="Acme Corp"
          width={200}
          height={60}
        />
        <h1 className="mt-8 text-5xl font-bold">Welcome to Acme Corp</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Hardcoded prototype content — no CMS needed.
        </p>
      </section>
    </main>
  );
}
```

Use your real shared components, Tailwind theme, and Framer Motion animations — the prototype should look and feel like the real site.

**4. Register the prototype** in `src/app/(prototypes)/prototypes/[project]/page.tsx`:

```typescript
import { AcmeHomepage } from "./_components/acme-homepage";

const PROTOTYPES: Record<string, () => React.ReactNode> = {
  "acme-homepage": () => <AcmeHomepage />,
};
```

The key (`"acme-homepage"`) becomes the URL path: `/prototypes/acme-homepage`

**5. Test locally** — make sure `ENABLE_PROTOTYPES=true` is in your `.env.local`:

```bash
pnpm dev
# Visit http://localhost:3000/prototypes/acme-homepage
```

You should see the amber "Prototype Preview" banner at the top.

**6. Push for client review:**

```bash
git add -A
git commit -m "Add acme-homepage prototype"
git push -u origin prototype/acme-homepage
```

**7. Share the Netlify branch deploy URL with your client:**

```
https://prototype-acme-homepage--yoursite.netlify.app/prototypes/acme-homepage
```

Netlify builds the branch automatically. Every time you push more commits to the branch, it rebuilds.

### How It Works

- Prototypes live at `/prototypes/[project-name]`
- Production (main branch): `ENABLE_PROTOTYPES=false` — prototypes return 404
- Branch deploys: `ENABLE_PROTOTYPES=true` — prototypes are accessible
- This is configured in `netlify.toml` deploy contexts

### Netlify Setup

In your Netlify dashboard: **Site configuration > Build & deploy > Branches and deploy contexts** — enable branch deploys for `prototype/*` branches (or all branches).

### Automating Prototypes with Claude

Instead of building prototypes manually, you can ask Claude Code to create them for you. Claude will scrape the client's existing site, apply your design direction, and generate a production-quality prototype.

#### Setting Up Inspiration

Before asking Claude, set up an inspiration folder for the page you want:

```
inspiration/
  home/
    config.json           # Design direction and client site URL
    screenshots/          # Visual inspiration (optional)
      hero-reference.png
      layout-idea.png
  about/
    config.json
    screenshots/
```

Copy the example config to get started:

```bash
cp -r inspiration/.example inspiration/home
```

Edit `inspiration/home/config.json`:

```json
{
  "source_url": "https://existing-client-site.com",
  "colors": {
    "primary": "#1a365d",
    "secondary": "#e53e3e",
    "accent": "#38b2ac"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Open Sans"
  },
  "direction": "Modern, clean design with emphasis on trust and professionalism",
  "critical_points": [
    "Must include a clear CTA in the hero",
    "Testimonials section is essential",
    "Contact number prominent in header"
  ],
  "sections": [
    "hero",
    "services",
    "testimonials",
    "cta",
    "footer"
  ]
}
```

All fields are optional. Use what's relevant:

| Field | Purpose |
|-------|---------|
| `source_url` | Client's existing site — Claude uses Playwright to scrape content and structure |
| `colors` | Brand colours to apply |
| `fonts` | Font preferences |
| `direction` | Free-text description of the design direction |
| `critical_points` | Must-have requirements (non-negotiable) |
| `sections` | Ordered list of sections to include |
| `notes` | Any additional context |

Add screenshots to the `screenshots/` folder for visual reference — competitor sites, Dribbble shots, design mockups, anything that shows the look and feel you're after.

#### Prerequisites: Playwright MCP

For Claude to scrape existing client sites, the Playwright MCP server must be configured. Add to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    }
  }
}
```

This is only needed if you're providing a `source_url`. Without it, Claude will work from screenshots and config alone.

#### Asking Claude

Once your inspiration folder is ready, ask Claude:

```
Create a home page prototype for Acme Corp
```

Claude will:
1. Check for `inspiration/home/config.json` and `inspiration/home/screenshots/`
2. Use Playwright to scrape the existing site (if `source_url` provided)
3. Apply your design direction, colours, and critical points
4. Build the prototype component with real Tailwind styling and animations
5. Register it in the prototypes page
6. The prototype is ready to test at `http://localhost:3000/prototypes/acme-homepage`

Review the prototype, make any changes, and once you're happy with it, ask Claude:

```
Generate the comparison report for the home page prototype
```

#### Comparison Report

When requested, Claude generates a comparison report at `inspiration/[page]/report.md`. The report covers:

- **Performance** — load time comparison, estimated Core Web Vitals improvements, page weight reduction
- **Accessibility** — semantic HTML, contrast, keyboard navigation, heading hierarchy, ARIA labels
- **Visual & UX improvements** — layout, mobile responsiveness, CTA placement, navigation clarity
- **How it better serves users** — connects improvements to the client's business goals
- **Key differences** — side-by-side comparison table

The report is written in a professional, client-ready format. Share it alongside the Netlify preview URL when presenting the prototype.

If no `source_url` is provided, Claude writes a shorter report focusing on design decisions, accessibility approach, and technical benefits.

#### Fallback Behaviour

Claude adapts based on what you provide:

- **Config + screenshots + source URL** — full context: scrapes site, applies design direction, references screenshots, generates full comparison report
- **Config + screenshots** — applies design direction and references screenshots, generates design-focused report
- **Screenshots only** — uses images as visual reference
- **Nothing** — creates a prototype using the project's existing theme and Claude's front-end expertise

### Cleanup

```bash
git checkout main
git branch -d prototype/client-name
git push origin --delete prototype/client-name
```

## Deployment (Netlify)

1. Push repo to GitHub
2. In Netlify: **Add new site > Import an existing project**
3. Connect your repo — build settings are auto-detected from `netlify.toml`
4. Add environment variables in **Site configuration > Environment variables**
5. Deploy

ISR is handled automatically by `@netlify/plugin-nextjs`. Directus webhooks trigger `/api/revalidate` for instant cache invalidation, with a 1-hour fallback.

## Project Structure

```
├── inspiration/                          # Design inspiration for prototypes
│   ├── .example/                         # Example config — copy for each page
│   │   ├── config.json
│   │   └── screenshots/
│   ├── home/                             # Per-page inspiration (you create these)
│   │   ├── config.json
│   │   └── screenshots/
│   └── about/
│       └── ...
├── public/prototypes/                    # Prototype-specific assets (images, logos)
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (GlobalProvider + VisualEditorWrapper)
│   │   ├── page.tsx                      # Home page
│   │   ├── api/
│   │   │   ├── revalidate/              # Directus webhook endpoint
│   │   │   └── revalidate-visual-editor/ # Visual editor save handler
│   │   ├── preview/                      # Visual editor preview routes
│   │   └── (prototypes)/prototypes/      # Client prototype pages (dev-only)
│   ├── components/
│   ├── config/
│   │   └── site.ts                       # Site name, URL, description
│   ├── context/
│   │   └── GlobalContext.tsx              # Global CMS data context
│   └── lib/
│       ├── directus.ts                   # SDK setup, types, data fetchers
│       ├── mock-data.ts                  # Dev data (no Directus needed)
│       ├── visual-editor.ts              # Directus visual editor integration
│       └── utils.ts                      # cn() utility
├── .claude/
│   └── settings.json                     # Claude Code permissions
└── CLAUDE.md                             # AI assistant context and conventions
```

## Adding Pages

See `CLAUDE.md` for detailed step-by-step instructions on adding singleton pages and dynamic collections.
