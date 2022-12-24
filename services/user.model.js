
import db from '../utils/db.js';
export default {
    async getCourseFromUser(id) {
        const list = await db('users').where('ID_USER', id);
        if (list.length === 0) {
            return null;
        }

        return list[0];
    },
}