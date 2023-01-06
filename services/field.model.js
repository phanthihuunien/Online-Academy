import db from "../utils/db.js";
import knex from "knex";
export default {
    async getTrendingField() {
        // const sql=`select f.ID_FIELD, FIELDNAME,  sum(STUNUM) AS TOTALSTUNUM
        //            from category join field f on f.ID_FIELD = category.ID_FIELD join course c on category.ID_CATE = c.ID_CATE
        //            group by f.ID_FIELD`;
        //return db.raw(sql);
        const list = knex.select('field.ID_FIELD', 'field.FIELDNAME', db.raw('SUM(STUNUM) AS TOTALSTUNUM')).from('category')
            .join('field', 'field.ID_FIELD','category.ID_FIELD')
            .join('course', 'course.ID_CATE', 'category.ID_CATE').groupByRaw('field.ID_FIELD')

        //     .sum({TOTALSTUNUM: 'STUNUM'}).groupBy('field.ID_FIELD');
        //
        // knex.select('username', db.raw('SUM(units) AS sum_units'), db.raw('SUM(cases) AS sum_cases') )
        //     .from('my_table').groupByRaw('username')
        if(list.length === 0){
            return null;
        }
        return list;
    },
}