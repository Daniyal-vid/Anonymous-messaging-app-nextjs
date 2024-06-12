import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";
//it is a queery schema
//it will check that the usewrname which is coming has to fullfill the criteria of the usernamvalidation schema
const UsernameQuerySchema = z.object({
    username: usernameValidation
});
//the signup validation is done by us previously but in frontend side to prevent un nessary api calls we willl use this to chek the uniqueness and the validation of the username

export async function GET(request: Request){
    await dbConnect();

    try {
        //we are proving the zod checkup above no this is a function taht will proceed without an api call just a function call
        //we are getting the username from the url an dassigning it to the query params object then performing the zod validation 
       // these search paarms will come form the axios request 
        const {searchParams} = new URL(request.url);
        const queryParams ={
            username: searchParams.get("username"),

        };
        const result = UsernameQuerySchema.safeParse(queryParams);
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message:
                usernameErrors?.length > 0
                ? usernameErrors.join(',')
                :'Invalid query parfamerters'
            },
        {status:400})
        }

        //checking for the existing user

        const {username} = result.data;

        const existingVerifiedUser = await UserModel.findOne({
            username,
            isVerified: true,
        });
        if (existingVerifiedUser){
            return Response.json({
                success: false,
                message: 'Username is already taken',
            },
        {status:200})
        }
        
        return Response.json({
            success:true,
            message: 'Username is unique'
        },
    {status:200});
    } catch (error) {
        console.log("Error checking username:", error);
        return Response.json({
            success: false,
            message: "error checking username ",
        },
        {status:500}
            
        );
    }
}