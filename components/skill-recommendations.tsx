"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, ExternalLink } from "lucide-react"

type SkillRecommendationsProps = {
  skills: { name: string; level: number; completed: boolean }[]
}

export function SkillRecommendations({ skills }: SkillRecommendationsProps) {
  // Find incomplete skills or skills with lower proficiency
  const incompleteSkills = skills.filter((skill) => !skill.completed || skill.level < 70)

  // Generate recommendations based on skills
  const recommendations = incompleteSkills.map((skill) => {
    const resources = getResourcesForSkill(skill.name)
    return {
      skill: skill.name,
      resources,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Resources</CardTitle>
        <CardDescription>Based on your current skill levels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <div key={index} className="space-y-2">
              <h3 className="font-medium text-sm">{rec.skill}</h3>
              <div className="space-y-2">
                {rec.resources.map((resource, i) => (
                  <div key={i} className="flex items-start space-x-2 text-sm">
                    <BookOpen className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">{resource.description}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            Great job! You've completed all your current skill requirements.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function to get resources for a skill
function getResourcesForSkill(skillName: string) {
  const resourceMap: Record<string, { title: string; description: string }[]> = {
    JavaScript: [
      {
        title: "Advanced JavaScript Concepts",
        description: "Learn about closures, prototypes, and async programming",
      },
      {
        title: "JavaScript Testing Fundamentals",
        description: "Master Jest and testing best practices",
      },
    ],
    React: [
      {
        title: "React Performance Optimization",
        description: "Techniques to make your React apps faster",
      },
      {
        title: "Advanced React Hooks",
        description: "Deep dive into useCallback, useMemo, and custom hooks",
      },
    ],
    "Node.js": [
      {
        title: "Building RESTful APIs with Express",
        description: "Create robust backend services with Node.js",
      },
      {
        title: "Node.js Security Best Practices",
        description: "Protect your applications from common vulnerabilities",
      },
    ],
    Python: [
      {
        title: "Python for Data Science",
        description: "Learn pandas, numpy, and data visualization",
      },
      {
        title: "Building Web Applications with Django",
        description: "Create full-stack applications with Python",
      },
    ],
    "Data Analysis": [
      {
        title: "SQL for Data Analysis",
        description: "Master complex queries and database optimization",
      },
      {
        title: "Data Visualization with D3.js",
        description: "Create interactive data visualizations for the web",
      },
    ],
  }

  return (
    resourceMap[skillName] || [
      {
        title: `${skillName} Fundamentals`,
        description: `Learn the basics of ${skillName}`,
      },
    ]
  )
}
