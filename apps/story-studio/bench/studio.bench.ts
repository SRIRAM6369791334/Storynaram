import { describe, bench } from 'vitest';
import { useWorkspaceStore } from '../src/stores/workspace-store';
import { useAuthStore } from '../src/stores/auth-store';
import { cn } from '../src/utils/cn';
import { truncate, pluralize } from '../src/utils/format';

describe('Studio Benchmarks', () => {
  bench('zustand store operations', () => {
    const store = useWorkspaceStore.getState();
    for (let i = 0; i < 100; i++) {
      store.openTab({ id: `tab-${i}`, title: `Tab ${i}`, type: 'story' });
    }
    for (let i = 0; i < 100; i++) {
      store.closeTab(`tab-${i}`);
    }
  }, { iterations: 10, time: 2000 });

  bench('cn utility', () => {
    for (let i = 0; i < 1000; i++) {
      cn('px-4 py-2', 'bg-background', 'text-sm font-medium', i % 2 === 0 && 'rounded-lg');
    }
  }, { iterations: 100, time: 2000 });

  bench('string operations', () => {
    for (let i = 0; i < 1000; i++) {
      truncate('A very long string that needs to be truncated at some point', 20);
      pluralize(i, 'story');
    }
  }, { iterations: 100, time: 2000 });

  bench('auth store operations', () => {
    useAuthStore.getState().setAuth(
      { id: '1', email: 'test@test.com', roles: ['author'] },
      { accessToken: 'abc', refreshToken: 'def' },
    );
    useAuthStore.getState().logout();
  }, { iterations: 1000, time: 2000 });
});
