export interface Doctor {
    id: string;
    clerkUserId:string;
    name: string | null;
    email: string;
    specialty: string | null;
    experience: number | null;
    credentialUrl: string | null;
    description: string | null;
    verificationStatus: "PENDING" | "VERIFIED" | "REJECTED" | null;
    createdAt: string | Date;
    imageUrl: string | null;
  }
  