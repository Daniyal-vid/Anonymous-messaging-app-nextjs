//we are creating this route to toggle wheteher the user is accepting messages or not it will handle both post and get request
//the post request will toggle the accepting tru and false
//get reuqest will handle the info about the statust of acceptance 
import {getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
export async function POST(request: Request) {
    await dbConnect();
    //getting the sesssion from the nextauth
    //putting await is imp here as it is fetching datra from somewhere else otherwise it will show promise error 
    const session = await getServerSession(authOptions);
    const user: User = session?.user
    //checking whether the user is fetched or not
    if(!session || !session.user ){
        return Response.json({
            success: false,
            message: "not autheticated"
        },
    {status:401});
    }
    //if you got the user then get the user id
    const userId = user._id;
    //getting the parameters from the client in the request according to which we can proceed 
    const {acceptMessages} = await request.json();
    try {
        //updating the user
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessages: acceptMessages},
            {new:true}
        );
        if(!updatedUser){
            // User not found
      return Response.json(
        {
          success: false,
          message: 'Unable to find user to update message acceptance status',
        },
        { status: 404 }
      ); 
        }
        return Response.json({
            success:true,
            message: "Message acceptance status updated successfully"
        },
    {status:200})
        
    } catch (error) {
        console.error('Error updating message acceptance status:', error);
    return Response.json(
      { success: false, message: 'Error updating message acceptance status' },
      { status: 500 }
    )
        
    }
    
}

export async function GET(request:Request) {
    await dbConnect();
    // Get the user session
  const session = await getServerSession(authOptions);
  const user = session?.user;

  // Check if the user is authenticated
  if (!session || !user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }
  try {
    const foundUSer = await UserModel.findById(user._id);
    if(!foundUSer){
        return Response.json(
            { success: false, message: 'User not found' },
            { status: 404 }
          );
    }
    // Return the user's message acceptance status
    return Response.json({
        success:true,
        isAcceptingMessages : foundUSer.isAcceptingMessages
    },
{status:200});
    
} catch (error) {
    console.error("error retreiving the current acceptance state of the user ")
    return Response.json({
        success:false,
        message:"error retrieving the acceptance state "
    },
{status:500});
  }
    
}