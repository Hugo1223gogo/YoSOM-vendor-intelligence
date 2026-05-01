import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import Vote from "@/models/Vote";

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setHours(0, 0, 0, 0);
  date.setDate(diff);
  return date;
}

export async function GET(req: NextRequest) {
  const venue = req.nextUrl.searchParams.get("venue");
  if (!venue || !["charleys", "mcnay"].includes(venue)) {
    return NextResponse.json({ error: "Invalid venue" }, { status: 400 });
  }

  await connectDB();
  const weekOf = getMonday(new Date());

  const items = await MenuItem.find({
    venue,
    weekOf,
    status: { $in: ["candidate", "live"] },
  })
    .sort({ createdAt: 1 })
    .limit(4)
    .lean();

  const itemIds = items.map((i) => i.itemId);
  const voteCounts = await Vote.aggregate([
    { $match: { venue, itemId: { $in: itemIds }, value: 1 } },
    { $group: { _id: "$itemId", count: { $sum: 1 } } },
  ]);

  const countMap = Object.fromEntries(voteCounts.map((v) => [v._id, v.count]));

  const result = items.map((item) => ({
    id: item.itemId,
    emoji: item.emoji,
    name: item.name,
    tags: item.tags,
    price: item.price,
    tone: item.tone,
    votes: countMap[item.itemId] || 0,
  }));

  return NextResponse.json(result);
}
