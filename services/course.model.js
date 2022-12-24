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
}
//     allViewDes() {
//         return db.load(
//             `select * from ${TABLE_NAME} where ISDISABLE = 0 order by viewed desc limit 4`
//         );
//     },
//
//     allDateDes() {
//         return db.load(
//             `select * from ${TABLE_NAME} where ISDISABLE = 0 order by LASTUPDATE desc limit 4`
//         );
//     },
// export default{
//     async findTop(id){
//         const list = await db('course').where('ID_CATE',id).orderBy('STUNUM', 'desc')
//
//         if(list.length === 0){
//
//             return null;
//         }
//         if(list.length <=5){
//             //console.log(list.length)
//             // console.log(list[0])
//             return list;
//         }
//         const lists = [];
//         lists.push(list[0])
//         lists.push(list[1])
//         lists.push(list[2])
//         lists.push(list[3])
//         lists.push(list[4])
//
//         return lists;
//
//     }
//
//
// }