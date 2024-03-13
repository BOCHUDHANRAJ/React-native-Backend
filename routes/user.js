import express from "express";
import {updateProfile, getMyProfile, logOut, login, signup, changePassword, updatePic, forgetpassword, resetpassword } from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/login", login); 


router.post("/register",singleUpload, signup);
router.get("/me",isAuthenticated, getMyProfile);
router.get("/logout",isAuthenticated, logOut);

//updating routes
router.put("/updateprofile",isAuthenticated, updateProfile); 
router.put("/changepassword",isAuthenticated, changePassword);  
router.put("/updatepic",isAuthenticated,singleUpload, updatePic);   

//forgotpassword and reset password
router.route("/forgetpassword").post(forgetpassword).put(resetpassword);//we are using 2 methods here


export default router;