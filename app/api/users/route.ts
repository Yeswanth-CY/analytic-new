import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const currentUser = searchParams.get("currentUser")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Missing database credentials" }, { status: 500 })
    }

    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if current user is admin
    let isAdmin = false
    if (currentUser) {
      const { data: currentUserData } = await supabase.from("users").select("role").ilike("name", currentUser).single()

      isAdmin = currentUserData?.role === "admin"
    }

    // Only admins can see all users
    if (!isAdmin) {
      return NextResponse.json({
        users: [],
        isAdmin: false,
        message: "Only admins can view all users. Please enter your name to access your dashboard.",
      })
    }

    // Get all users for admins
    const { data: users, error } = await supabase.from("users").select("name, email, role").order("name")

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    return NextResponse.json({
      users: users || [],
      isAdmin: true,
      message: "Admin access: You can view all users.",
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
  }
}
