import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userName = searchParams.get("user")
    const currentUser = searchParams.get("currentUser") // Who is making the request

    console.log("API Route: Fetching data for user:", userName, "requested by:", currentUser)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Missing database credentials" }, { status: 500 })
    }

    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // First, check the role of the current user making the request
    let isAdmin = false
    if (currentUser) {
      const { data: currentUserData } = await supabase.from("users").select("role").ilike("name", currentUser).single()

      isAdmin = currentUserData?.role === "admin"
      console.log("User", currentUser, "is admin:", isAdmin)
    }

    // Determine which user's data to fetch
    let targetUser = userName
    if (!targetUser) {
      // If no specific user requested, default to first user or current user
      targetUser = currentUser || "yeswanth"
    }

    // Security check: Non-admins can only access their own data
    if (!isAdmin && currentUser && targetUser.toLowerCase() !== currentUser.toLowerCase()) {
      return NextResponse.json(
        {
          error: "Access denied",
          message: "You can only access your own dashboard data. Only admins can view other users.",
        },
        { status: 403 },
      )
    }

    // Get target user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .ilike("name", targetUser)
      .single()

    if (userError || !userData) {
      console.error("User not found:", targetUser, userError)
      return NextResponse.json(
        {
          error: `User "${targetUser}" not found in database`,
          isAdmin,
          availableUsers: isAdmin ? await getAvailableUsers(supabase) : [],
        },
        { status: 404 },
      )
    }

    console.log("Fetching LIVE data for user:", userData.name, "Role:", userData.role)

    // Fetch ALL related data in parallel
    const [quizResult, skillsResult, matchesResult, pathResult, achievementsResult] = await Promise.all([
      supabase.from("quiz_scores").select("*").eq("user_id", userData.id).order("created_at", { ascending: true }),
      supabase.from("skills_learned").select("*").eq("user_id", userData.id).order("name"),
      supabase.from("skill_matches").select("*").eq("user_id", userData.id).order("skill_name"),
      supabase.from("learning_path").select("*").eq("user_id", userData.id).order("created_at", { ascending: true }),
      supabase.from("achievements").select("*").eq("user_id", userData.id).order("date", { ascending: false }),
    ])

    // Check for errors
    if (quizResult.error) {
      console.error("Quiz scores error:", quizResult.error)
      return NextResponse.json({ error: "Failed to fetch quiz scores" }, { status: 500 })
    }

    if (skillsResult.error) {
      console.error("Skills error:", skillsResult.error)
      return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 })
    }

    if (matchesResult.error) {
      console.error("Skill matches error:", matchesResult.error)
      return NextResponse.json({ error: "Failed to fetch skill matches" }, { status: 500 })
    }

    if (pathResult.error) {
      console.error("Learning path error:", pathResult.error)
      return NextResponse.json({ error: "Failed to fetch learning path" }, { status: 500 })
    }

    if (achievementsResult.error) {
      console.error("Achievements error:", achievementsResult.error)
      return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
    }

    // Format real data
    const formattedData = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatar: userData.avatar_url || "/placeholder.svg?height=80&width=80",
      resumeScore: Number(userData.resume_score),
      xpPoints: userData.xp_points,
      isAdmin,

      // Real quiz scores from database
      quizScores: quizResult.data.map((q) => Number(q.score)),
      quizNames: quizResult.data.map((q) => q.quiz_name),

      // Real skill matches from database
      skillMatches: matchesResult.data.reduce((acc, curr) => {
        acc[curr.skill_name] = curr.match_percentage
        return acc
      }, {}),

      // Real skills learned from database
      skillsLearned: skillsResult.data.map((skill) => ({
        name: skill.name,
        level: skill.level,
        completed: skill.completed,
      })),

      // Real learning path from database
      learningPath: pathResult.data.map((path) => ({
        month: path.month,
        progress: path.progress,
      })),

      // Real achievements from database
      achievements: achievementsResult.data.map((achievement) => ({
        name: achievement.name,
        date: new Date(achievement.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      })),
    }

    console.log("REAL-TIME data summary for", formattedData.name, "(Role:", formattedData.role, "):", {
      quizScores: formattedData.quizScores.length,
      skillsLearned: formattedData.skillsLearned.length,
      skillMatches: Object.keys(formattedData.skillMatches).length,
      learningPath: formattedData.learningPath.length,
      achievements: formattedData.achievements.length,
      resumeScore: formattedData.resumeScore,
      xpPoints: formattedData.xpPoints,
    })

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Database connection failed", details: error.message }, { status: 500 })
  }
}

// Helper function to get available users (only for admins)
async function getAvailableUsers(supabase) {
  try {
    const { data, error } = await supabase.from("users").select("name, role").order("name")
    if (error) return []
    return data.map((user) => ({ name: user.name, role: user.role }))
  } catch {
    return []
  }
}
