import * as XLSX from "xlsx"
import fs from "fs"
import path from "path"

// This script reads the Excel file and converts it to the format needed by the app
async function processExcelData() {
  try {
    // Read the Excel file from the public directory
    const filePath = path.join(process.cwd(), "public", "efootball-players.xlsx")

    if (!fs.existsSync(filePath)) {
      console.log("Excel file not found. Please place efootball-players.xlsx in the public folder.")
      return
    }

    // Read the Excel file
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0] // Use the first sheet
    const worksheet = workbook.Sheets[sheetName]

    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet)

    console.log(`Found ${rawData.length} players in Excel file`)

    // Convert to our Player format
    const players = rawData.map((row, index) => {
      // Handle different possible column names (case insensitive)
      const getName = (row) => row.name || row.Name || row.NAME || ""
      const getTeam = (row) => row.team || row.Team || row.TEAM || "Unknown"
      const getPosition = (row) => row.position || row.Position || row.POSITION || ""
      const getAge = (row) => Number.parseInt(row.age || row.Age || row.AGE || 0)
      const getCardType = (row) => row["card-type"] || row.cardType || row["Card Type"] || row.CardType || "epic"
      const getApps = (row) =>
        Number.parseInt(row.apps || row.Apps || row.APPS || row.appearances || row.Appearances || 0)
      const getGoal = (row) => Number.parseInt(row.goal || row.Goal || row.GOAL || row.goals || row.Goals || 0)
      const getAssists = (row) => Number.parseInt(row.assists || row.Assists || row.ASSISTS || 0)
      const getGPlusA = (row) => Number.parseInt(row["g+a"] || row.gPlusA || row["g_a"] || row["goals_assists"] || 0)
      const getGPm = (row) => Number.parseFloat(row["g-pm"] || row.gPm || row["g_pm"] || row["goals_per_match"] || 0)
      const getAPm = (row) => Number.parseFloat(row["a-pm"] || row.aPm || row["a_pm"] || row["assists_per_match"] || 0)
      const getGAPm = (row) =>
        Number.parseFloat(row["g/a-pm"] || row.gAPm || row["ga_pm"] || row["goals_assists_per_match"] || 0)

      return {
        id: index + 1,
        name: getName(row).toLowerCase(),
        team: getTeam(row).toLowerCase(),
        position: getPosition(row).toUpperCase(),
        age: getAge(row),
        cardType: getCardType(row).toLowerCase(),
        apps: getApps(row),
        goal: getGoal(row),
        assists: getAssists(row),
        gPlusA: getGPlusA(row) || getGoal(row) + getAssists(row), // Calculate if not provided
        gPm: getGPm(row) || (getApps(row) > 0 ? getGoal(row) / getApps(row) : 0), // Calculate if not provided
        aPm: getAPm(row) || (getApps(row) > 0 ? getAssists(row) / getApps(row) : 0), // Calculate if not provided
        gAPm: getGAPm(row) || (getApps(row) > 0 ? (getGoal(row) + getAssists(row)) / getApps(row) : 0), // Calculate if not provided
      }
    })

    // Generate the TypeScript file content
    const tsContent = `export interface Player {
  id: number
  name: string
  team: string
  position: string
  age: number
  cardType: string
  apps: number // appearances
  goal: number
  assists: number
  gPlusA: number // goals + assists
  gPm: number // goals per match
  aPm: number // assists per match
  gAPm: number // goals/assists per match
  image?: string
}

export const playersData: Player[] = ${JSON.stringify(players, null, 2)}
`

    // Write to the lib/players-data.ts file
    const outputPath = path.join(process.cwd(), "lib", "players-data.ts")
    fs.writeFileSync(outputPath, tsContent)

    console.log(`✅ Successfully processed ${players.length} players and updated lib/players-data.ts`)
    console.log("Sample players:")
    players.slice(0, 3).forEach((player) => {
      console.log(`- ${player.name} (${player.team}, ${player.position})`)
    })
  } catch (error) {
    console.error("Error processing Excel file:", error)
  }
}

processExcelData()
