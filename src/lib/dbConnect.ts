import mongoose from "mongoose";
// defining a type for database object just for clarification 
type ConnectionObject = {
    isConnected?: number;
};
//now defining the connection object and using the type defined above 
const connection : ConnectionObject = {};

async function dbConnect(): Promise<void> {
    if (connection.isConnected){
        console.log("already connected to the database");
        return
    }
    try {
        //connecting to the database if not already connected
        const db = await mongoose.connect(process.env.MONGO_URI || '', {});
        connection.isConnected = db.connections[0].readyState;

        console.log("database connected successfully");
        
    } catch (error) {
        console.log("Database connection failed here", error);
        //gracefull exit from the block in case of error 
        process.exit(1);
        
    }

}
export default dbConnect;