import db from '../utils/db.js';

export default {
  findAll() {
    return db('course');
  },

  async findById(id) {
    const list = await db('course').where('ID_COURSE', id);
    if (list.length === 0)
      return null;

    return list[0];
  },
  
    async findAllByFieldId(id) {
    const list = await db('course').where('ID_FIELD', id);
    if (list.length === 0)
      return null;

    return list;
  },

async findAllByCatergoryId(id) {
    const list = await db('course').where('ID_CATE', id);
    if (list.length === 0)
      return null;

    return list;
  },
  
  add(course) {
    return db('course').insert(course, ['ID_COURSE'])[0];
  },

  del(id) {
    return db('course').where('ID_COURSE', id).del();
  },

  patch(course) {
    const id = course.id;
    delete course.id;

    return db('course').where('ID_COURSE', id).update(course);
  }
}