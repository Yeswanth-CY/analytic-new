"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { Users, Zap } from "lucide-react"

export function RealTimeStats() {
  const [activeUsers, setActiveUsers] = useState(573)
  const [recentActivity, setRecentActivity] = useState<{ name: string; action: string; time: string }[]>([
    { name: "Sarah L.", action: "Completed React Quiz", time: "2 min ago" },
    { name: "John D.", action: "Earned JavaScript Badge", time: "5 min ago" },
    { name: "Maria G.", action: "Started Python Course", time: "12 min ago" },
  ])

  useEffect(() => {
    // Fetch initial recent activity data
    const fetchRecentActivity = async () => {
      try {
        const response = await fetch("/api/recent-activity")
        if (response.ok) {
          const activities = await response.json()
          setRecentActivity(activities)
        }
      } catch (error) {
        console.error("Error fetching recent activity:", error)
      }
    }

    fetchRecentActivity()

    // Simulate real-time active users
    const interval = setInterval(() => {
      setActiveUsers((prev) => prev + Math.floor(Math.random() * 10) - 4)
    }, 5000)

    // Set up real-time subscription to achievements
    const achievementsSubscription = supabase
      .channel("public:achievements")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "achievements",
        },
        async (payload) => {
          // Fetch the user name for the new achievement
          const { data: user } = await supabase.from("users").select("name").eq("id", payload.new.user_id).single()

          const newActivity = {
            name: user?.name || "Unknown User",
            action: `Earned ${payload.new.name}`,
            time: "just now",
          }
          setRecentActivity((prev) => [newActivity, ...prev.slice(0, 2)])
        },
      )
      .subscribe()

    // Set up real-time subscription to quiz scores
    const quizSubscription = supabase
      .channel("public:quiz_scores")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "quiz_scores",
        },
        async (payload) => {
          // Fetch the user name for the new quiz score
          const { data: user } = await supabase.from("users").select("name").eq("id", payload.new.user_id).single()

          const newActivity = {
            name: user?.name || "Unknown User",
            action: `Completed ${payload.new.quiz_name}`,
            time: "just now",
          }
          setRecentActivity((prev) => [newActivity, ...prev.slice(0, 2)])
        },
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(achievementsSubscription)
      supabase.removeChannel(quizSubscription)
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-Time Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span>Active Learners</span>
          </div>
          <span className="text-xl font-bold text-primary">{activeUsers}</span>
        </div>
        <Progress value={75} className="h-2" />

        <div className="space-y-4 mt-6">
          <h4 className="text-sm font-medium">Recent Activity</h4>
          {recentActivity.map((activity, i) => (
            <div key={i} className="flex items-start space-x-3 text-sm">
              <Zap className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <span className="font-medium">{activity.name}</span> {activity.action}
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
