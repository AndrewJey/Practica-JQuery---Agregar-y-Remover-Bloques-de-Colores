'use strict';

// The exercise removes both blue blocks as soon as a second one is selected.
// Keeping this rule outside the DOM makes undo, keyboard and pointer consistent.
(function (root) {
  const LIMIT = 200;
  const HISTORY_LIMIT = 100;
  const initial = () => ({blocks: [{id: 1, color: 'green'}, {id: 2, color: 'green'}], nextId: 3});
  const copy = state => ({blocks: state.blocks.map(block => ({...block})), nextId: state.nextId});

  class Board {
    constructor() {
      this.state = initial();
      this.past = [];
      this.future = [];
    }

    snapshot() {return copy(this.state);}
    get canUndo() {return this.past.length > 0;}
    get canRedo() {return this.future.length > 0;}

    commit(next, message) {
      this.past.push(this.state);
      if (this.past.length > HISTORY_LIMIT) this.past.shift();
      this.state = next;
      this.future = [];
      return {changed: true, message};
    }

    add() {
      if (this.state.blocks.length >= LIMIT) return {changed: false, message: `Límite de ${LIMIT} bloques. Elimina alguno para agregar otro.`};
      const next = copy(this.state);
      next.blocks.push({id: next.nextId++, color: 'green'});
      return this.commit(next, `Bloque ${next.nextId - 1} verde agregado.`);
    }

    toggle(id) {
      const next = copy(this.state);
      const target = next.blocks.find(block => block.id === id);
      if (!target) return {changed: false, message: 'Ese bloque ya no está en el tablero.'};
      target.color = target.color === 'green' ? 'blue' : 'green';
      const pair = next.blocks.filter(block => block.color === 'blue').length === 2;
      if (pair) next.blocks = next.blocks.filter(block => block.color !== 'blue');
      return this.commit(next, pair ? 'Se formó una pareja azul: se eliminaron ambos bloques.' : `Bloque ${id} cambiado a ${target.color === 'blue' ? 'azul' : 'verde'}.`);
    }

    remove(color) {
      if (!['green', 'blue'].includes(color)) throw new TypeError('Color no válido.');
      const next = copy(this.state);
      next.blocks = next.blocks.filter(block => block.color !== color);
      const count = this.state.blocks.length - next.blocks.length;
      if (!count) return {changed: false, message: 'No hay bloques de ese color.'};
      const name = color === 'blue' ? (count === 1 ? 'azul' : 'azules') : (count === 1 ? 'verde' : 'verdes');
      return this.commit(next, count === 1 ? `Se eliminó 1 bloque ${name}.` : `Se eliminaron ${count} bloques ${name}.`);
    }

    reset() {
      if (this.state.blocks.length === 2 && this.state.nextId === 3 && this.state.blocks.every(block => block.color === 'green')) {
        return {changed: false, message: 'El tablero ya está en su estado inicial.'};
      }
      return this.commit(initial(), 'Tablero reiniciado con dos bloques verdes. Puedes deshacerlo.');
    }

    undo() {
      if (!this.canUndo) return {changed: false, message: 'No hay acciones para deshacer.'};
      this.future.push(this.state);
      this.state = this.past.pop();
      return {changed: true, message: 'Acción deshecha.'};
    }

    redo() {
      if (!this.canRedo) return {changed: false, message: 'No hay acciones para rehacer.'};
      this.past.push(this.state);
      this.state = this.future.pop();
      return {changed: true, message: 'Acción rehecha.'};
    }
  }

  const api = Object.freeze({Board, LIMIT, HISTORY_LIMIT});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ColorBlocks = api;
})(globalThis);
