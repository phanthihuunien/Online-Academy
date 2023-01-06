import db from '../utils/db.js';

export default {
   findAll() {
    return db('lesson');
  },

   async findById(id) {
    const list = await db('lesson').where('ID_LESSON', id);
    if (list.length === 0)
      return null;

    return list[0];
  },

 async findAllByChapterId(id) {
    const list = await db('lesson').where('ID_CHAPTER', id);
    if (list.length === 0)
      return null;

    return list;
  },

  add(lesson) {
    return db('lesson').insert(lesson);
  },

  del(id) {
    return db('lesson').where('ID_LESSON', id).del();
  },

  patch(lesson) {
    const id = lesson.id;
    delete lesson.id;

    return db('lesson').where('ID_LESSON', id).update(lesson);
  }
}