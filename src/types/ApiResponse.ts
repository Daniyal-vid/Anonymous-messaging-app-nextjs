import { Message } from "@/model/User";
//we are making this standerdized api response such that we can reuse it where ever we want to send api response
// just pass data and get the response 
export interface ApiResponse{
    success: boolean;
    message: string;
    isAcceptingMessages?: boolean;
    messages?: Array<Message>
}
