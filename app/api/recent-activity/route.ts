import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET() {
  try {
    // Fetch recent achievements with user names
    const { data: recentAchievements, error: achievementsError } = await supabaseServer
      .from("achievements")
      .select(`
        name,
        date,
        users!inner(name)
      `)
      .order("date", { ascending: false })
      .limit(5)

    if (achievementsError) throw achievementsError

    // Fetch recent quiz completions with user names
    const { data: recentQuizzes, error: quizzesError } = await supabaseServer
      .from("quiz_scores")
      .select(`
        quiz_name,
        created_at,
        users!inner(name)
      `)
      .order("created_at", { ascending: false })
      .limit(5)

    if (quizzesError) throw quizzesError

    // Combine and format the activities
    const activities = [
      ...recentAchievements.map((achievement) => ({
        name: achievement.users.name,
        action: `Earned ${achievement.name}`,
        time: getTimeAgo(new Date(achievement.date)),
      })),
      ...recentQuizzes.map((quiz) => ({
        name: quiz.users.name,
        action: `Completed ${quiz.quiz_name}`,
        time: getTimeAgo(new Date(quiz.created_at)),
      })),
    ]

    // Sort by most recent and take top 3
    activities.sort((a, b) => {
      const timeA = parseTimeAgo(a.time)
      const timeB = parseTimeAgo(b.time)
      return timeA - timeB
    })

    return NextResponse.json(activities.slice(0, 3))
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return NextResponse.json({ error: "Failed to fetch recent activity" }, { status: 500 })
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "just now"
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
}

function parseTimeAgo(timeStr: string): number {
  if (timeStr === "just now") return 0

  const match = timeStr.match(/(\d+)\s+(min|hour|day)/)
  if (!match) return 0

  const value = Number.parseInt(match[1])
  const unit = match[2]

  switch (unit) {
    case "min":
      return value
    case "hour":
      return value * 60
    case "day":
      return value * 60 * 24
    default:
      return 0
  }
}
