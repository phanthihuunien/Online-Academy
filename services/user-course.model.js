import db from "../utils/db.js";
export default {
    getAvgRateByCourseId(id) {
        const sql=`select avg(c.RATE) as RATE
                   from user_course as c
                    where c.ID_COURSE = ${id}
                    
                    group by c.ID_COURSE`;
        return db.raw(sql);
    },
}