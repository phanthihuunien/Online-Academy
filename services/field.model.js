import db from "../utils/db.js";
export default {
     getTrendingField() {
        const sql=`select f.ID_FIELD, FIELDNAME,  sum(STUNUM) AS TOTALSTUNUM
                   from category join field f on f.ID_FIELD = category.ID_FIELD join course c on category.ID_CATE = c.ID_CATE
                   group by f.ID_FIELD`;
        return db.raw(sql);
        // const list = await db('category')
        //     .join('field', 'field.ID_FIELD','category.ID_FIELD')
        //     .join('course', 'course.ID_CATE', 'category.ID_CATE')
        //     .sum({TOTALSTUNUM: 'STUNUM'}).groupBy('field.ID_FIELD');
        // if(list.length === 0){
        //     return null;
        // }
        // return list;
    },
}