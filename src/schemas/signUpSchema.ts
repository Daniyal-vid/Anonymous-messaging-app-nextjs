//zod is used for input validation or form validation inspite we are using mongoose it can validate the whole data but avoid full data error we can avoid this by ensuring the errors on the run time 
// this one is for username validation only
import {z} from "zod"
export const usernameValidation = z
    .string()
    .min(2, "Username must be atleast 2 char ")
    .max(20, "usernam ecant be moere  than 20")
    .regex(/^[a-zA-Z0-9_]+$/, 'Username must not contain special characters');

//this one is for the full signup validation 
export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: "invalid email addres"}),
    password: z.string()
    .min(6, {message: 'password must be at leadt 6 characters'})

});