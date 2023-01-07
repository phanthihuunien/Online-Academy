import express from 'express';
import userModel from "../services/user.model.js";
const router = express.Router();
router.get('/manageStudent', async function(req, res) {
    const studentList = await userModel.getAllUserByType(3);
    console.log(studentList);
    res.render('vwAdmin/user/studentList',{
        students: studentList
    });
})
router.get('/manageInstructor', async function(req, res) {

    res.render('vwAdmin/user/instructorList',{


    });
})
router.get('/manageCourse', async function(req, res) {

    res.render('vwAdmin/course/courseList',{


    });
})
export default router;