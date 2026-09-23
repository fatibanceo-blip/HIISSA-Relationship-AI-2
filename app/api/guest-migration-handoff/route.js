import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "crypto";

export const runtime = "nodejs";

const MAX_CONVERSATIONS = 50;
const MAX_MESSAGES_PER_CONVERSATION = 500;
const MAX_CONTENT_LENGTH = 20000;
const HANDOFF_LIFETIME_MS = 60 * 60 * 1000;

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const serviceRoleKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Guest migration handoff server configuration is missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function cleanMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .slice(0, MAX_MESSAGES_PER_CONVERSATION)
    .filter(
      (message) =>
        message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim()
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_CONTENT_LENGTH),
      ...(message.client_created_at
        ? { client_created_at: message.client_created_at }
        : {}),
    }));
}

function cleanConversations(conversations) {
  if (!Array.isArray(conversations)) {
    return [];
  }

  return conversations
    .slice(0, MAX_CONVERSATIONS)
    .map((conversation) => {
      const guestSourceId =
        typeof conversation?.guestSourceId === "string"
          ? conversation.guestSourceId.trim().slice(0, 200)
          : "";

      const title =
        typeof conversation?.title === "string"
          ? conversation.title.trim().slice(0, 120)
          : "HIISSA conversation";

      const messages = cleanMessages(conversation?.messages);

      if (!guestSourceId || messages.length === 0) {
        return null;
      }

      return {
        guestSourceId,
        title: title || "HIISSA conversation",
        messages,
      };
    })
    .filter(Boolean);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const conversations = cleanConversations(body?.conversations);

    if (conversations.length === 0) {
      return Response.json(
        {
          error: "There are no Guest conversations available to hand off.",
        },
        { status: 400 }
      );
    }

    const handoffToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(handoffToken);
    const expiresAt = new Date(
      Date.now() + HANDOFF_LIFETIME_MS
    ).toISOString();

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("guest_migration_handoffs")
      .insert({
        token_hash: tokenHash,
        payload: {
          version: 1,
          conversations,
        },
        status: "pending",
        expires_at: expiresAt,
      });

    if (error) {
      console.error(
        "HIISSA Guest migration handoff creation failed:",
        error
      );

      return Response.json(
        {
          error: "HIISSA couldn't prepare your conversations for saving.",
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        handoffToken,
        expiresAt,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "HIISSA Guest migration handoff request failed:",
      error
    );

    return Response.json(
      {
        error: "HIISSA couldn't prepare your conversations for saving.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const handoffToken =
      typeof body?.handoffToken === "string"
        ? body.handoffToken.trim()
        : "";

    if (!handoffToken) {
      return Response.json(
        { error: "A Guest migration handoff token is required." },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const tokenHash = hashToken(handoffToken);
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("guest_migration_handoffs")
      .delete()
      .eq("token_hash", tokenHash)
      .eq("status", "pending");

    if (error) {
      console.error(
        "HIISSA Guest migration handoff cancellation failed:",
        error
      );

      return Response.json(
        {
          error: "HIISSA couldn't cancel the pending Guest handoff.",
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return Response.json(
      { cancelled: true },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "HIISSA Guest migration handoff cancellation request failed:",
      error
    );

    return Response.json(
      {
        error: "HIISSA couldn't cancel the pending Guest handoff.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
