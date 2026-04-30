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
  const venue = req.nextUrl.searchParams.get("venue") || "charlie";

  await connectDB();
  const weekOf = getMonday(new Date());

  const items = await MenuItem.find({
    venue,
    weekOf,
    status: { $in: ["candidate", "live"] },
  }).lean();

  const voteCounts = await Vote.aggregate([
    { $match: { venue } },
    { $group: { _id: "$itemId", count: { $sum: 1 } } },
  ]);

  const countMap = Object.fromEntries(voteCounts.map((v) => [v._id, v.count]));

  const result = items
    .map((item) => ({
      id: item.itemId,
      name: item.name,
      emoji: item.emoji,
      tone: item.tone,
      votes: countMap[item.itemId] || 0,
    }))
    .sort((a, b) => b.votes - a.votes);

  return NextResponse.json(result);
}
