/* global ColorBlocks */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const board = new ColorBlocks.Board();
  const $ = id => document.getElementById(id);
  const container = $('container');
  const label = color => color === 'green' ? 'Verde' : 'Azul';
  const countLabel = (total, green, blue) => `${total} ${total === 1 ? 'bloque' : 'bloques'} · ${green} ${green === 1 ? 'verde' : 'verdes'} · ${blue} ${blue === 1 ? 'azul' : 'azules'}`;

  function render() {
    const {blocks} = board.snapshot();
    const green = blocks.filter(block => block.color === 'green').length;
    const blue = blocks.length - green;
    const focused = document.activeElement;
    const focusedId = focused?.dataset.blockId;
    const previous = [...container.querySelectorAll('button')].findIndex(button => button === focused);
    const fragment = document.createDocumentFragment();
    for (const block of blocks) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'block ' + block.color;
      button.dataset.blockId = block.id;
      button.setAttribute('aria-label', `Bloque ${block.id}, ${label(block.color).toLowerCase()}. Cambiar color`);
      button.setAttribute('aria-pressed', String(block.color === 'blue'));
      const number = document.createElement('span');
      number.className = 'block-number'; number.textContent = String(block.id).padStart(2, '0');
      const name = document.createElement('span');
      name.className = 'block-name'; name.textContent = label(block.color);
      const action = document.createElement('span');
      action.className = 'block-action'; action.textContent = 'Cambiar color';
      button.append(number, name, action); item.append(button); fragment.append(item);
    }
    container.replaceChildren(fragment);
    $('counts').textContent = countLabel(blocks.length, green, blue);
    $('empty').hidden = blocks.length !== 0;
    $('btnAdd').disabled = blocks.length >= ColorBlocks.LIMIT;
    $('btnRemoveG').disabled = green === 0;
    $('btnRemoveB').disabled = blue === 0;
    $('undo').disabled = !board.canUndo;
    $('redo').disabled = !board.canRedo;
    if (focusedId) {
      const buttons = [...container.querySelectorAll('button')];
      const target = buttons.find(button => button.dataset.blockId === focusedId)
        || buttons[Math.min(Math.max(previous, 0), buttons.length - 1)] || $('btnAdd');
      target.focus({preventScroll: true});
    } else if (focused?.disabled) {
      // Removing the last color or reaching the cap must not lose keyboard focus.
      (board.canUndo ? $('undo') : $('btnAdd')).focus({preventScroll: true});
    }
  }

  function apply(operation) {
    const result = operation();
    if (result.changed) render();
    $('status').textContent = result.message + ' ' + $('counts').textContent + '.';
  }

  $('btnAdd').addEventListener('click', () => apply(() => board.add()));
  $('btnRemoveG').addEventListener('click', () => apply(() => board.remove('green')));
  $('btnRemoveB').addEventListener('click', () => apply(() => board.remove('blue')));
  $('undo').addEventListener('click', () => apply(() => board.undo()));
  $('redo').addEventListener('click', () => apply(() => board.redo()));
  $('reset').addEventListener('click', () => apply(() => board.reset()));
  container.addEventListener('click', event => {
    const button = event.target.closest('button[data-block-id]');
    if (button && container.contains(button)) apply(() => board.toggle(Number(button.dataset.blockId)));
  });
  render();
});
