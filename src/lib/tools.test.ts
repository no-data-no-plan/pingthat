import { describe, it, expect } from 'vitest';
import { tools, groups } from './tools';

describe('tools registry', () => {
  it('has exactly 17 tools', () => {
    expect(tools.length).toBe(17);
  });

  it('all tools have unique IDs', () => {
    const ids = tools.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all tools have unique paths (hrefs)', () => {
    const paths = tools.map((t) => t.path);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(paths.length);
  });

  it('all tool paths start with /', () => {
    for (const tool of tools) {
      expect(tool.path.startsWith('/'), `tool "${tool.id}" path "${tool.path}" must start with /`).toBe(true);
    }
  });

  it('all tool paths are URL-safe (lowercase, hyphens, no spaces)', () => {
    const validPath = /^\/[a-z0-9-]+$/;
    for (const tool of tools) {
      expect(validPath.test(tool.path), `tool "${tool.id}" path "${tool.path}" is not URL-safe`).toBe(true);
    }
  });

  it('all tools have non-empty required fields', () => {
    for (const tool of tools) {
      expect(tool.id.length, `tool has empty id`).toBeGreaterThan(0);
      expect(tool.name.length, `tool "${tool.id}" has empty name`).toBeGreaterThan(0);
      expect(tool.path.length, `tool "${tool.id}" has empty path`).toBeGreaterThan(0);
      expect(tool.description.length, `tool "${tool.id}" has empty description`).toBeGreaterThan(0);
      expect(tool.icon.length, `tool "${tool.id}" has empty icon`).toBeGreaterThan(0);
      expect(tool.group.length, `tool "${tool.id}" has empty group`).toBeGreaterThan(0);
    }
  });

  it('all tools have at least one keyword', () => {
    for (const tool of tools) {
      expect(tool.keywords.length, `tool "${tool.id}" has no keywords`).toBeGreaterThan(0);
      for (const kw of tool.keywords) {
        expect(kw.trim().length, `tool "${tool.id}" has an empty keyword`).toBeGreaterThan(0);
      }
    }
  });

  it('all tool IDs match their path (id should equal path without leading /)', () => {
    for (const tool of tools) {
      expect(tool.path).toBe(`/${tool.id}`);
    }
  });

  it('all tool icons are exactly 2 characters', () => {
    for (const tool of tools) {
      expect(tool.icon.length, `tool "${tool.id}" icon "${tool.icon}" is not 2 chars`).toBe(2);
    }
  });

  it('all tool icons are unique', () => {
    const icons = tools.map((t) => t.icon);
    const uniqueIcons = new Set(icons);
    expect(uniqueIcons.size).toBe(icons.length);
  });
});

describe('groups registry', () => {
  it('has at least 1 group', () => {
    expect(groups.length).toBeGreaterThan(0);
  });

  it('all groups have a label and at least 1 tool', () => {
    for (const group of groups) {
      expect(group.label.length, `group has empty label`).toBeGreaterThan(0);
      expect(group.ids.length, `group "${group.label}" has no tools`).toBeGreaterThan(0);
    }
  });

  it('all group tool IDs exist in the tools array', () => {
    const toolIdSet = new Set(tools.map((t) => t.id));
    for (const group of groups) {
      for (const id of group.ids) {
        expect(toolIdSet.has(id), `group "${group.label}" references unknown tool "${id}"`).toBe(true);
      }
    }
  });

  it('every tool belongs to exactly one group', () => {
    const allGroupIds = groups.flatMap((g) => g.ids);
    const toolIds = tools.map((t) => t.id);

    // Every tool ID appears in some group
    for (const id of toolIds) {
      expect(allGroupIds.includes(id), `tool "${id}" is not in any group`).toBe(true);
    }

    // No duplicates across groups
    const uniqueGroupIds = new Set(allGroupIds);
    expect(uniqueGroupIds.size).toBe(allGroupIds.length);
  });

  it('tool group field matches the group it belongs to', () => {
    const idToGroupLabel = new Map<string, string>();
    for (const group of groups) {
      for (const id of group.ids) {
        idToGroupLabel.set(id, group.label);
      }
    }
    for (const tool of tools) {
      const expected = idToGroupLabel.get(tool.id);
      expect(tool.group, `tool "${tool.id}" group mismatch`).toBe(expected);
    }
  });

  it('group labels are unique', () => {
    const labels = groups.map((g) => g.label);
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(labels.length);
  });
});
