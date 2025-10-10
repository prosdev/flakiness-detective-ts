# @flakiness-detective/website

Official documentation and marketing website for Flakiness Detective.

## 🌐 Live Site

- **Production**: TBD (will be deployed to Vercel)
- **Repository**: [flakiness-detective-ts](https://github.com/prosdev/flakiness-detective-ts)

## 🚀 Getting Started

### Prerequisites

- Node.js >= 22
- pnpm >= 8

### Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start development server
cd packages/website
pnpm dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm start
```

### Lint & Format

```bash
# Lint with Biome
pnpm lint

# Format with Biome
pnpm format

# Run both check and format
pnpm check
```

## 📁 Project Structure

```
packages/website/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── docs/              # Documentation pages
│   ├── packages/          # Package overview pages
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── nav.tsx           # Navigation bar
│   ├── footer.tsx        # Footer
│   └── code-block.tsx    # Code syntax highlighting
├── content/              # MDX documentation content
│   └── docs/             # Documentation articles
├── public/               # Static assets
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── biome.json           # Biome linter/formatter config
└── package.json          # Package dependencies
```

## 🎨 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Linting**: [Biome](https://biomejs.dev/)
- **Content**: MDX for documentation
- **Deployment**: Vercel (planned)

## 📝 Adding Documentation

Documentation lives in the `content/docs/` directory as MDX files:

```bash
# Create a new doc
touch content/docs/my-new-doc.mdx
```

Example MDX file:

```mdx
---
title: "My New Doc"
description: "A short description"
---

# My New Doc

Content goes here...
```

## 🎯 Key Pages

- **Homepage** (`/`) - Hero, features, quick start, CTA
- **Docs** (`/docs`) - Documentation hub
- **Packages** (`/packages`) - Package overview with npm links
- **GitHub** - Links to source code and issues

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect Repository**:

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import `flakiness-detective-ts` repository
   - Set Root Directory: `packages/website`

2. **Configure Build**:

   - Framework: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

3. **Environment Variables**:

   - None required (static site)

4. **Deploy**:
   - Push to `main` branch auto-deploys
   - Preview deployments for PRs

### Manual Deployment

```bash
# Build static site
pnpm build

# Deploy the `out/` directory to your hosting provider
```

## 🎨 Customization

### Colors

Edit `tailwind.config.ts` to customize the color scheme:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#3B82F6',  // Customize primary color
    },
  },
}
```

### Components

All components are in `components/` directory:

- **Nav**: Navigation bar with links
- **Footer**: Footer with links and social icons
- **CodeBlock**: Syntax-highlighted code with copy button

### Styling

Global styles are in `app/globals.css`:

- Tailwind directives
- Custom CSS variables
- Dark mode support

## 🔧 Configuration

### Next.js

`next.config.ts` configures:

- Static export (`output: 'export'`)
- Image optimization disabled for static hosting
- MDX support

### Tailwind CSS

`tailwind.config.ts` configures:

- Content paths for purging
- Theme extensions
- Dark mode (automatic)

### Biome

`biome.json` configures:

- Linting rules
- Formatting preferences
- Import organization

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Biome Documentation](https://biomejs.dev/guides/getting-started/)
- [MDX Documentation](https://mdxjs.com/)

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) in the root of the monorepo.

## 📄 License

MIT License - see [LICENSE](../../LICENSE)
