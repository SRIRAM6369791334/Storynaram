import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { StoryService } from '../../src/modules/story/story.service';

describe('Story Endpoints (e2e)', () => {
  let app: INestApplication;
  let storyService: StoryService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    storyService = moduleFixture.get(StoryService);
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a story via service', async () => {
    const story = await storyService.create({ title: 'E2E Story', description: 'E2E test' });
    expect(story.id).toBeDefined();
    expect(story.title).toBe('E2E Story');
  });

  it('should list stories via service', async () => {
    await storyService.create({ title: 'Story for list' });
    const stories = await storyService.findAll();
    expect(Array.isArray(stories)).toBe(true);
    expect(stories.length).toBeGreaterThanOrEqual(1);
  });

  it('should get story by id via service', async () => {
    const created = await storyService.create({ title: 'Get Test' });
    const story = await storyService.findById(created.id);
    expect(story.title).toBe('Get Test');
  });
});
