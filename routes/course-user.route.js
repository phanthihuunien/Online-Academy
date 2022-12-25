


import courseModel from "../models/course.model.js";
import detailModel from "../models/detail.model.js"
import userCourseModel from '../models/user-course.model.js'
import userModel from '../models/user.model.js'
import topCourseModel from '../models/topCourse.model.js'
import express from 'express';


const router = express.Router();


router.get("/detail/:id", async function (req, res) {
    const courseID = req.params.id ||0;
    const course = await courseModel.findbyID(courseID);
    if (course === null) {
        return res.redirect("/");
    }





    //calculate discount price
    let realPrice = 0;
    let isDiscount = true;
    if (course.DISCOUNT === 0) {
        realPrice = course.PRICE;
        isDiscount = false;
    } else {
        let price = +course.PRICE,
            sale = +course.DISCOUNT;
        realPrice = price - (price * sale) / 100;
    }

    const usercourse = await userCourseModel.findAllbyCourseID(
        course.ID_COURSE
    );


    let feedbackdata = [];
    for (let feedback of usercourse) {
        let user = await userModel.findbyID(feedback.ID_USER);

        feedbackdata.push({
            feedback,
            user,
        });
    }

    let rate =0;
    let num =0;

    for (let ratestar of usercourse){
        rate+=ratestar.RATE;
        num+=1;
    }
    if(num ==0){
        rate =0;
    }
    else{
        rate = rate*1.0/num
    }
    course.RATE = rate;
    course.RATENUM = num;




    let instructor = await userModel.findbyID(course.ID_USER);









    let top5 = [];

    const top55 = await topCourseModel.findTop(course.ID_CATE,courseID);
    for(let top555 of top55){

        top5.push({top555})
    }










    res.render('vwCourse/detail', {
        course:course,
        realPrice,
        isDiscount,
        feedbackdata,
        top5,
        rate,
        instructor,
        num

    });
});

router.get("/detail/:id_course/:id_detail", async function (req, res) {
    const courseID = req.params.id_course ||0;
    const detailID = req.params.id_detail ||0
    const detail = await detailModel.findbyID(courseID,detailID);
    if (detail === null) {
        return res.redirect("/");
    }
    res.render('vwCourse/lesson', {
        detail


    });
});






export default router;