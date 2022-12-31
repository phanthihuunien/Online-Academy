import db from '../utils/db.js';

export default {
  async findAll() {
    return db('chapter');
  },

  async findById(id) {
    const list = await db('chapter').where('ID_CHAPTER', id);
    if (list.length === 0)
      return null;

    return list[0];
  },

  add(chapter) {
    return db('chapter').insert(chapter, ['ID_CHAPTER'])[0];
  },

  del(id) {
    return db('chapter').where('ID_CHAPTER', id).del();
  },

  patch(chapter) {
    const id = chapter.id;
    delete chapter.id;

    return db('chapter').where('ID_CHAPTER', id).update(chapter);
  }
}