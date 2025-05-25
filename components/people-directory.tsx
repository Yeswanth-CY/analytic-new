"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type Skill = {
  id: string
  name: string
  proficiency: number
  person_id: string
  created_at: string
}

type Person = {
  id: string
  name: string
  avatar_url: string
  created_at: string
  skills: Skill[]
}

export default function PeopleDirectory() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPeople = async () => {
    try {
      setLoading(true)
      console.log("Fetching people from API...")

      const response = await fetch("/api/people")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Error ${response.status}: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      console.log(`Received ${data.length} people from API:`, data)

      setPeople(data)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch people:", err)
      setError(`Failed to load people data: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeople()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={fetchPeople} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">People Directory</h1>
        </div>
        <Button onClick={fetchPeople} variant="outline" size="sm" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {people.map((person) => (
          <Card key={person.id} className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={person.avatar_url || "/placeholder.svg"} alt={person.name} />
                  <AvatarFallback>{person.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{person.name}</CardTitle>
                  <CardDescription>
                    {person.skills.length} {person.skills.length === 1 ? "skill" : "skills"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {person.skills.map((skill) => (
                  <div key={skill.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <Badge variant="outline">{skill.proficiency}%</Badge>
                    </div>
                    <Progress
                      value={skill.proficiency}
                      className="h-2"
                      indicatorClassName={
                        skill.proficiency > 85
                          ? "bg-green-500"
                          : skill.proficiency > 70
                            ? "bg-blue-500"
                            : "bg-amber-500"
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
