import db from '../utils/db.js';


export default {
    findAllCourse() {
        return db('course');
    },

    mostPopularInWeek(){
        return db('course').orderBy('STUNUM', 'desc').limit(3);
    },

    top10Popular() {
        return db('course').orderBy('VIEWED', 'desc').limit(10);
    },
    newCourse() {
        return db('course').orderBy('LASTUPDATE', 'desc').limit(10);
    },
    getAllCourseByCatID(id){
        return db('course').where('ID_CATE', id);
    },

}
