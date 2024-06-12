import mongoose, {Schema,Document, Mongoose} from "mongoose";
// now we will creatd ean interface for defining the types of different paramets we are going to work with all this isneeded in typescript

export interface Message extends Document{
    content: string;
    createdAt: Date;
}
//creating the message schema for database modeling or structure
const MessageSchema: Schema<Message> = new Schema({
    content:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        required: true ,
        default: Date.now
    }
})

export interface User extends Document{
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    messages: Message[]
}

const UserSchema: Schema<User> = new Schema({
    username:{
        type: String,
        required: [true, "username is required"],
        trim: true,
        unique:true

    },
    email:{
        type: String,
        required: [true, "email is required"] ,
        unique: true,
        match : [/.+\@.+\..+/,"please use a valid email"]
    },
    password:{
        type: String,
        required:[true, "Password is required"],
    },
    verifyCode:{
        type: String,
        required: [true,"verifycode is required "]
    },
    verifyCodeExpiry:{
        type: Date,
        required: [true,"verifycode expiry is required "]
    },
    isVerified:{
        type: Boolean,
        default: false,
    },
    isAcceptingMessages:{
        type: Boolean,
        default: false,
    },
    messages:[MessageSchema]

})

const UserModel = (mongoose.models.User as mongoose.Model<User>) ||   mongoose.model<User>('User', UserSchema);

export default UserModel;