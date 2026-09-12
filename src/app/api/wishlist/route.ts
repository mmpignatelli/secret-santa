import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { isParticipantName } from "@/lib/participants";

function isValidUrl(value: string): boolean {
  return /^https?:\/\/.+/i.test(value);
}

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");
  if (!isParticipantName(name)) {
    return NextResponse.json({ error: "Unknown participant." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("id, description, link, image_url, created_at")
    .eq("owner_name", name)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load this wishlist." }, { status: 500 });
  }
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: NextRequest) {
  const store = await cookies();
  const session = verifySessionToken(store.get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json({ error: "Please identify yourself first." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const link = typeof body?.link === "string" ? body.link.trim() : "";
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";

  if (!description) {
    return NextResponse.json({ error: "Please add a short description." }, { status: 400 });
  }
  if (description.length > 300) {
    return NextResponse.json(
      { error: "Keep the description under 300 characters." },
      { status: 400 }
    );
  }
  if (link && !isValidUrl(link)) {
    return NextResponse.json(
      { error: "The link should be a full web address starting with http:// or https://" },
      { status: 400 }
    );
  }
  if (imageUrl && !isValidUrl(imageUrl)) {
    return NextResponse.json(
      { error: "The photo link should be a full web address starting with http:// or https://" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("wishlist_items").insert({
    owner_name: session.name,
    description,
    link: link || null,
    image_url: imageUrl || null,
  });

  if (error) {
    return NextResponse.json({ error: "Could not save that item." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const store = await cookies();
  const session = verifySessionToken(store.get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json({ error: "Please identify yourself first." }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing item id." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: item, error: fetchError } = await supabase
    .from("wishlist_items")
    .select("owner_name")
    .eq("id", id)
    .maybeSingle<{ owner_name: string }>();

  if (fetchError || !item) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }
  if (item.owner_name !== session.name) {
    return NextResponse.json(
      { error: "You can only remove items from your own wishlist." },
      { status: 403 }
    );
  }

  const { error } = await supabase.from("wishlist_items").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Could not delete that item." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
