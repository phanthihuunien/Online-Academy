import express from 'express';
import courseModel from "../services/course.model.js";
import userModel from "../services/user.model.js";
const router = express.Router();
router.get('/', async function(req, res) {
    const listPplCourse = await courseModel.mostPopularInWeek();
    // const  = await courseModel.top10PopularInWeek();
    let listTop10 = await courseModel.top10Popular();
    const newCourseList = await courseModel.newCourse();
    const items = [];
    for (let course of listTop10) {
        let instructor = await userModel.getCourseFromUser(course.ID_USER);
        items.push({
            course,
            instructor
        });
    }
    res.render('vwHomePage/homePage',{
        pplCourse: listPplCourse,
        top10: items,
        newCourseList: newCourseList,
        empty: listPplCourse === 0

    });

})
export default router;
