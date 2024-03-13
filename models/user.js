import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt"
import Jwt from "jsonwebtoken";

const schema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter Name"]
    },
    email:{
        type:String,
        required:[true,"Please Enter Email"],
        unique:[true,"Email Already Exists"],
        validate:validator.isEmail,
    },
    password:{
        type:String,
        required:[true,"Please Enter Password"],
        unique:[true,"Email Already Exists"],
        minLength:[6,"Password must be at least 6 characters long"],
       select:false
    },
    address:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    pincode:{
        type:Number,
        required:true
    },
    role:{
        type:String,
        enum:["admin", "user"]
    },
    avatar: {
        public_id: String,
        url: String,
      },
      otp: Number,
      otp_expire: Date,

})

schema.pre("save",async function( next ){
    if(!this.isModified("password")) next();
    this.password  = await bcrypt.hash(this.password,10);
 

})

schema.methods.comparePassword = async function (enteredPassword){
return await bcrypt.compare(enteredPassword,this.password)
}

schema.methods.generateToken = function (){
  return Jwt.sign({_id:this._id},process.env.Jwt_SECRET,{
    expiresIn: "15d"
   });
    }
export const User = mongoose.model("User",schema)