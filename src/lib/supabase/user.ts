import { cache } from "react";
import { createClient } from "./server";

/** The signed-in user for this request (one Supabase call, shared by layout and page). */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
