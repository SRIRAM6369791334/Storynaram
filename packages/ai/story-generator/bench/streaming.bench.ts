import { bench, describe } from 'vitest';
import { StreamingCoordinator } from '../src/output/streaming-coordinator';
import { OutputAssembler } from '../src/output/output-assembler';

describe('Streaming Benchmarks', () => {
  bench('create and cancel coordinator', () => {
    const coordinator = new StreamingCoordinator();
    coordinator.cancelAll();
  });

  bench('assemble 50kb story text', () => {
    const assembler = new OutputAssembler();
    const text = 'A'.repeat(50000);
    assembler.calculateWordCount(text);
  });

  bench('format 100 chapter headers', () => {
    const assembler = new OutputAssembler();
    for (let i = 1; i <= 100; i++) {
      (assembler as any).formatChapterHeader(i, `Chapter ${i}`);
    }
  });
});
