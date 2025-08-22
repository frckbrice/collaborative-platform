# Custom Logger Usage Examples

This document shows how to use the custom logging utility that only logs in development environments.

## Basic Usage

```typescript
import { log } from '@/lib/utils/logger';

// Basic logging
log.info('User logged in successfully');
log.warn('API rate limit approaching');
log.error('Database connection failed', error);
log.debug('Processing user data', { userId: 123, email: 'user@example.com' });
```

## Specialized Logging

```typescript
import { log } from '@/lib/utils/logger';

// Authentication logging
log.auth('User session created', { userId: 123, expiresAt: '2024-01-01' });

// Middleware logging
log.middleware('Route protected', { path: '/dashboard', userId: 123 });

// API logging
log.api('Request received', { method: 'POST', endpoint: '/api/users' });

// Database logging
log.db('Query executed', { table: 'users', duration: '45ms' });

// Component logging
log.component('Component mounted', { name: 'UserProfile', props: { userId: 123 } });

// Performance logging
log.perf('Function completed', { duration: '12ms', memory: '2.3MB' });
```

## Advanced Features

```typescript
import { log } from '@/lib/utils/logger';

// Custom emoji and context
log.custom('🚀', 'Rocket launched', { fuel: '100%', altitude: '1000m' });

// Grouped logging
log.group('User Authentication Flow', () => {
  log.auth('Step 1: Validating credentials');
  log.auth('Step 2: Creating session');
  log.auth('Step 3: Setting cookies');
});

// Performance timing
log.time('Database Query');
// ... perform database operation
log.timeEnd('Database Query');

// Counting function calls
log.count('API Request');
log.count('API Request');
log.count('API Request');
// Output: 🔢 API Request: 3

// Reset counter
log.countReset('API Request');

// Table logging
log.table([
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' },
]);

// Stack trace
log.trace('Function called from here');
```

## Options and Configuration

```typescript
import { log } from '@/lib/utils/logger';

// Custom context
log.info('Processing user data', null, { context: 'USER_SERVICE' });

// Without timestamp
log.info('Quick message', null, { timestamp: false });

// Without log level
log.info('Clean message', null, { showLevel: false });

// Combined options
log.info('Complex message', data, {
  context: 'AUTH_SERVICE',
  timestamp: false,
  showLevel: false,
});
```

## Real-World Examples

### Authentication Flow

```typescript
import { log } from '@/lib/utils/logger';

export async function loginUser(email: string, password: string) {
  log.auth('Login attempt started', { email });

  try {
    log.time('Login Process');

    // Validate credentials
    log.auth('Validating credentials');
    const user = await validateCredentials(email, password);

    // Create session
    log.auth('Creating user session');
    const session = await createSession(user.id);

    log.auth('Login successful', { userId: user.id });
    log.timeEnd('Login Process');

    return { success: true, user, session };
  } catch (error) {
    log.error('Login failed', error);
    return { success: false, error: error.message };
  }
}
```

### Middleware Logging

```typescript
import { log } from '@/lib/utils/logger';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  log.middleware('Processing route', {
    path: pathname,
    method: req.method,
    userAgent: req.headers.get('user-agent')?.substring(0, 50),
  });

  // ... middleware logic
}
```

### Component Lifecycle

```typescript
import { log } from '@/lib/utils/logger';
import { useEffect } from 'react';

export function UserProfile({ userId }: { userId: string }) {
  log.component('UserProfile component rendered', { userId });

  useEffect(() => {
    log.component('UserProfile mounted', { userId });

    return () => {
      log.component('UserProfile unmounting', { userId });
    };
  }, [userId]);

  // ... component logic
}
```

## Environment Behavior

- **Development**: All logs are displayed with full formatting
- **Production**: No logs are displayed (silent)
- **Test**: Logs are displayed for debugging tests

## Benefits

✅ **Production Safe**: No accidental logging in production
✅ **Development Friendly**: Rich logging during development
✅ **Organized**: Categorized logging with emojis and context
✅ **Flexible**: Multiple logging levels and options
✅ **Performance**: Zero overhead in production
✅ **Consistent**: Standardized logging format across the app

## Migration from console.log

Replace:

```typescript
console.log('User logged in:', user);
console.error('Login failed:', error);
```

With:

```typescript
log.auth('User logged in', user);
log.error('Login failed', error);
```

This ensures your logs never accidentally reach production! 🎯
