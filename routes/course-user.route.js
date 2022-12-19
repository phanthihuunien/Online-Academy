


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

    const usercourse = await userCourseModel.getFeedbackWithCourseID(
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

    let top5 = [];
    top5 = await topCourseModel.findTop(course.ID_CATE);
    console.log(top5[0])






    res.render('vwCourse/detail', {
        course:course,
        realPrice,
        isDiscount,
        feedbackdata,
        top5

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