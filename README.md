# ArduinoAssess

Adaptive Coding Ability Assessment Platform for Arduino Programming

## Overview

ArduinoAssess is an intelligent assessment platform that uses adaptive questioning to evaluate students' Arduino programming skills across five key dimensions:

- **Low-Level & Binary Understanding**: Binary, hex, bitwise operations, digital signal fundamentals
- **Control Flow & Logic**: Conditionals, loops, logical operators, state machines
- **Hardware I/O Intuition**: pinMode, digitalWrite, digitalRead, analogRead/Write usage
- **Code Reading & Debugging**: Understanding existing code, predicting output
- **Problem Decomposition & Design**: Breaking problems into functions, solution planning

The platform uses AI (Claude Sonnet 4) to generate questions dynamically and provide personalized feedback.

## Features

✅ **Adaptive Question Selection**: Targets student's skill level dynamically
✅ **AI-Powered Question Generation**: Creates tailored questions on-demand
✅ **Multiple Question Types**: One-liner, multiple choice, code IDE, trace/predict
✅ **Intelligent Hint System**: Diagnostic hints that don't penalize students
✅ **Keystroke Replay**: Captures problem-solving process for analysis
✅ **Comprehensive Results**: Detailed skill profiles with actionable insights
✅ **Token Usage Tracking**: Monitors AI costs per assessment

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui (industrial rigidity design)
- **State Management**: Zustand
- **Code Editor**: Monaco Editor (VS Code engine)
- **Charts**: Recharts
- **Backend**: Hono (lightweight web framework)
- **Runtime**: Bun
- **Database**: Neon Serverless PostgreSQL
- **AI**: Anthropic Claude Sonnet 4
- **Deployment**: Google Cloud Run (Singapore region)

## Prerequisites

- [Bun](https://bun.sh/) v1.0+ installed
- PostgreSQL database (Neon recommended)
- Anthropic API key
- Node.js 18+ (for some tooling)

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-...

# Server
PORT=3000
NODE_ENV=development

# Optional: Frontend development
VITE_API_URL=http://localhost:3000/api
```

## Installation

```bash
# Install dependencies
bun install

# Initialize database tables
bun run server/db/init.ts

# Or run the initialization function manually in your code
```

## Development

### Run Full Stack (Single Process)

```bash
bun run dev
```

This starts the Hono server on port 3000, which serves both the API and proxies to Vite dev server.

### Run Frontend Only (with Vite dev server)

```bash
bun run dev:frontend
```

Frontend will be available at `http://localhost:5173`

### Run Backend Only

```bash
bun run dev:server
```

API will be available at `http://localhost:3000`

## Database Setup

The application uses PostgreSQL with the following tables:

- `students` - Student profiles
- `assessment_sessions` - Active and completed assessments
- `dimension_states` - Per-dimension skill level bounds
- `question_responses` - Student answers and metadata
- `question_bank` - Pre-seeded questions
- `ai_token_usage` - AI API call tracking
- `assessment_results` - Final assessment profiles

To initialize:

```typescript
import { initializeDatabase } from './server/db/client';
await initializeDatabase();
```

## Building for Production

```bash
# Build frontend
bun run build:frontend

# Build everything
bun run build
```

This creates optimized production files in `dist/public/`.

## Deployment

### Google Cloud Run

```bash
# Deploy to Cloud Run (Singapore region)
bun run deploy
```

Or manually:

```bash
# Build and push Docker image
docker build -t gcr.io/YOUR_PROJECT/arduino-assess .
docker push gcr.io/YOUR_PROJECT/arduino-assess

# Deploy to Cloud Run
gcloud run deploy arduino-assess \
  --image gcr.io/YOUR_PROJECT/arduino-assess \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=$DATABASE_URL,ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
```

## Project Structure

```
ArduinoAssess/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/         # Zustand stores
│   │   ├── types/         # TypeScript types
│   │   ├── lib/           # Utilities
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   └── index.html         # HTML entry
├── server/                # Hono backend
│   ├── routes/            # API route handlers
│   │   ├── assessment.ts  # Assessment endpoints
│   │   ├── questions.ts   # Question bank
│   │   └── analytics.ts   # Analytics & tokens
│   ├── lib/               # Business logic
│   │   ├── adaptive.ts    # Adaptive algorithm
│   │   └── ai.ts          # AI integration
│   ├── db/                # Database layer
│   │   ├── client.ts      # DB operations
│   │   └── schema.ts      # Type definitions
│   └── index.ts           # Server entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── Dockerfile
└── README.md
```

## API Endpoints

### Assessment Endpoints

- `POST /api/assessment/start` - Start new assessment
- `POST /api/assessment/submit` - Submit answer, get next question
- `POST /api/assessment/hint` - Request a hint
- `GET /api/assessment/:sessionId` - Get assessment state

### Question Bank Endpoints

- `GET /api/questions` - List questions
- `POST /api/questions` - Create question
- `GET /api/questions/:id` - Get specific question

### Analytics Endpoints

- `GET /api/analytics/tokens/:assessmentId` - Token usage
- `GET /api/analytics/session/:sessionId` - Session analytics

## Assessment Flow

1. **Welcome**: Student enters name (optional)
2. **Exploration Phase**: System tests each dimension at medium difficulty
3. **Refinement Phase**: Focuses on most uncertain dimensions, narrows bounds
4. **Completion**: All dimensions converged (bound range ≤ 1.5)
5. **Results**: AI-generated profile with strengths, growth areas, insights

## Adaptive Algorithm

The system maintains upper/lower bounds for each dimension (1-5 scale):

- **Correct answer**: Raise lower bound to question difficulty
- **Partial credit**: Raise lower bound slightly (difficulty - 0.5)
- **Wrong answer**: Lower upper bound to question difficulty

Questions target the midpoint of current bounds, prioritizing dimensions with:
- Widest uncertainty (largest bound range)
- Fewest questions asked

## Contributing

This is a single-developer project for educational assessment. See `ArduinoAssess_Proposal.md` for complete technical specification.

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open a GitHub issue.

---

**Built with ⚡ Bun + 🤖 Claude + 🎯 Adaptive Learning**
