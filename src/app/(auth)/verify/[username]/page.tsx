"use client"
import { useToast } from "@/components/ui/use-toast";
import { verifySchema } from "@/schemas/verifySchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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


export default function VerifyAccount() {
    const router = useRouter();
    const params = useParams<{username: string}>();
    const {toast} = useToast();
    //implementing zod schema 
    const form = useForm<z.infer<typeof verifySchema>>({
        resolver : zodResolver(verifySchema),
    });
    //now creating on sub,it in genral for all forms taht have to make the api calls onsubmit button contains the axios or fetch commands
    const onSubmit =  async  (data:z.infer<typeof verifySchema>) => {
        try {
          //here the code which is coming from the data is from the react hook form 
          const response = await axios.post(`/api/verify-code`, {username: params.username,code: data.code})
          //sending the confirmatiobn on success
          toast({
            title: 'Success',
            description: response.data.message,
          });
          router.replace('/sign-in')
            
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          toast({
            title: 'Verification Failed',
            description:
              axiosError.response?.data.message ??
              'An error occurred. Please try again.',
            variant: 'destructive',
          });
        }
        
    };
    return(
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Verify</Button>
          </form>
        </Form>
      </div>
    </div>
    )
}