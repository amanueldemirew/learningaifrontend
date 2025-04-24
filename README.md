# Learning AI Frontend

A Next.js frontend for the Learning AI platform, providing interactive AI courses and learning experiences.

## Features

- Modern UI with responsive design
- Dark/light mode support
- Authentication system
- Course creation and management
- Interactive learning content
- Markdown support with syntax highlighting
- SEO optimized

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Learning AI
NEXT_PUBLIC_APP_DESCRIPTION=Learn AI with interactive courses
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=development
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

### Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

### Running in Production

```bash
npm run start
# or
yarn start
# or
pnpm start
```

### Docker Deployment

1. Build the Docker image:

```bash
docker build -t learning-ai-frontend .
```

2. Run the Docker container:

```bash
docker run -p 3000:3000 learning-ai-frontend
```

### Environment Variables for Production

For production, update the `.env.local` file with production values:

```
NEXT_PUBLIC_API_URL=https://api.learning-ai.example.com/api/v1
NEXT_PUBLIC_APP_URL=https://learning-ai.example.com
NEXT_PUBLIC_APP_NAME=Learning AI
NEXT_PUBLIC_APP_DESCRIPTION=Learn AI with interactive courses
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=production
```

## Project Structure

- `src/app`: Next.js app router pages
- `src/components`: Reusable UI components
- `src/hooks`: Custom React hooks
- `src/lib`: Utility functions and context providers
- `src/services`: API services
- `src/types`: TypeScript type definitions
- `src/utils`: Helper functions

## Performance Optimization

- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Server-side rendering where appropriate
- Static site generation for public pages
- API route caching

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
