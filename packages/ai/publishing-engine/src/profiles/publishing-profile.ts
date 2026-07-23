import type { PublishingProfile, PublishingOptions } from '../types/publishing-context.js';

export interface ProfileDefinition {
  name: PublishingProfile;
  label: string;
  renderFormat: string;
  defaultExportFormats: string[];
  pageSize: string;
  fontSize: number;
  lineHeight: number;
  margins: { top: number; bottom: number; left: number; right: number };
}

const PROFILES: Record<PublishingProfile, ProfileDefinition> = {
  'novel': {
    name: 'novel', label: 'Novel', renderFormat: 'novel',
    defaultExportFormats: ['pdf', 'epub', 'html'],
    pageSize: '6x9', fontSize: 12, lineHeight: 1.6,
    margins: { top: 72, bottom: 72, left: 72, right: 72 },
  },
  'light-novel': {
    name: 'light-novel', label: 'Light Novel', renderFormat: 'novel',
    defaultExportFormats: ['pdf', 'epub', 'html'],
    pageSize: '5x8', fontSize: 11, lineHeight: 1.5,
    margins: { top: 60, bottom: 60, left: 60, right: 60 },
  },
  'comic': {
    name: 'comic', label: 'Comic Script', renderFormat: 'comic',
    defaultExportFormats: ['pdf', 'html', 'txt'],
    pageSize: '8.5x11', fontSize: 10, lineHeight: 1.4,
    margins: { top: 48, bottom: 48, left: 60, right: 60 },
  },
  'manga': {
    name: 'manga', label: 'Manga Script', renderFormat: 'comic',
    defaultExportFormats: ['pdf', 'html', 'txt'],
    pageSize: '5x7.5', fontSize: 10, lineHeight: 1.4,
    margins: { top: 48, bottom: 48, left: 48, right: 48 },
  },
  'visual-novel': {
    name: 'visual-novel', label: 'Visual Novel Script', renderFormat: 'visual-novel',
    defaultExportFormats: ['json', 'html', 'txt'],
    pageSize: '8.5x11', fontSize: 11, lineHeight: 1.5,
    margins: { top: 48, bottom: 48, left: 48, right: 48 },
  },
  'screenplay': {
    name: 'screenplay', label: 'Screenplay', renderFormat: 'screenplay',
    defaultExportFormats: ['pdf', 'html', 'txt'],
    pageSize: '8.5x11', fontSize: 12, lineHeight: 1.0,
    margins: { top: 48, bottom: 48, left: 72, right: 48 },
  },
  'interactive-fiction': {
    name: 'interactive-fiction', label: 'Interactive Fiction', renderFormat: 'interactive-fiction',
    defaultExportFormats: ['json', 'html', 'txt'],
    pageSize: '8.5x11', fontSize: 11, lineHeight: 1.5,
    margins: { top: 48, bottom: 48, left: 48, right: 48 },
  },
  'game-script': {
    name: 'game-script', label: 'Game Script', renderFormat: 'screenplay',
    defaultExportFormats: ['json', 'html', 'txt'],
    pageSize: '8.5x11', fontSize: 10, lineHeight: 1.3,
    margins: { top: 36, bottom: 36, left: 36, right: 36 },
  },
};

export class PublishingProfileManager {
  getProfile(profile: PublishingProfile): ProfileDefinition {
    const def = PROFILES[profile];
    if (!def) return PROFILES['novel'];
    return def;
  }

  getAllProfiles(): ProfileDefinition[] {
    return Object.values(PROFILES);
  }

  getDefaultOptions(profile: PublishingProfile): Partial<PublishingOptions> {
    const def = this.getProfile(profile);
    return {
      profile,
      renderFormat: def.renderFormat as PublishingOptions['renderFormat'],
      exportFormats: def.defaultExportFormats as PublishingOptions['exportFormats'],
      pageSize: def.pageSize,
      fontSize: def.fontSize,
      lineHeight: def.lineHeight,
      margins: def.margins,
    };
  }
}
