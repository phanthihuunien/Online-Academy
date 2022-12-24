import db from '../utils/db.js';
export default{
    async getFeedbackWithCourseID(id){
        const list =  await db('user_course').where('ID_COURSE',id);
        return list;


    },
    async findAllbyUserID(id){
        const list = await db('user_course').where('ID_USER',id);
        return list;
    },

}