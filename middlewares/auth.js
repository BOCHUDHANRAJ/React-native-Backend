import ErrorHandler from "../utils/error.js";
import { User } from "../models/user.js";
import Jwt from "jsonwebtoken";
import { asyncError } from "./error.js";
//it will wnsure wheter user loged 
export const isAuthenticated = asyncError(
    async(req,res,next) =>{ 
        const { token } = req.cookies;
        if(!token) return next(new ErrorHandler("Not Logged In",401));
        
        const decodedData = Jwt.verify(token,process.env.JWT_SECRET);
        
        req.user = await User.findById(decodedData._id);
        next();
        }
);

export const isAdmin = asyncError(async (req, res, next) => {
    if (req.user.role !== "admin")
      return next(new ErrorHandler("Only Admin allowed", 401));
    next();
  });