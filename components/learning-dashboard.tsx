"use client"

import React from "react"
import { Chart, registerables } from "chart.js"
import { Bar, Doughnut, Line, Radar } from "react-chartjs-2"
import {
  Award,
  BookOpen,
  Brain,
  GraduationCap,
  LayoutDashboard,
  Moon,
  Sun,
  Target,
  Trophy,
  Users,
  RefreshCw,
  Shield,
  User,
  LogIn,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { SkillRecommendations } from "@/components/skill-recommendations"
import { ProfileSelector } from "@/components/profile-selector"
import Link from "next/link"

// Register Chart.js components
Chart.register(...registerables)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { size: 12 },
      },
    },
  },
  scales: { y: { beginAtZero: true } },
}

// Dummy data to show before authentication
const dummyData = {
  name: "Demo User",
  email: "demo@example.com",
  role: "user",
  avatar: "/placeholder.svg?height=80&width=80",
  resumeScore: 7.5,
  xpPoints: 65,
  isAdmin: false,
  quizScores: [7.2, 8.5, 9.0, 8.7, 9.5, 7.8],
  quizNames: [
    "JavaScript Basics",
    "React Fundamentals",
    "Node.js Intro",
    "Database Design",
    "API Development",
    "Testing",
  ],
  skillMatches: {
    JavaScript: 75,
    React: 65,
    "Node.js": 55,
    Python: 50,
    "Data Analysis": 60,
  },
  skillsLearned: [
    { name: "JavaScript", level: 75, completed: true },
    { name: "React", level: 65, completed: true },
    { name: "Node.js", level: 55, completed: false },
    { name: "Python", level: 50, completed: false },
    { name: "Data Analysis", level: 60, completed: false },
  ],
  learningPath: [
    { month: "Jan", progress: 10 },
    { month: "Feb", progress: 25 },
    { month: "Mar", progress: 40 },
    { month: "Apr", progress: 55 },
    { month: "May", progress: 65 },
    { month: "Jun", progress: 65 },
  ],
  achievements: [
    { name: "First Login", date: "Jan 15" },
    { name: "Profile Setup", date: "Feb 22" },
    { name: "First Quiz", date: "Mar 10" },
    { name: "Skill Unlocked", date: "Apr 5" },
  ],
}

