# TechNews Application

A modern tech news platform built with Next.js and MongoDB.

## Overview

TechNews is a comprehensive technology news platform that provides the latest updates, reviews, and insights about the tech industry. The application supports different user roles, content management, and personalized user experiences.

## Features

- User authentication and authorization
- Tech news articles and reviews
- Category-based content organization
- Admin dashboard for content management
- Mock database for development
- Responsive design for all devices

## Project Structure

The project follows the Next.js App Router structure:
- `/app`: Main application code
- `/app/(auth)`: Authentication related pages
- `/app/(admin)`: Admin dashboard
- `/app/api`: API routes
- `/app/components`: Reusable UI components
- `/app/lib`: Utility libraries
- `/app/models`: Database models
- `/docs`: Project documentation

## Enhancement Plan

We have a comprehensive [Enhancement Plan](./docs/enhancement-plan.md) that outlines upcoming features and improvements to the application. The plan is organized into five phases:

1. Authentication and User Experience
2. Content Management Enhancements
3. Admin Dashboard Improvements
4. Performance Optimization
5. New Features

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

If you'd like to contribute to the project, please check our [Contributing Guide](./docs/CONTRIBUTING.md) for more information about our development process and how to submit pull requests.

## GitHub Project Management

We use GitHub for project management:

1. **Issues**: All tasks and bugs are tracked through GitHub Issues
2. **Milestones**: Aligned with our enhancement plan phases
3. **Pull Requests**: Follow our PR template for consistent submissions
4. **Project Board**: Visual kanban board for tracking progress

To create GitHub issues from our enhancement plan, you can use the provided script:

```bash
# Install GitHub CLI first if you haven't
./create-github-issues.ps1
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
