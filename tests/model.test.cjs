'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {Board, LIMIT, HISTORY_LIMIT} = require('../js/model.js');

test('the original rule removes exactly the second blue pair, and undo restores both', () => {
  const board = new Board();
  board.add();
  board.toggle(1);
  assert.deepEqual(board.snapshot().blocks.map(b => b.color), ['blue', 'green', 'green']);
  board.toggle(2);
  assert.deepEqual(board.snapshot().blocks, [{id: 3, color: 'green'}]);
  board.undo();
  assert.deepEqual(board.snapshot().blocks.map(b => b.color), ['blue', 'green', 'green']);
  board.redo();
  assert.deepEqual(board.snapshot().blocks, [{id: 3, color: 'green'}]);
});

test('blue can turn back to green without deleting it; remove only affects its color', () => {
  const board = new Board();
  board.toggle(1); board.toggle(1);
  assert.equal(board.snapshot().blocks.length, 2);
  assert.equal(board.snapshot().blocks[0].color, 'green');
  board.toggle(2); board.remove('green');
  assert.deepEqual(board.snapshot().blocks, [{id: 2, color: 'blue'}]);
  board.remove('blue'); assert.deepEqual(board.snapshot().blocks, []);
  board.add(); assert.deepEqual(board.snapshot().blocks, [{id: 3, color: 'green'}]);
});

test('undo and redo include reset, with redo abandoned only by a new real action', () => {
  const board = new Board();
  board.add(); const before = board.snapshot(); board.reset(); board.undo();
  assert.deepEqual(board.snapshot(), before);
  board.redo(); assert.equal(board.snapshot().blocks.length, 2);
  board.undo(); assert.equal(board.canRedo, true);
  board.toggle(-1); board.remove('blue'); assert.equal(board.canRedo, true);
  board.toggle(1); assert.equal(board.canRedo, false);
});

test('the cap and history bounds hold and returned snapshots cannot corrupt undo', () => {
  const board = new Board();
  for (let i = 0; i < LIMIT + 10; i++) board.add();
  assert.equal(board.snapshot().blocks.length, LIMIT);
  assert.equal(board.add().changed, false);
  const snapshot = board.snapshot(); snapshot.blocks[0].color = 'corrupted'; snapshot.blocks.length = 0;
  assert.equal(board.snapshot().blocks[0].color, 'green');
  let undone = 0; while (board.undo().changed) undone++;
  assert.equal(undone, HISTORY_LIMIT);
  let redone = 0; while (board.redo().changed) redone++;
  assert.equal(redone, HISTORY_LIMIT);
  assert.equal(board.snapshot().blocks.length, LIMIT);
  assert.throws(() => board.remove('red'), TypeError);
});

test('empty reset and no-op actions do not create fictitious history', () => {
  const board = new Board();
  assert.equal(board.reset().changed, false);
  assert.equal(board.toggle(404).changed, false);
  assert.equal(board.remove('blue').changed, false);
  assert.equal(board.canUndo, false);
  board.remove('green'); board.reset();
  assert.equal(board.snapshot().blocks.length, 2);
  board.undo(); assert.deepEqual(board.snapshot().blocks, []);
});

test('seeded mixed actions preserve color, identity, bounds and complete undo-redo roundtrips', () => {
  const board = new Board(); let seed = 8241;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  for (let i = 0; i < 3000; i++) {
    const blocks = board.snapshot().blocks;
    switch (random() % 7) {
      case 0: board.add(); break;
      case 1: case 2: board.toggle(blocks.length ? blocks[random() % blocks.length].id : -1); break;
      case 3: board.remove(random() % 2 ? 'green' : 'blue'); break;
      case 4: board.undo(); break;
      case 5: board.redo(); break;
      case 6: board.reset(); break;
    }
    const current = board.snapshot();
    assert(current.blocks.length <= LIMIT);
    assert(current.blocks.every(b => b.color === 'green' || b.color === 'blue'));
    assert(current.blocks.filter(b => b.color === 'blue').length <= 1);
    assert.equal(new Set(current.blocks.map(b => b.id)).size, current.blocks.length);
    assert(current.blocks.every(b => b.id > 0 && b.id < current.nextId));
  }
  const final = board.snapshot(); let count = 0;
  while (board.undo().changed) count++;
  for (let i = 0; i < count; i++) assert.equal(board.redo().changed, true);
  assert.deepEqual(board.snapshot(), final);
});
