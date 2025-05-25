import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET() {
  try {
    console.log("Fetching people data...")

    // Fetch people from the database
    const { data: people, error: peopleError } = await supabaseServer.from("people").select("*").order("name")

    if (peopleError) {
      console.error("Error fetching people:", peopleError)
      throw peopleError
    }

    console.log(`Found ${people.length} people in the database`)

    // For each person, fetch their skills
    const peopleWithSkills = await Promise.all(
      people.map(async (person) => {
        console.log(`Fetching skills for ${person.name} (ID: ${person.id})`)

        const { data: skills, error: skillsError } = await supabaseServer
          .from("skills")
          .select("*")
          .eq("person_id", person.id)
          .order("proficiency", { ascending: false })

        if (skillsError) {
          console.error(`Error fetching skills for ${person.name}:`, skillsError)
          throw skillsError
        }

        console.log(`Found ${skills?.length || 0} skills for ${person.name}`)

        return {
          ...person,
          skills: skills || [],
        }
      }),
    )

    console.log("Successfully fetched all people with their skills")
    return NextResponse.json(peopleWithSkills)
  } catch (error) {
    console.error("Error in people API route:", error)
    return NextResponse.json({ error: "Failed to fetch people data", details: error.message }, { status: 500 })
  }
}
