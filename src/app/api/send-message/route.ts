//if you forgot why we alaways create the file named route.ts 
// it is for the api request to be executed if any api request is fired on this folder it will directly exceutes the functions writtenin the route.ts of the folder 
//now coming to this route this for the send message to the user by another user 
//like sendiing message to user1 at the id of user 2
//we will fetch or get the content from the request made by the client and then find the user then push it in the message array of the username 
import UserModel from '@/model/User';
import dbConnect from '@/lib/dbConnect';
import { Message } from '@/model/User';

export async function POST(request:Request) {
    await dbConnect();
    const {username, content} = await request.json();
    try {
        const user = await UserModel.findOne({username}).exec();
        if(!user){
            return Response.json({
                success: false,
                message: "USer not found"
            },
        {status:404});
        }
        if(!user.isAcceptingMessages){
            return Response.json({
                success:false,
                message:'user is not accepting messages'
            },{status:403});
        }
        const newMessage = {content, createdAt: new Date()};

        //push the new message to the users message array
        user.messages.push(newMessage as Message);
        await user.save();
        
        return Response.json(
            { message: 'Message sent successfully', success: true },
            { status: 201 }
          );
    } catch (error) {
        console.error('Error adding message:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
    }
}