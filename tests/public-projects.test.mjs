import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.children)];
}

function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join('');
  if (tree && typeof tree === 'object') return text(tree.children);
  return tree == null ? '' : String(tree);
}

function projectRows() {
  const context = {
    window: {},
    React: { createElement: (type, props, ...children) => ({ type, props, children }) },
    ReactDOM: { createRoot: () => ({ render() {} }) },
    document: { getElementById: () => ({}) },
  };
  runInNewContext(readFileSync(new URL('../app.js', import.meta.url), 'utf8'), context);
  return nodes(context.window.Projects()).filter(node => node.type === 'article');
}

test('Recorder and Ledger rows show Website and Source links', () => {
  const rows = projectRows();
  for (const [name, website] of [
    ['journal-recorder-agent', 'https://gauravratnawat.com/journal-recorder-agent/'],
    ['decision-ledger-setup', 'https://gauravratnawat.com/decision-ledger-setup/'],
  ]) {
    const row = rows.find(row => text(row).includes(name));
    assert.ok(row, `${name} row must exist`);
    const links = nodes(row).filter(node => node.type === 'a');
    assert.equal(links.find(link => text(link).trim() === 'Website')?.props.href, website);
    assert.equal(links.find(link => text(link).trim() === 'Source')?.props.href,
      `https://github.com/GauravRatnawat/${name}`);
  }
});

test('More public tools show page and source links in nine project rows', () => {
  const rows = projectRows();
  assert.equal(rows.length, 9);
  for (const [name, website] of [
    ['claudetop', 'https://gauravratnawat.com/claudetop/'],
    ['claude-cost-optimizer', 'https://gauravratnawat.com/claude-cost-optimizer/'],
    ['neuralengine', 'https://neuralengine-six.vercel.app/'],
  ]) {
    const row = rows.find(row => text(row).includes(name));
    assert.ok(row, `${name} row must exist`);
    const links = nodes(row).filter(node => node.type === 'a');
    assert.equal(links.find(link => text(link).trim() === 'Website')?.props.href, website);
    assert.equal(links.find(link => text(link).trim() === 'Source')?.props.href,
      `https://github.com/GauravRatnawat/${name}`);
  }
});