export default function LearningDashboard() {
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const [userData, setUserData] = useState(dummyData) // Start with dummy data
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(false) // Off by default for demo mode
  const [currentUser, setCurrentUser] = useState("") // No user initially
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Track if user is logged in
  const [isDemoMode, setIsDemoMode] = useState(true) // Track if showing demo data

  // Fetch REAL-TIME data from database for specific user
  const fetchUserData = async (userName?: string) => {
    try {
      setLoading(true)
      setError(null)
      const userToFetch = userName || currentUser
      console.log("Fetching REAL-TIME data for user:", userToFetch)

      const url = `/api/user-data?user=${encodeURIComponent(userToFetch)}&currentUser=${encodeURIComponent(currentUser)}`

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store", // Always fetch fresh data
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("Received REAL-TIME data for", userToFetch, ":", data)

      setUserData(data)
      setIsAdmin(data.isAdmin || false)
      setIsAuthenticated(true)
      setIsDemoMode(false)
      setAutoRefresh(true) // Enable auto-refresh once authenticated
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching REAL-TIME data:", error)
      setError(error.message)
      setIsAuthenticated(false)
      setIsDemoMode(true)
    } finally {
      setLoading(false)
    }
  }

  // Handle user authentication from profile selector
  const handleUserChange = (userName: string) => {
    console.log("User attempting to login:", userName)
    setCurrentUser(userName)
    fetchUserData(userName)
  }

  useEffect(() => {
    // Only auto-refresh if authenticated and auto-refresh is enabled
    let interval
    if (autoRefresh && isAuthenticated && currentUser) {
      interval = setInterval(() => {
        console.log("Auto-refreshing data for user:", currentUser)
        fetchUserData()
      }, 15000) // 15 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, isAuthenticated, currentUser])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const handleManualRefresh = () => {
    if (isAuthenticated && currentUser) {
      console.log("Manual refresh triggered for user:", currentUser)
      fetchUserData()
    }
  }

  const handleLogout = () => {
    setCurrentUser("")
    setIsAuthenticated(false)
    setIsDemoMode(true)
    setIsAdmin(false)
    setUserData(dummyData)
    setAutoRefresh(false)
    setError(null)
    console.log("User logged out, showing demo data")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Authenticating and loading data...</p>
        </div>
      </div>
    )
  }

  // Use REAL data for charts - no fallbacks
  const quizScoresData = {
    labels: userData.quizNames || userData.quizScores.map((_, i) => `Quiz ${i + 1}`),
    datasets: [
      {
        label: "Quiz Scores",
        data: userData.quizScores,
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const learningProgressData = {
    labels: userData.learningPath.map((item) => item.month),
    datasets: [
      {
        label: "XP Progress",
        data: userData.learningPath.map((item) => item.progress),
        fill: true,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.4,
      },
    ],
  }

  const skillMatchesData = {
    labels: Object.keys(userData.skillMatches),
    datasets: [
      {
        label: "Skill Match %",
        data: Object.values(userData.skillMatches),
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(153, 102, 255, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(153, 102, 255, 1)",
      },
    ],
  }

  const skillsLearnedData = {
    labels: userData.skillsLearned.map((skill) => skill.name),
    datasets: [
      {
        label: "Skill Level",
        data: userData.skillsLearned.map((skill) => skill.level),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className={`min-h-screen p-8 bg-background text-foreground ${isDarkMode ? "dark" : ""}`}>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Learning Platform Dashboard
            {isAuthenticated && userData.role === "admin" && <Shield className="h-6 w-6 text-orange-600" />}
            {isDemoMode && (
              <Badge variant="outline" className="bg-gray-100 text-gray-600">
                DEMO MODE
              </Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isDemoMode ? (
              <span className="text-orange-600">Demo data - Please login to see your real dashboard</span>
            ) : (
              <>
                Last updated: {lastUpdated.toLocaleTimeString()} •<span className="text-green-600 ml-1">LIVE DATA</span>
                {userData.role === "admin" && <span className="text-orange-600 ml-2">• ADMIN VIEW</span>}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isAuthenticated && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-green-100 text-green-800" : ""}
              >
                {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
              </Button>
              <Button variant="outline" size="icon" onClick={handleManualRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/people">
              <Users className="mr-2 h-4 w-4" /> People Directory
            </Link>
          </Button>
          {isAuthenticated ? (
            <>
              <ProfileSelector currentUser={currentUser} isAdmin={isAdmin} onUserChange={handleUserChange} />
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <ProfileSelector currentUser={currentUser} isAdmin={isAdmin} onUserChange={handleUserChange} />
          )}
        </div>
      </div>

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="mt-6 mb-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <LogIn className="h-5 w-5 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800">Welcome to the Learning Platform Dashboard</h3>
                  <p className="text-sm text-orange-700">
                    You're viewing demo data. Click the "Profile" button to enter your name and access your real
                    dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 mb-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Authentication Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                  <p className="text-xs text-red-600 mt-1">Showing demo data instead. Please try logging in again.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Profile Section */}
      <div className="mt-6 mb-8">
        <Card className={isDemoMode ? "border-dashed border-gray-300" : ""}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                <AvatarFallback>
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h2 className="text-2xl font-bold">{userData.name}</h2>
                  {isAuthenticated && userData.role === "admin" ? (
                    <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                      <Shield className="mr-1 h-3 w-3" />
                      Admin
                    </Badge>
                  ) : isAuthenticated ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                      <User className="mr-1 h-3 w-3" />
                      User
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                      Demo
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{userData.email}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {userData.skillsLearned
                    .filter((skill) => skill.completed)
                    .map((skill) => (
                      <Badge key={skill.name} variant="secondary" className={isDemoMode ? "opacity-60" : ""}>
                        {skill.name}
                      </Badge>
                    ))}
                </div>
              </div>
              <div className="ml-auto flex flex-col items-center gap-2">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">XP Points</h3>
                  <div className="text-3xl font-bold text-primary">{userData.xpPoints}/100</div>
                  <Progress value={userData.xpPoints} className="w-32 mt-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="overview">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="progress">
            <GraduationCap className="mr-2 h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Brain className="mr-2 h-4 w-4" />
            Skills
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className={isDemoMode ? "border-dashed border-gray-300" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resume Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.resumeScore}/10</div>
                <Progress value={userData.resumeScore * 10} className="mt-2" />
              </CardContent>
            </Card>
            <Card className={isDemoMode ? "border-dashed border-gray-300" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Quiz Score</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userData.quizScores.length > 0
                    ? (userData.quizScores.reduce((a, b) => a + b, 0) / userData.quizScores.length).toFixed(1)
                    : "0"}
                  /10
                </div>
                <Progress
                  value={
                    userData.quizScores.length > 0
                      ? (userData.quizScores.reduce((a, b) => a + b, 0) / userData.quizScores.length) * 10
                      : 0
                  }
                  className="mt-2"
                />
              </CardContent>
            </Card>
            <Card className={isDemoMode ? "border-dashed border-gray-300" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skills Completed</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userData.skillsLearned.filter((skill) => skill.completed).length}/{userData.skillsLearned.length}
                </div>
                <Progress
                  value={
                    userData.skillsLearned.length > 0
                      ? (userData.skillsLearned.filter((skill) => skill.completed).length /
                          userData.skillsLearned.length) *
                        100
                      : 0
                  }
                  className="mt-2"
                />
              </CardContent>
            </Card>
            <Card className={isDemoMode ? "border-dashed border-gray-300" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.achievements.length}</div>
                <p className="text-xs text-muted-foreground">Milestones earned</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className={isDemoMode ? "border-dashed border-gray-300" : ""}>
              <CardHeader>
                <CardTitle>Quiz Performance</CardTitle>
                <CardDescription>
                  {isDemoMode ? "Demo quiz scores" : `Real scores from database for ${userData.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <Bar data={quizScoresData} options={chartOptions} />
              </CardContent>
            </Card>
            <Card className={isDemoMode ? "border-dashed border-gray-300" : ""}>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>
                  {isDemoMode ? "Demo progress data" : `Real progress from database for ${userData.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <Line data={learningProgressData} options={chartOptions} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className={isDemoMode ? "border-dashed border-gray-300" : ""}>
              <CardHeader>
                <CardTitle>Learning Journey</CardTitle>
                <CardDescription>
                  {isDemoMode ? "Demo progress over time" : `Real progress over time for ${userData.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <Line data={learningProgressData} options={chartOptions} />
              </CardContent>
            </Card>
            <Card className={isDemoMode ? "border-dashed border-gray-300" : ""}>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>
                  {isDemoMode ? "Demo milestones" : `Real milestones from database for ${userData.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-4 p-2 rounded-lg bg-muted/50">
                      <div className="bg-primary/20 p-2 rounded-full">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className={isDemoMode ? "border-dashed border-gray-300" : ""}>
              <CardHeader>
                <CardTitle>Skill Matches</CardTitle>
                <CardDescription>
                  {isDemoMode ? "Demo skill matching" : `Real skill matching from database for ${userData.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <Radar data={skillMatchesData} options={chartOptions} />
              </CardContent>
            </Card>
            <Card className={isDemoMode ? "border-dashed border-gray-300" : ""}>
              <CardHeader>
                <CardTitle>Skills Distribution</CardTitle>
                <CardDescription>
                  {isDemoMode ? "Demo skill levels" : `Real skill levels from database for ${userData.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <Doughnut data={skillsLearnedData} options={{ ...chartOptions, cutout: "65%" }} />
              </CardContent>
            </Card>
          </div>

          <Card className={isDemoMode ? "border-dashed border-gray-300" : ""}>
            <CardHeader>
              <CardTitle>Skills Progress</CardTitle>
              <CardDescription>
                {isDemoMode ? "Demo skill breakdown" : `Real skill breakdown from database for ${userData.name}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {userData.skillsLearned.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: [
                              "rgb(255, 99, 132)",
                              "rgb(54, 162, 235)",
                              "rgb(255, 206, 86)",
                              "rgb(75, 192, 192)",
                              "rgb(153, 102, 255)",
                            ][index % 5],
                          }}
                        />
                        <span className="font-medium">{skill.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{skill.level}%</span>
                        {skill.completed && (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          >
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {!isDemoMode && <SkillRecommendations skills={userData.skillsLearned} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
