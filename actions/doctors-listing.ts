// get doctors by speciality 
"use server"

import { db } from "@/lib/prisma";

export async function getDoctorsBySpecialty(speciality: string) {
    try {
        const doctors = await db.user.findMany({
            where: {
                role: "DOCTOR",
                verificationStatus: "VERIFIED",
                specialty: speciality.split("%20").join(" "),
            }
        });
        return {doctors,error:null};
    }
    catch(error){
        console.log("error in getting doctors by speciality",error);
        return {doctors:null,error:error};
    }
}