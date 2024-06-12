//this file is to fetch the messages taht are send to a user in this anonymous messaging app 
//we will use aggregate pipeline to fetch the messages according to the date created and the content
import {getServerSession } from "next-auth/next";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import mongoose from "mongoose";
//this part is same as all the previous post and get request functions 
export async function GET(request:Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const _user: User = session?.user;
  
    if (!session || !_user) {
      return Response.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    const userId = new mongoose.Types.ObjectId(_user._id);
    try {//we wiil use mongodb aggregation for the retrivel of the messages
        // Aggregation in MongoDB allows for the transforming of data and results in a more powerful fashion than from using the find() command. 
        // Through the use of multiple stages and expressions, you are able to build a "pipeline" of operations on your data to perform analytic operations.
        const user = await UserModel.aggregate([
            {$match: {_id: userId}},
            {$unwind: '$messages'},
            {$sort: {'messages.createdAt': -1}},
            //the below line groups the documents by their id feildand accumulates or create a new array with messages only with the id passed
            //for example   { "_id": 1, "messages": ["Hello", "Hi"] },
            {$group: {_id: '$_id', messages:{$push:'$messages'}}},
        ]).exec();
        //if by chance there is no user found in the above steps so before displaying we will check 
        if (!user || user.length === 0) {
            return Response.json(
              { message: 'User not found here', success: false },
              { status: 404 }
            );
          }
        //   returning the response 
      
          return Response.json(
            { messages: user[0].messages },
            {
              status: 200,
            }
          );

        
    } catch (error) {
        console.error('An unexpected error occurred:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
    }


}