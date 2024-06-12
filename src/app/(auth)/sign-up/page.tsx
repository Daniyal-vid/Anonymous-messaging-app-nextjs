//Debouncing is a technique in programming that helps prevent time-consuming tasks from being triggered so frequently that they slow down the performance of a web page
//it will be sued in our program for the zod validation calls to avoid accessive calls debouncing will hwlp to delay the setting variable and help in improving the performance 
'use client';

import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounceCallback } from 'usehooks-ts';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signUpSchema } from '@/schemas/signUpSchema';

//the react hook form is from the shadcn library 
export default function SignUpForm() {
    //the username usestate hook is used to check for the validation and passed through the debounce function
    const [username, setUsername] = useState('')
    const [usernameMessage, setUsernameMessage] = useState('')
    const [isCheckingusername, setIsCheckingUsername] = useState(false)
    const [IsSubmitting, setIsSubmitting] = useState(false)
   // in our usecase use debounce value was not working properly so we are using usedebounce callback
   //using callback hook value will aaygi hi late in the usernam e
    const debounced = useDebounceCallback(setUsername,300);
    const router = useRouter();
    const {toast}= useToast();
    //now here comes the zod implementation part here we will apply the sign up schema 
    //as seen in the docs of shadcn and rhf we have to Use the useForm hook from react-hook-form to create a form.
    const form = useForm<z.infer<typeof signUpSchema>>({
        //providing the resolver which is zod in this case 
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: '',
            email: '',
            password:'',
        }
    });
    //now we wwill use the use effect hook so that it will check the suernam ewhewneveer the useernname is changewd 
    useEffect(() => {
      const checkUsernameUnique= async () => {
        //if we got the username then if no error comes in the setting of username 
        //otherwise we will conserve resources by not execeuting 
        if (username){
            setIsCheckingUsername(true)
            setUsernameMessage('')
            try {
                const response = await axios.get(`/api/check-username-unique?username=${username}`);
                console.log(response);
                setUsernameMessage(response.data.message);
            } catch (error) {
              const axiosError = error as AxiosError<ApiResponse> ;//this type apiresponse is from the apiresponse template we have createed in the types
              setUsernameMessage(
                axiosError.response?.data.message ?? 'error checking username '
              );
            }
            finally{
              setIsCheckingUsername(false);
            }
        }
      };
      checkUsernameUnique();
    }, [username]);

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
      setIsSubmitting(true);
      //this function is deciciding what wil happen on submitting the form 
      try {
        console.log(data);
        //this data willl be given by the client or the suer to the reacthookform and itt willl pass in the onsubmit function
        const response = await axios.post(`/api/sign-up`, data);
        toast({
          title: "Success",
          description: response.data.message,
        });
        //on success it will replace the page by verification page 
        router.replace(`/verify/${username}`);
        setIsSubmitting(false);
      } catch (error) {
        console.error('Error during sign-up:', error);

      const axiosError = error as AxiosError<ApiResponse>;

      // Default error message
      let errorMessage = axiosError.response?.data.message;
      ('There was a problem with your sign-up. Please try again.');

      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      setIsSubmitting(false);
      }
    };

    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-800">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
              Join True Feedback
            </h1>
            <p className="mb-4">Sign up to start your anonymous adventure</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);
                      }}
                    />
                    {isCheckingusername && <Loader2 className="animate-spin" />}
                    {!isCheckingusername && usernameMessage && (
                      <p
                        className={`text-sm ${
                          usernameMessage === 'Username is unique'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {usernameMessage}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input {...field} name="email" />
                    <p className='text-muted text-gray-400 text-sm'>We will send you a verification code</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
  
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <Input type="password" {...field} name="password" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className='w-full' disabled={IsSubmitting}>
                {IsSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>
          </Form>
          <div className="text-center mt-4">
            <p>
              Already a member?{' '}
              <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
    
    
    
    
    
}