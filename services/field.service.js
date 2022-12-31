import db from '../utils/db.js';

export default {
  async findAll() {
    return db('fields');
  },

  async findById(id) {
    const list = await db('fields').where('ID_FIELD', id);
    if (list.length === 0)
      return null;

    return list[0];
  },

  add(field) {
    return db('fields').insert(field);
  },

  del(id) {
    return db('fields').where('ID_FIELD', id).del();
  },

  patch(field) {
    const id = field.id;
    delete field.id;

    return db('fields').where('ID_FIELD', id).update(field);
  }
}