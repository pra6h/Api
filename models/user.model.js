import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
     phoneNumber:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['student','recruiter','superadmin'], 
        required:true
    },
    isApproved: {
        type: Boolean,
        default: function () {
          return this.role === 'recruiter' ? false : true;
        }
    },
    profile:{
        bio:{type:String},
        skills:[{type:String}],
        resume:{type:String}, // url to resume file
        resumeOriginalName:{type:String},
        company:{type:mongoose.Schema.Types.ObjectId, ref:'Company'},
        profilePhoto:{
            type:String,
            default:""
        }
    },
    college: {
         type: String
         },
    degree: { 
        type: String 
    },
    graduationYear: { 
        type: Number 
    },
    
},{timestamps:true});
 export const User = mongoose.model('User',userSchema);