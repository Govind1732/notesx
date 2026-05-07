import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import dbConnect from "@/lib/db";
import { User } from "@/types";

type ApiHandlerContext = {
  user: User;
  params: any;
  supabase: any;
};

type ApiHandler = (
  request: NextRequest,
  context: ApiHandlerContext
) => Promise<NextResponse>;

import { z } from "zod";

export function withAuth(handler: ApiHandler) {
  return async (request: NextRequest, { params }: { params: any }) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await dbConnect();

      return await handler(request, { user: user as User, params, supabase });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation Error", details: error.issues },
          { status: 400 }
        );
      }
      
      console.error("API Error:", error);
      return NextResponse.json(
        { error: error.message || "Internal Server Error" },
        { status: error.status || 500 }
      );
    }
  };
}
