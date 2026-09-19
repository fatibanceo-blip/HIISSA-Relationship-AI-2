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

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("messages")
      .select(
        "id, conversation_id, role, original_content, created_at, client_created_at, language_code, locale"
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("HIISSA message load failed:", error);

      return NextResponse.json(
        { error: "Unable to load messages." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: data ?? [],
    });
  } catch (error) {
    console.error("HIISSA message GET error:", error);

    return NextResponse.json(
      { error: "Unable to load messages." },
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

    const conversationId =
      typeof body?.conversationId === "string"
        ? body.conversationId.trim()
        : "";

    const role =
      body?.role === "user" || body?.role === "assistant"
        ? body.role
        : null;

    const originalContent =
      typeof body?.originalContent === "string"
        ? body.originalContent
        : "";

    const clientCreatedAt =
      typeof body?.clientCreatedAt === "string" &&
      body.clientCreatedAt.trim()
        ? body.clientCreatedAt.trim()
        : null;

    const languageCode =
      typeof body?.languageCode === "string" &&
      body.languageCode.trim()
        ? body.languageCode.trim().slice(0, 35)
        : null;

    const locale =
      typeof body?.locale === "string" && body.locale.trim()
        ? body.locale.trim().slice(0, 50)
        : null;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required." },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { error: "A valid message role is required." },
        { status: 400 }
      );
    }

    if (!originalContent.trim()) {
      return NextResponse.json(
        { error: "Message content is required." },
        { status: 400 }
      );
    }

    const { data: conversation, error: conversationError } =
      await supabase
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role,
        original_content: originalContent,
        client_created_at: clientCreatedAt,
        language_code: languageCode,
        locale,
      })
      .select(
        "id, conversation_id, role, original_content, created_at, client_created_at, language_code, locale"
      )
      .single();

    if (error) {
      console.error("HIISSA message save failed:", error);

      return NextResponse.json(
        { error: "Unable to save message." },
        { status: 500 }
      );
    }

    const { error: conversationUpdateError } = await supabase
      .from("conversations")
      .update({
        updated_at: data.created_at,
        last_message_at: data.created_at,
      })
      .eq("id", conversationId);

    if (conversationUpdateError) {
      console.error(
        "HIISSA conversation activity update failed:",
        conversationUpdateError
      );
    }

    return NextResponse.json(
      {
        message: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("HIISSA message POST error:", error);

    return NextResponse.json(
      { error: "Unable to save message." },
      { status: 500 }
    );
  }
}
