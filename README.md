# Mondrian.fun - Next.js Port

A modern, secure implementation of the Mondrian.fun web app using Next.js. This project allows users to create and share Mondrian-style artwork.

## Key Improvements

- **Server-side S3 Operations**: All AWS S3 operations are now handled securely on the server through API routes.
- **Modern React Patterns**: Uses functional components with hooks instead of class components.
- **Updated Dependencies**: All dependencies have been updated to the latest versions.
- **TypeScript**: Fully typed application for better developer experience and code safety.
- **Responsive Design**: Maintains the responsive design of the original app.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file and add your AWS credentials:
```
S3_BUCKET=your-bucket-name
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Architecture

- **API Routes**: Server-side API routes in `app/api/s3/route.ts` handle all AWS operations.
- **Components**: React components in the `components` directory.
- **Services**: API service wrappers in the `services` directory.
- **Types**: TypeScript type definitions in the `types` directory.

## Deployment

The app can be deployed on Vercel or any other Next.js-compatible hosting platform.

## License

This project is a port of the original mondrian.fun web app.
