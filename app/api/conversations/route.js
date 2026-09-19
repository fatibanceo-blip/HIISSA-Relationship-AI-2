import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function createAuthenticatedSupabase(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

async function getAuthenticatedUser(supabase) {
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function GET(request) {
  try {
    const supabase = createAuthenticatedSupabase(request);
    const user = await getAuthenticatedUser(supabase);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("conversations")
      .select(
        "id, title, created_at, updated_at, last_message_at, archived_at, deleted_at"
      )
      .is("deleted_at", null)
      .order("last_message_at", {
        ascending: false,
        nullsFirst: false,
      })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("HIISSA conversation load failed:", error);

      return NextResponse.json(
        { error: "Unable to load conversations." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      conversations: data ?? [],
    });
  } catch (error) {
    console.error("HIISSA conversation GET error:", error);

    return NextResponse.json(
      { error: "Unable to load conversations." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabase = createAuthenticatedSupabase(request);
    const user = await getAuthenticatedUser(supabase);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const title =
      typeof body?.title === "string" && body.title.trim()
        ? body.title.trim().slice(0, 300)
        : null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title,
      })
      .select(
        "id, title, created_at, updated_at, last_message_at, archived_at, deleted_at"
      )
      .single();

    if (error) {
      console.error("HIISSA conversation creation failed:", error);

      return NextResponse.json(
        { error: "Unable to create conversation." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        conversation: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("HIISSA conversation POST error:", error);

    return NextResponse.json(
      { error: "Unable to create conversation." },
      { status: 500 }
    );
  }
}
