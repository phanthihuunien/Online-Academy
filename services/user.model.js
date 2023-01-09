
import db from '../utils/db.js';
export default {
    async getCourseFromUser(id) {
        const list = await db('users').where('ID_USER', id);
        if (list.length === 0) {
            return null;
        }

        return list[0];
    },
    getAllUserByType(type) {
        return db('users').where('TYPE', type);
    },
    async countByUserType(type) {
        const list = await db('users')
            .where('TYPE', type)
            .count({ amount: 'ID_USER' });

        return list[0].amount;
    },

    findPageByType(type, limit, offset) {
        return db('users')
            .where('TYPE', type)
            .limit(limit)
            .offset(offset);
    },

    patch(user){
        const id = user.id;
        delete user.id;
        return db('users').where('ID_USER', id).update(user);

    }
}