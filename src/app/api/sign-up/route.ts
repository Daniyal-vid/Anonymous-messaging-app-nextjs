import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
//all these kind of request are post request
export async function POST(request: Request){
    await dbConnect(); //await as dbconnection is importatnt to proceed

    try {
        const {username,email,password} = await request.json(); //this data is coming from the api request
        //this is to check if the user is existing and plus he is verified too
        const existingVerifiedUserByUsername = await UserModel.findOne({
            username,
            isVerified: true,
          });

        if (existingVerifiedUserByUsername){
            return Response.json({
                success: false,
                message: "Username is already taken",
            },
        {status: 400}
        );
        }
        const existingUserByEmail = await UserModel.findOne({email})
        let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if(existingUserByEmail){
            if (existingUserByEmail.isVerified) {
                return Response.json(
                  {
                    success: false,
                    message: 'User already exists with this email',
                  },
                  { status: 400 }
                );
              } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserByEmail.save();
              }
            }

        
        else{
            //creating a hashed password if the user in new
            const hashedPassword = await bcrypt.hash(password,10);
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours()+1)

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                //it is false by default because there is a possibility of the case that the user is in the database but donot verified
                isVerified: false,
                isAcceptingMessages: true,
                messages: [],
              });
              await newUser.save();
        }
        // Send verification email
    const emailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode
      );
      if (!emailResponse.success) {
        return Response.json(
          {
            success: false,
            message: emailResponse.message,
          },
          { status: 500 }
        );
      }
      return Response.json(
        {
          success: true,
          message: 'User registered successfully. Please verify your account.',
        },
        { status: 201 }
      );



    } catch (error) {
        console.error('Error registering user:', error);
    return Response.json(
      {
        success: false,
        message: 'Error registering user',
      },
      { status: 500 }
    );
        
    }

}