import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function createAuthenticatedSupabase(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authHeader.slice(7).trim();

  if (!accessToken) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
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

function cleanMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter(
      (message) =>
        (message?.role === "user" ||
          message?.role === "assistant") &&
        typeof message?.content === "string" &&
        message.content.trim()
    )
    .map((message) => ({
      role: message.role,
      original_content: message.content,
      client_created_at:
        typeof message?.createdAt === "string" &&
        message.createdAt.trim()
          ? message.createdAt.trim()
          : null,
    }));
}

export async function POST(request) {
  try {
    const supabase =
      createAuthenticatedSupabase(request);

    const user =
      await getAuthenticatedUser(supabase);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const guestSourceId =
      typeof body?.guestSourceId === "string"
        ? body.guestSourceId.trim().slice(0, 200)
        : "";

    const rawTitle =
      typeof body?.title === "string"
        ? body.title.trim()
        : "";

    const title = rawTitle
      ? rawTitle.slice(0, 120)
      : null;

    const messages = cleanMessages(body?.messages);

    if (!guestSourceId) {
      return NextResponse.json(
        { error: "Guest conversation ID is required." },
        { status: 400 }
      );
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "No conversation messages were provided." },
        { status: 400 }
      );
    }

    const {
      data: existingConversation,
      error: existingLookupError,
    } = await supabase
      .from("conversations")
      .select("id, guest_source_id")
      .eq("user_id", user.id)
      .eq("guest_source_id", guestSourceId)
      .maybeSingle();

    if (existingLookupError) {
      console.error(
        "HIISSA guest migration lookup failed:",
        existingLookupError
      );

      return NextResponse.json(
        { error: "Unable to check migration status." },
        { status: 500 }
      );
    }

    let conversationId = existingConversation?.id ?? null;
    let conversationWasCreated = false;

    if (!conversationId) {
      const now = new Date().toISOString();

      const {
        data: createdConversation,
        error: createConversationError,
      } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title,
          guest_source_id: guestSourceId,
          updated_at: now,
          last_message_at: now,
        })
        .select("id")
        .single();

      if (createConversationError) {
        if (createConversationError.code === "23505") {
          const {
            data: retryConversation,
            error: retryLookupError,
          } = await supabase
            .from("conversations")
            .select("id")
            .eq("user_id", user.id)
            .eq("guest_source_id", guestSourceId)
            .maybeSingle();

          if (retryLookupError || !retryConversation) {
            console.error(
              "HIISSA guest migration retry lookup failed:",
              retryLookupError
            );

            return NextResponse.json(
              { error: "Unable to recover migration." },
              { status: 500 }
            );
          }

          conversationId = retryConversation.id;
        } else {
          console.error(
            "HIISSA guest conversation creation failed:",
            createConversationError
          );

          return NextResponse.json(
            { error: "Unable to migrate conversation." },
            { status: 500 }
          );
        }
      } else {
        conversationId = createdConversation.id;
        conversationWasCreated = true;
      }
    }

    const {
      count: existingMessageCount,
      error: messageCountError,
    } = await supabase
      .from("messages")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("conversation_id", conversationId);

    if (messageCountError) {
      console.error(
        "HIISSA guest migration message check failed:",
        messageCountError
      );

      return NextResponse.json(
        { error: "Unable to check migrated messages." },
        { status: 500 }
      );
    }

    if ((existingMessageCount ?? 0) === 0) {
      const messageRows = messages.map((message) => ({
        conversation_id: conversationId,
        role: message.role,
        original_content: message.original_content,
        client_created_at: message.client_created_at,
      }));

      const { error: messageInsertError } =
        await supabase
          .from("messages")
          .insert(messageRows);

      if (messageInsertError) {
        console.error(
          "HIISSA guest message migration failed:",
          messageInsertError
        );

        return NextResponse.json(
          {
            error:
              "Conversation was prepared, but its messages could not be migrated. Your Guest copy has not been deleted.",
          },
          { status: 500 }
        );
      }

      const now = new Date().toISOString();

      const { error: activityUpdateError } =
        await supabase
          .from("conversations")
          .update({
            updated_at: now,
            last_message_at: now,
          })
          .eq("id", conversationId)
          .eq("user_id", user.id);

      if (activityUpdateError) {
        console.error(
          "HIISSA migrated conversation activity update failed:",
          activityUpdateError
        );
      }

      return NextResponse.json(
        {
          migrated: true,
          alreadyMigrated: false,
          conversationId,
          messageCount: messages.length,
        },
        { status: conversationWasCreated ? 201 : 200 }
      );
    }

    if (existingMessageCount === messages.length) {
      return NextResponse.json({
        migrated: true,
        alreadyMigrated: true,
        conversationId,
        messageCount: existingMessageCount,
      });
    }

    return NextResponse.json(
      {
        error:
          "This Guest conversation has an incomplete or conflicting previous migration. No duplicate messages were added.",
        conversationId,
      },
      { status: 409 }
    );
  } catch (error) {
    console.error(
      "HIISSA guest migration error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to migrate Guest conversation." },
      { status: 500 }
    );
  }
}
