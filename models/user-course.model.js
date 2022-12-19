import db from '../utils/db.js';
export default{
    getFeedbackWithCourseID(id){
        const list =  db('user_course').where('ID_COURSE',id);


        return list;


    }

}