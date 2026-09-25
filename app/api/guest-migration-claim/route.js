import { validateGuestMigrationServerConfig, logGuestMigrationFailure } from "../../../lib/hiissa/guest-migration-server-config";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

export const runtime = "nodejs";

function jsonResponse(body, status = 200) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
}

function getBearerToken(request) {
  const authorization =
    request.headers.get("authorization") || "";

  if (
    !authorization
      .toLowerCase()
      .startsWith("bearer ")
  ) {
    return "";
  }

  return authorization.slice(7).trim();
}

function hashHandoffToken(token) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function getSupabaseClients() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const secretKey =
    process.env.SUPABASE_SECRET_KEY;

  validateGuestMigrationServerConfig(supabaseUrl, secretKey);

  if (
    !supabaseUrl ||
    !publishableKey ||
    !secretKey
  ) {
    throw new Error(
      "Supabase server configuration is incomplete."
    );
  }

  const authClient = createClient(
    supabaseUrl,
    publishableKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const adminClient = createClient(
    supabaseUrl,
    secretKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return {
    authClient,
    adminClient,
  };
}

export async function POST(request) {
  try {
    const accessToken =
      getBearerToken(request);

    if (!accessToken) {
      return jsonResponse(
        {
          error: "Authentication required.",
        },
        401
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        {
          error: "Invalid request.",
        },
        400
      );
    }

    const handoffToken =
      typeof body?.handoffToken === "string"
        ? body.handoffToken.trim()
        : "";

    if (
      !handoffToken ||
      handoffToken.length > 256
    ) {
      return jsonResponse(
        {
          error:
            "A valid Guest handoff token is required.",
        },
        400
      );
    }

    const {
      authClient,
      adminClient,
    } = getSupabaseClients();

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(
      accessToken
    );

    if (
      userError ||
      !user?.id
    ) {
      logGuestMigrationFailure("claim-auth", userError);
      return jsonResponse(
        {
          error:
            "Your HIISSA session could not be verified.",
        },
        401
      );
    }

    const tokenHash =
      hashHandoffToken(handoffToken);

    const {
      data: handoff,
      error: handoffError,
    } = await adminClient
      .from("guest_migration_handoffs")
      .select(
        "token_hash,payload,status,expires_at"
      )
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (handoffError) {
      logGuestMigrationFailure("claim-lookup", handoffError);

      return jsonResponse(
        {
          error:
            "HIISSA couldn't verify the Guest conversation handoff.",
        },
        500
      );
    }

    if (!handoff) {
      return jsonResponse(
        {
          error:
            "This Guest conversation handoff is no longer available.",
        },
        404
      );
    }

    if (handoff.status === "claimed") {
      return jsonResponse({
        claimed: true,
        alreadyClaimed: true,
      });
    }

    if (handoff.status !== "pending") {
      return jsonResponse(
        {
          error:
            "This Guest conversation handoff cannot be claimed.",
        },
        409
      );
    }

    if (
      handoff.expires_at &&
      new Date(
        handoff.expires_at
      ).getTime() <= Date.now()
    ) {
      return jsonResponse(
        {
          error:
            "This Guest conversation handoff has expired.",
        },
        410
      );
    }

    const conversations =
      Array.isArray(
        handoff.payload?.conversations
      )
        ? handoff.payload.conversations
        : [];

    if (conversations.length === 0) {
      return jsonResponse(
        {
          error:
            "No Guest conversations were available in this handoff.",
        },
        409
      );
    }

    let migratedConversationCount = 0;

    for (
      const conversation
      of conversations
    ) {
     const guestSourceId =
  typeof conversation?.guestSourceId === "string"
    ? conversation.guestSourceId.trim()
    : "";

if (
  !guestSourceId ||
  !Array.isArray(
    conversation?.messages
  ) ||
  conversation.messages.length === 0
) {
  continue;
}

      const migrationResponse =
        await fetch(
          new URL(
            "/api/guest-migration",
            request.url
          ),
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
             guestSourceId,
              title:
                conversation.title ||
                "HIISSA Conversation",
              messages:
                conversation.messages,
            }),
            cache: "no-store",
          }
        );

      if (!migrationResponse.ok) {
        console.error(
          "HIISSA staged Guest conversation migration failed:",
          migrationResponse.status
        );

        return jsonResponse(
          {
            error:
              "HIISSA couldn't finish transferring all of the Guest conversations. The handoff remains available for a safe retry.",
          },
          502
        );
      }

      migratedConversationCount += 1;
    }

    if (
      migratedConversationCount === 0
    ) {
      return jsonResponse(
        {
          error:
            "No valid Guest conversations were available to transfer.",
        },
        409
      );
    }

    const {
      data: claimedRows,
      error: claimError,
    } = await adminClient
      .from("guest_migration_handoffs")
      .update({
        status: "claimed",
        payload: {
          version: 1,
          conversations: [],
        },
      })
      .eq("token_hash", tokenHash)
      .eq("status", "pending")
      .select("token_hash");

    if (claimError) {
      logGuestMigrationFailure("claim-complete", claimError);

      return jsonResponse(
        {
          error:
            "Your conversations were transferred, but HIISSA couldn't finish closing the secure handoff. It can be safely retried.",
        },
        500
      );
    }

    if (
      !Array.isArray(claimedRows) ||
      claimedRows.length === 0
    ) {
      const {
        data: currentHandoff,
        error: recheckError,
      } = await adminClient
        .from(
          "guest_migration_handoffs"
        )
        .select("status")
        .eq(
          "token_hash",
          tokenHash
        )
        .maybeSingle();

      if (recheckError) {
        logGuestMigrationFailure("claim-recheck", recheckError);
      }

      if (
        currentHandoff?.status ===
        "claimed"
      ) {
        return jsonResponse({
          claimed: true,
          alreadyClaimed: true,
        });
      }

      return jsonResponse(
        {
          error:
            "The Guest conversation handoff could not be completed.",
        },
        409
      );
    }

    return jsonResponse({
      claimed: true,
      migratedConversationCount,
    });
  } catch (error) {
    logGuestMigrationFailure("claim-request", error);

    return jsonResponse(
      {
        error:
          "HIISSA couldn't complete the Guest conversation handoff.",
      },
      500
    );
  }
}
