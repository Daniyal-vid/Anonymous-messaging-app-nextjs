import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import UserModel from "@/model/User";

export async function DELETE(request:Request,
    {params}:{params:{messageid:string}}
) { //thesse params are from the axios request 
    const messageId = params.messageid;
    await dbConnect();
    const session = await getServerSession(authOptions);
    const _user = session?.user;
    if (!session || !_user) {
        return Response.json(
          { success: false, message: 'Not authenticated' },
          { status: 401 }
        );
    }

    try {
        //$pull request will be used from mongo docs to delete from an existing array
        const updateResult = await UserModel.updateOne(
            { _id: _user._id },
            { $pull: { messages: { _id: messageId } } }
        )
        if (updateResult.modifiedCount === 0) {
            return Response.json(
              { message: 'Message not found or already deleted', success: false },
              { status: 404 }
            );
          }
      
          return Response.json(
            { message: 'Message deleted', success: true },
            { status: 200 }
          );
    } catch (error) {
        console.error('Error deleting message:', error);
    return Response.json(
      { message: 'Error deleting message', success: false },
      { status: 500 }
    );
    }


}