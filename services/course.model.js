import db from '../utils/db.js';


export default {
    findAllCourse() {
        return db('course');
    },

    mostPopularInWeek(){
        return db('course').orderBy('STUNUM', 'desc').limit(3);
    },
    mostPopular(){
        return db('course').orderBy('STUNUM', 'desc').limit(7);
    },

    top10Popular() {
        return db('course').orderBy('VIEWED', 'desc').limit(10);
    },
    newCourse() {
        return db('course').orderBy('LASTUPDATE', 'desc').limit(5);
    },
    getAllCourseByCatID(id){
        return db('course').where('ID_CATE', id);
    },
    async countByAllCourse() {
        const list = await db('course')
            .count({ amount: 'ID_COURSE' });

        return list[0].amount;
    },

    findPageOfCourse(limit, offset) {
        return db('course')
            .limit(limit)
            .offset(offset);
    },

}
