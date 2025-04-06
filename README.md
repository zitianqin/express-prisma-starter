# Express + Prisma Starter Template

Starter Template for ExpressJS, TypeScript and Prisma, with Jest set up for testing and Swagger for API documentation.

## 📋 Overview

This project provides a robust foundation for building RESTful APIs using:

- Express.js (v5) for the web server
- TypeScript for type safety and better developer experience
- Prisma ORM for database access and management
- PostgreSQL as the database
- Jest for testing
- Swagger UI for API documentation

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd expressjs-ts-prisma-starter
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Configure your environment variables

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file and set your database connection string and other settings.

4. Generate Prisma client

   ```bash
   npx prisma generate
   ```

5. Run database migrations

   ```bash
   npx prisma migrate dev
   ```

6. Start the development server

   ```bash
   npm run dev
   ```

7. Open http://localhost:3000/docs to view the API documentation

## 🏗️ Project Structure

```
expressjs-ts-prisma-starter/
├── prisma/                  # Prisma schema and migrations
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── src/
│   ├── config/              # Application configuration
│   ├── controllers/         # Request handlers
│   ├── middlewares/         # Express middlewares
│   ├── models/              # Data models
│   ├── routes/              # Route definitions
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── tests/                   # Test files
├── swagger.yaml             # API documentation
├── tsconfig.json            # TypeScript configuration
├── jest.config.ts           # Jest configuration
├── .env.example             # Example environment variables
└── package.json             # Project dependencies
```

## 🔧 Available Scripts

- `npm run dev` - Start the development server with hot reloading
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Lint the code

## 📝 API Endpoints

The starter includes a complete CRUD API for the `Item` resource:

- `GET /api/items` - Get all items
- `POST /api/items` - Create a new item
- `GET /api/items/:id` - Get an item by ID
- `PUT /api/items/:id` - Update an item
- `DELETE /api/items/:id` - Delete an item

Detailed API documentation is available at `/docs` when the server is running.

## 🧪 Testing

The project includes comprehensive tests for the API endpoints. Run the tests with:

```bash
npm test
```

## 📊 Database

This template uses PostgreSQL with Prisma ORM. The database schema is defined in `prisma/schema.prisma`.

To modify the database schema:

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_migration_name`
3. Prisma will generate the SQL migration and apply it to your database

## 🛡️ Error Handling

The application includes a global error handling middleware that catches and formats errors consistently.

## 📖 Swagger Documentation

API documentation is automatically generated using Swagger UI. Access it at `/docs` when the server is running.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
