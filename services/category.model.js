import db from "../utils/db.js";
export default {
    getTrendingCategory(id) {
        const sql=`select c.ID_CATE, CATENAME, sum(STUNUM) AS TOTALSTUNUM
                   from category join field f on f.ID_FIELD = category.ID_FIELD join course c on category.ID_CATE = c.ID_CATE
                   where f.ID_FIELD = 1
                   group by c.ID_CATE`;
        return db.raw(sql);
    },
}