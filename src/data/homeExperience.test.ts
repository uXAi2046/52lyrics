import { describe, expect, it } from 'vitest';
import { HOME_LAYOUTS, nextHomeLayout, selectHomeExperience } from './homeExperience';

const localTime = (month: number, day: number, hour: number) => new Date(2026, month - 1, day, hour);

describe('homepage editions', () => {
  it('uses local daypart and browser locale without changing the selection on reload', () => {
    const morning = selectHomeExperience(localTime(9, 30, 8), 'en-US');
    expect(morning.region).toBe('north-america');
    expect(morning.theme).toBe('harvest');
    expect(morning.title).toBe('Start with a voice.');
    expect(selectHomeExperience(localTime(9, 30, 8), 'en-US')).toEqual(morning);
    expect(selectHomeExperience(localTime(9, 30, 22), 'en-GB').regionTitle).toBe('From Britain & Ireland');
    expect(selectHomeExperience(localTime(9, 30, 22), 'zh-CN').regionTitle).toBe('Across the catalog');
    expect(selectHomeExperience(localTime(9, 30, 22), 'invalid-locale').region).toBe('world');
  });

  it('switches festive palettes on their dates and keeps other seasons distinct', () => {
    expect(selectHomeExperience(localTime(12, 24, 18), 'en-US').edition).toContain('Winter lights');
    expect(selectHomeExperience(localTime(10, 30, 18), 'en-US').theme).toBe('nightfall');
    expect(selectHomeExperience(localTime(2, 14, 18), 'en-US').theme).toBe('rose');
    expect(selectHomeExperience(localTime(4, 10, 13), 'en-US').theme).toBe('spring');
    expect(selectHomeExperience(localTime(7, 10, 13), 'en-US').theme).toBe('summer');
    expect(selectHomeExperience(localTime(1, 10, 13), 'en-US').theme).toBe('winter');
  });

  it('cycles through all three layouts', () => {
    expect(HOME_LAYOUTS).toEqual(['studio', 'gallery', 'reading']);
    expect(nextHomeLayout('studio')).toBe('gallery');
    expect(nextHomeLayout('gallery')).toBe('reading');
    expect(nextHomeLayout('reading')).toBe('studio');
  });
});
