import express from 'express';
import courseModel from "../services/course.model.js";
import userModel from "../services/user.model.js";
import userCourseModel from "../services/user-course.model.js";
import categoryModel from "../services/category.model.js";
import fieldModel from "../services/field.model.js"
const router = express.Router();
router.get('/', async function(req, res) {
    const listPplCourse = await courseModel.mostPopularInWeek();
    let listTop10 = await courseModel.top10Popular();
    const newCourseList = await courseModel.newCourse();
    //const mostTrendingCat = await categoryModel.getTrendingCategory(1);
    const mostTrendingField = await fieldModel.getTrendingField();
   console.log(mostTrendingField);
    const items = [];
    const items2 = [];
    const items3 = [];

    for (let course of listTop10) {
        let instructor = await userModel.getCourseFromUser(course.ID_USER);
        let rate= await userCourseModel.getAvgRateByCourseId(course.ID_COURSE);
        let courseRate = null;
        if(rate === null){
            courseRate = 0;
            console.log("========");
        }else{
            courseRate = parseFloat(rate).toFixed(1);
        }

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
        let rate= await userCourseModel.getAvgRateByCourseId(course.ID_COURSE);
        let courseRate = null;
        if(rate === null){
            courseRate = 0;
        }else{
            courseRate = parseFloat(rate).toFixed(1);
        }
        items2.push({
            course,
            instructor,
            courseRate,
        });
    }
    for (let field of mostTrendingField) {
        //console.log("++++" + field[0]);
        // const mostTrendingCat = await categoryModel.getTrendingCategory(field.ID_FIELD);
        // const mostTrendingCate = mostTrendingCat[0];
        // console.log("====" + mostTrendingCate);
        // items3.push({
        //     field,
        //     mostTrendingCate,
        // });
    }
    res.render('vwHomePage/homePage',{
        pplCourse: listPplCourse,
        top10: items,
        newCourseList: items2,
        //mostTrendingFields: items3,
        empty: listPplCourse === 0

    });

})
export default router;
