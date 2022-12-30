import express from 'express';
import courseModel from "../services/course.model.js";
import userModel from "../services/user.model.js";
import userCourseModel from "../services/user-course.model.js";
const router = express.Router();
router.get('/', async function(req, res) {
    const listPplCourse = await courseModel.mostPopularInWeek();
    // const  = await courseModel.top10PopularInWeek();
    let listTop10 = await courseModel.top10Popular();
    const newCourseList = await courseModel.newCourse();

    const items = [];
    const items2 = [];
    for (let course of listTop10) {
        let instructor = await userModel.getCourseFromUser(course.ID_USER);
        let raw= await userCourseModel.getAvgRateByCourseId(course.ID_COURSE);
        const courseRate = parseFloat(raw[0][0].RATE).toFixed(1);
        let bestSeller;
        for(let c of listPplCourse){
            if(course.STUNUM >= c.STUNUM){
                bestSeller = 1;
                break;
            }
            bestSeller = 0;
        }
        items.push({
            course,
            instructor,
            courseRate,
            bestSeller,
        });
    }
    for (let course of newCourseList) {
        let instructor = await userModel.getCourseFromUser(course.ID_USER);
        let raw= await userCourseModel.getAvgRateByCourseId(course.ID_COURSE);
        const courseRate =  parseFloat(raw[0][0].RATE).toFixed(1);
        items2.push({
            course,
            instructor,
            courseRate,
        });
    }
    res.render('vwHomePage/homePage',{
        pplCourse: listPplCourse,
        top10: items,
        newCourseList: items2,
        empty: listPplCourse === 0

    });

})
export default router;
