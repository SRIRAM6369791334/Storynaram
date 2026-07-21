import { bench, describe } from 'vitest';
import { IssueDetector } from '../src/detection/issue-detector';

const detector = new IssueDetector();
const shortContent = 'Their was a hero who recieved a mission.';
const longContent = Array.from({ length: 100 }, (_, i) =>
  `Chapter ${i + 1}: Their was a brave hero named Kael. He recieved a quest and definately accepted it. The journey began at midnight. ${i % 2 === 0 ? 'Kael walked through the forest.' : 'Kael climbed the mountain.'}`
).join('\n\n');

describe('Story Analysis Performance', () => {
  bench('detect all issues - short content', () => {
    detector.detectAll({ chapterNumber: 1, content: shortContent });
  });

  bench('detect all issues - long content', () => {
    detector.detectAll({ chapterNumber: 1, content: longContent });
  });

  bench('detect spelling - long content', () => {
    detector.detectSpelling(longContent, 1);
  });

  bench('detect grammar - long content', () => {
    detector.detectGrammar(longContent, 1);
  });
});
