// this tellme the user is logged in through clerk and presnt in the database or not
'use server'

import { currentUser } from "@clerk/nextjs/server"
import { db } from "./prisma";

export const checkUser = async () => {
        const user = await currentUser();

        console.log(user);
        if(!user) {
            return {
                error: "User not found"
            }
        }
        
        try {
                const loggedInUser = await db.user.findUnique({
                    where: {
                        clerkUserId: user.id
                    },
                    select: {
                        id:true
                    },
                })
                if(loggedInUser) {
                    return loggedInUser
                }
                // if not exist so create a new user
                const name = user.firstName + " " + user.lastName;
                const newUser = await db.user.create({
                    data: {
                        clerkUserId: user.id,
                        name,
                        email: user.emailAddresses[0].emailAddress,
                        transactions:{
                                create:{
                                        type:"CREDIT_PURCHASE",
                                        packageId:"free_user",
                                        amount:2,
                                }
                        }
                    }
                })
                return newUser;

        } catch (error) {
                console.log("Error in checkUser", error);
                return {
                    error: "Internal server error"
                }
        }
}
