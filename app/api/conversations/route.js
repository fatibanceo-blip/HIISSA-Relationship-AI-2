import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function createAuthenticatedSupabase(request) {
  const authHeader =
    request.headers.get("authorization");

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return null;
  }

  const accessToken =
    authHeader.slice(7).trim();

  if (!accessToken) {
    return null;
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(
    supabaseUrl,
    supabaseKey,
    {
      global: {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

async function getAuthenticatedUser(
  supabase
) {
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
    const supabase =
      createAuthenticatedSupabase(
        request
      );

    const user =
      await getAuthenticatedUser(
        supabase
      );

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } =
      await supabase
        .from("conversations")
        .select(
          "id, title, created_at, updated_at, last_message_at, archived_at, deleted_at"
        )
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("last_message_at", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "HIISSA conversations GET failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to load conversations.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      conversations: data ?? [],
    });
  } catch (error) {
    console.error(
      "HIISSA conversations GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load conversations.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabase =
      createAuthenticatedSupabase(
        request
      );

    const user =
      await getAuthenticatedUser(
        supabase
      );

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const rawTitle =
      typeof body?.title === "string"
        ? body.title.trim()
        : "";

    const title = rawTitle
      ? rawTitle.slice(0, 120)
      : null;

    const now =
      new Date().toISOString();

    const { data, error } =
      await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title,
          updated_at: now,
          last_message_at: now,
        })
        .select(
          "id, title, created_at, updated_at, last_message_at, archived_at, deleted_at"
        )
        .single();

    if (error) {
      console.error(
        "HIISSA conversation POST failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to create conversation.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { conversation: data },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "HIISSA conversation POST error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create conversation.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const supabase =
      createAuthenticatedSupabase(
        request
      );

    const user =
      await getAuthenticatedUser(
        supabase
      );

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url =
      new URL(request.url);

    let conversationId =
      url.searchParams.get(
        "conversationId"
      );

    if (!conversationId) {
      try {
        const body =
          await request.json();

        conversationId =
          body?.conversationId;
      } catch {
        conversationId = null;
      }
    }

    if (
      typeof conversationId !==
        "string" ||
      !conversationId.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "conversationId is required.",
        },
        { status: 400 }
      );
    }

    const now =
      new Date().toISOString();

    const { data, error } =
      await supabase
        .from("conversations")
        .update({
          deleted_at: now,
          updated_at: now,
        })
        .eq(
          "id",
          conversationId.trim()
        )
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .select("id")
        .maybeSingle();

    if (error) {
      console.error(
        "HIISSA conversation DELETE failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to delete conversation.",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "Conversation not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      deleted: true,
      conversationId: data.id,
    });
  } catch (error) {
    console.error(
      "HIISSA conversation DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to delete conversation.",
      },
      { status: 500 }
    );
  }
}
