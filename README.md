# Angular 20 Todo List Application

A modern, feature-rich todo list application built with **Angular 20.3** showcasing the latest Angular patterns and best practices including signals, standalone components, and reactive state management.

## Live Demo

[View Live Application](https://proud-grass-0c072a310.1.azurestaticapps.net/tasks)

## Features

- **Task Management**: Create, edit, delete, and mark tasks as complete
- **Due Dates**: Set and track due dates for tasks using a date picker
- **Smart Filtering**: Filter tasks by status (All, Active, Completed)
- **Flexible Sorting**: Sort by due date, creation date, or alphabetically
- **Overdue Detection**: Visual indicators for overdue tasks
- **Persistent Storage**: Tasks automatically saved to localStorage
- **Responsive Design**: Clean, modern UI built with TailwindCSS v4
- **Real-time Statistics**: Track pending and total tasks

## Tech Stack

- **Framework**: Angular 20.3.x with standalone components
- **Runtime**: Bun (package manager and runtime)
- **Testing**: Vitest with coverage reporting
- **Styling**: TailwindCSS v4.1 with PostCSS
- **TypeScript**: 5.9 with strict mode enabled
- **CI/CD**: GitHub Actions (automated testing & deployment)

## Architecture Highlights

### Signal-Based State Management

The application uses Angular signals for reactive state management without external state libraries:

- **TaskManagement Service** (`src/app/features/task-manager/services/task-management.ts`):
  - `WritableSignal<Task[]>` for mutable state
  - Computed signals for derived state (active, completed, overdue tasks)
  - Automatic localStorage synchronization via effects

### Feature-Based Structure

```
src/app/
├── core/
│   ├── services/
│   │   └── local-storage.ts         # LocalStorage service wrapper
│   └── utils/
│       └── date-formatter.ts        # Date formatting & validation utility
├── features/
│   ├── task-manager/
│   │   ├── components/
│   │   │   ├── task-form/           # Add new tasks with due dates
│   │   │   ├── task-filters/        # Filter & sort controls
│   │   │   ├── task-stats/          # Task statistics display
│   │   │   ├── task-list/           # Task list container
│   │   │   └── task-item/           # Individual task item
│   │   ├── models/
│   │   │   ├── task.ts              # Task interface
│   │   │   └── task-filter.ts       # Filter & sort types
│   │   ├── services/
│   │   │   └── task-management.ts   # Task state management
│   │   ├── task-manager.ts          # Smart container component
│   │   └── task-manager.html
│   └── shared/
│       └── components/
│           ├── header/              # Application header
│           └── footer/              # Application footer
└── app.routes.ts                    # Lazy-loaded routing
```

### Design Patterns

**Strategy Pattern** for filtering and sorting:

- Filter strategies: all, active, completed tasks
- Sort strategies: by due date, creation date, or title
- Eliminates switch statements for cleaner, maintainable code

**Smart/Presentational Component Pattern**:

- **Smart**: `TaskManager` manages state and business logic
- **Presentational**: Child components handle UI and emit events
- Benefits: Reusability, testability, separation of concerns

**OnPush Change Detection**:

- All components use `ChangeDetectionStrategy.OnPush`
- Optimized performance with signal-based reactivity

### Standalone Components

- No NgModules - uses modern standalone API
- Components declare dependencies via `imports` array
- Tree-shakeable and lazy-loadable by default

### Utility Services

**DateFormatter** (`src/app/core/utils/date-formatter.ts`):

- Memoized Intl.DateTimeFormat for performance
- Date normalization for accurate comparisons
- Timezone-safe date parsing
- Overdue detection logic

**LocalStorage** (`src/app/core/services/local-storage.ts`):

- Type-safe generic methods
- Error handling for storage operations
- Automatic JSON serialization/deserialization

## Getting Started

### Prerequisites

- **Bun** (latest version) - [Install Bun](https://bun.sh/)
- **Node.js** 18+ (for Angular CLI compatibility)

### Installation

```bash
# Clone the repository
git clone https://github.com/francisco-aros/angular20-learn-todolist.git
cd angular20-learn-todolist

# Install dependencies
bun install
```

### Development Server

```bash
# Start development server
bun run bun:start
# or
ng serve

# Navigate to http://localhost:4200/
```

The application will automatically reload when you modify source files.

### Building

```bash
# Production build
bun run build

# Development build with watch mode
bun run watch

# Build for GitHub Pages (with base-href)
bun run build -- --base-href=/angular20-learn-todolist/
```

Build artifacts are stored in `dist/angular20-learn-todolist/browser/`.

### Testing

The project uses **Vitest** (configured in `angular.json`) for fast unit testing:

```bash
# Run tests in watch mode (development)
bun run bun:test:dev

# Run tests once with coverage (CI mode)
bun run bun:test

# Alternative using ng CLI
ng test
```

**Test Coverage**:

- All services have unit tests with comprehensive coverage
- All components have spec files with key behavior tests
- Coverage reports available in `coverage/` directory

### Code Formatting

Prettier is configured with TailwindCSS plugin for consistent formatting:

```bash
# Format all files
npx prettier --write .
```

Configuration in `.prettierrc`:

- 100 character line width
- Single quotes
- Tailwind class sorting
- Angular HTML parser

## Project Configuration

### TypeScript

Strict mode enabled in `tsconfig.json`:

- `strict: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `strictTemplates: true` (Angular)

### Angular Compiler

- `strictInjectionParameters: true`
- `strictInputAccessModifiers: true`
- `strictTemplates: true`

### Build Configuration

- **Builder**: `@angular/build:application` (modern Angular builder)
- **Test Runner**: Vitest via `@angular/build:unit-test`
- **Styles**: PostCSS with TailwindCSS v4
- **Bundle Budgets**: 500kB warning, 1MB error for initial bundle

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/static.yml`):

1. **Unit Tests Job**:

- Runs on Ubuntu latest with Bun
- Executes `bun run bun:test`
- Must pass before build starts

2. **Build Job**:

- Builds with production configuration
- Includes GitHub Pages base-href
- Uploads build artifacts

3. **Deploy Job**:

- Deploys to GitHub Pages
- Triggered on push to main branch

## Scripts Reference

| Script         | Command                                        | Description                     |
|----------------|------------------------------------------------|---------------------------------|
| `bun:start`    | `ng serve`                                     | Start development server        |
| `build`        | `ng build`                                     | Production build                |
| `watch`        | `ng build --watch --configuration development` | Development build in watch mode |
| `bun:test:dev` | `ng test`                                      | Run tests in watch mode         |
| `bun:test`     | `ng test --no-watch --code-coverage`           | Run tests once with coverage    |

## Key Dependencies

### Runtime Dependencies

- `@angular/core`, `@angular/common`, `@angular/forms` (^20.3.0)
- `@angular/router` (^20.3.0)
- `@tailwindcss/postcss` (^4.1.13)
- `flatpickr` (^4.6.13) - Date picker
- `rxjs` (~7.8.0)
- `vitest` (^3.2.4)

### Development Dependencies

- `@angular/cli`, `@angular/build` (^20.3.3)
- `@vitest/coverage-v8` (3.2.4)
- `prettier` + `prettier-plugin-tailwindcss`
- `typescript` (~5.9.2)

## Code Quality

- **100% TypeScript** with strict type checking
- **Comprehensive unit tests** for all services and components
- **Prettier formatting** enforced for consistent code style
- **OnPush change detection** for optimized performance
- **Signal-based reactivity** following Angular best practices
- **No any types** - fully typed codebase

## Learning Resources

This project demonstrates modern Angular 20+ patterns:

- Signal-based state management (no RxJS for state)
- Standalone components (no NgModules)
- Smart/presentational component architecture
- Strategy Pattern implementation
- Effect usage for side effects (localStorage sync)
- Computed signals for derived state
- Modern Angular builder and Vitest integration

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project was created for learning purposes.

## Acknowledgments

- Built with [Angular CLI](https://github.com/angular/angular-cli) version 20.3.3
- Styled with [TailwindCSS](https://tailwindcss.com/) v4
- Tested with [Vitest](https://vitest.dev/)
- Deployed to [GitHub Pages](https://pages.github.com/)

---

Generated with Angular 20.3 | Powered by Bun | Tested with Vitest
