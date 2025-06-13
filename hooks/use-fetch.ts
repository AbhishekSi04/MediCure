"use client";

import { useState } from "react";
import { toast } from "sonner";

type OnboardingResponse = {
  success: boolean;
  redirect: string;
  message?: string;
};

export default function useFetch<T>(cb: (formData: FormData) => Promise<T>) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (formData: FormData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cb(formData);
      setData(response);
      // console.log("response in the usefetch is ",response);
      return response;
    } catch (err) {
      setError(err as Error);
      toast.error((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fn,
    setData,
  };
}