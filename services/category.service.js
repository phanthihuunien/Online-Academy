import db from '../utils/db.js';

export default {
  findAll() {
    // const category = { CatID: 1, CatName: 'Laptop' };
    return db('categories');
  },

  async findById(id) {
    const list = await db('categories').where('CatID', id);
    if (list.length === 0)
      return null;

    return list[0];
  },

  add(newCategory) {
    // list.push(newCategory);
    return db('categories').insert(newCategory);
  },

  del(id) {
    return db('categories').where('CatID', id).del();
  },

  patch(category) {
    const id = category.CatID;
    delete category.CatID;

    return db('categories').where('CatID', id).update(category);
  }
}