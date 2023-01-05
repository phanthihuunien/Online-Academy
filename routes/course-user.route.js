


import courseModel from "../models/course.model.js";
import detailModel from "../models/detail.model.js"
import userCourseModel from '../models/user-course.model.js'
import userModel from '../models/user.model.js'
import topCourseModel from '../models/topCourse.model.js'
import chapterModel from '../models/chapter.model.js'
import lessonModel from '../models/lesson.model.js'
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



    //display feebback
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






    // display chapter
    const chapter = await chapterModel.findbyIDCourse(courseID);
    let chapterdata = [];
    let lessondata = [];
    let chapternum=0;
    let lexxx =[];
    let data = []
    for(let chapters of chapter) {
             data = await chapterModel.findbyID(chapters.ID_CHAPTER);
        chapterdata.push({
            data,
        })

        chapternum = chapters.ID_CHAPTER;
        let lesson = await lessonModel.findbyIDChapter(chapternum);
        lexxx.push(
            lesson,
        );

        }

    let numles =0;
    for( let lessons of lexxx){
        let datales  = lexxx[numles];

        for(let les of datales){
            let lestt = await lessonModel.findbyID(les.ID_LESSON);

            lessondata.push({
                lestt,
            });


        }


      //  data['LESSON'] = lessondata;

        numles++;








    }








//display rate and ratenum
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



//find instructor
    let instructor = await userModel.findbyID(course.ID_USER);








//display top 5 course
    let top5 = [];

    const top55 = await topCourseModel.findTop(course.ID_CATE,courseID);
    for(let top555 of top55){

        top5.push({top555})
    }

    //kiểm tra xem loggin user đã mua khóa học  hay chưa
    let isBought = false;
    // if (req.session.isLogin) {
    //     const order = await findbyUserCourse(courseID,req.session.loggedinUser.ID_USER);
    //     if (order.length === 0) {
    //     } else {
    //         isBought = true;
    //     }
    // }







//render view
    res.render('vwCourse/detail', {
        course:course,
        realPrice,
        isDiscount,
        feedbackdata,
        top5,
        rate,
        instructor,
        num,
        chapterdata,
        lessondata,
        isBought,
      //  isLogin: req.session.isLogin,




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