"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import * as XLSX from "xlsx"

interface ImportedPlayer {
  name: string
  team: string
  position: string
  age: number
  cardType: string
  apps: number
  goal: number
  assists: number
  gPlusA?: number
  gPm?: number
  aPm?: number
  gAPm?: number
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    count?: number
    data?: ImportedPlayer[]
  } | null>(null)
  const [preview, setPreview] = useState<ImportedPlayer[]>([])
  const [confirmedData, setConfirmedData] = useState<ImportedPlayer[]>([])
  const [importConfirmed, setImportConfirmed] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && (selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls"))) {
      setFile(selectedFile)
      setResult(null)
      setPreview([])
    } else {
      setResult({ success: false, message: "Please select a valid .xlsx or .xls file" })
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: "array" })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      const importedPlayers: ImportedPlayer[] = jsonData.map((row: any) => {
        const apps = Number(row.apps) || 0
        const goal = Number(row.goal) || 0
        const assists = Number(row.assists) || 0

        return {
          name: (row.name || "").toLowerCase().trim(),
          team: (row.team || "").toLowerCase().trim(),
          position: (row.position || "").toUpperCase().trim(),
          age: Number(row.age) || 0,
          cardType: (row["card-type"] || row.cardType || "epic").toLowerCase().trim(),
          apps,
          goal,
          assists,
          gPlusA: goal + assists,
          gPm: apps > 0 ? Number((goal / apps).toFixed(6)) : 0,
          aPm: apps > 0 ? Number((assists / apps).toFixed(6)) : 0,
          gAPm: apps > 0 ? Number(((goal + assists) / apps).toFixed(6)) : 0,
        }
      })

      setPreview(importedPlayers.slice(0, 5))
      setResult({
        success: true,
        message: `Excel file processed successfully! Found ${importedPlayers.length} players ready to import.`,
        count: importedPlayers.length,
        data: importedPlayers,
      })
    } catch (error) {
      console.error("[0017] Import error:", error)
      setResult({ success: false, message: "Failed to import Excel file. Please check the format and try again." })
    } finally {
      setImporting(false)
    }
  }

  const handleConfirmImport = () => {
    if (result?.data) {
      // Save to localStorage
     const existing = JSON.parse(localStorage.getItem("importedPlayers") || "[]")

const merged = [...existing, ...result.data]

const unique = Array.from(
  new Map(
    merged.map((p) => [`${p.name}-${p.team}-${p.position}`, p])
  ).values()
)

localStorage.setItem("importedPlayers", JSON.stringify(unique))

      setConfirmedData(result.data)
      setImportConfirmed(true)
      setResult({
        success: true,
        message: `✓ Successfully imported ${result.data.length} players! They are now available in the app.`,
        count: result.data.length,
        data: result.data,
      })
    }
  }

  const downloadTemplate = () => {
    const sampleData = [
      ["name", "team", "position", "age", "card-type", "apps", "goal", "assists", "g+a", "g-pm", "a-pm", "g/a-pm"],
      [
        "lionel messi",
        "barcelona",
        "CF",
        34,
        "epic-big time",
        1426,
        1002,
        445,
        1447,
        0.702664797,
        0.312061711,
        1.014726508,
      ],
      [
        "antoine griezmann",
        "atl madrid",
        "SS",
        27,
        "epic-big time",
        966,
        157,
        135,
        292,
        0.16252588,
        0.139751553,
        0.302277433,
      ],
      ["gabriel batistuta", "fiorentina", "CF", 26, "epic", 479, 156, 36, 192, 0.325678497, 0.075156576, 0.400835073],
    ]

    const ws = XLSX.utils.aoa_to_sheet(sampleData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Players")
    XLSX.writeFile(wb, "efootball-template.xlsx")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Import Player Data</h1>
        <p className="text-muted-foreground">Upload your Excel file to automatically update the player database</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Excel File
            </CardTitle>
            <CardDescription>Select your efootball-players.xlsx file to import player data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <input type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" id="excel-upload" />
              <label
                htmlFor="excel-upload"
                className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
              >
                Click to select Excel file (.xlsx or .xls)
              </label>
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
            )}

            <Button onClick={handleImport} disabled={!file || importing} className="w-full">
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import Data"
              )}
            </Button>

            {result && (
              <Alert className={result.success ? "border-green-500" : "border-red-500"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>
                  {result.message}
                  {result.count && ` (${result.count} players)`}
                </AlertDescription>
              </Alert>
            )}

            {result && result.success && !importConfirmed && (
              <Button onClick={handleConfirmImport} className="w-full bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm & Save Import
              </Button>
            )}

            {importConfirmed && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-800">
                  ✓ Data successfully saved! You can now use these players in Compare, Stats, and other pages.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Instructions Section */}
        <Card>
          <CardHeader>
            <CardTitle>File Format Requirements</CardTitle>
            <CardDescription>Your Excel file should have these columns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Required Columns:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {["name", "team", "position", "age", "card-type", "apps", "goal", "assists"].map((col) => (
                  <div key={col} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {col}
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" onClick={downloadTemplate} className="w-full bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Column names are case-insensitive</p>
              <p>• Derived stats (g+a, g-pm, etc.) auto-calculated</p>
              <p>• First row should contain headers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      {preview.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preview (First 5 Players)</CardTitle>
            <CardDescription>Review the imported data before confirming</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Name</th>
                    <th className="text-left py-2 px-3">Team</th>
                    <th className="text-center py-2 px-3">Pos</th>
                    <th className="text-center py-2 px-3">Age</th>
                    <th className="text-center py-2 px-3">Apps</th>
                    <th className="text-center py-2 px-3">Goals</th>
                    <th className="text-center py-2 px-3">Assists</th>
                    <th className="text-center py-2 px-3">G/M</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((player, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3 font-medium">{player.name}</td>
                      <td className="py-2 px-3">{player.team}</td>
                      <td className="text-center py-2 px-3">{player.position}</td>
                      <td className="text-center py-2 px-3">{player.age}</td>
                      <td className="text-center py-2 px-3">{player.apps}</td>
                      <td className="text-center py-2 px-3">{player.goal}</td>
                      <td className="text-center py-2 px-3">{player.assists}</td>
                      <td className="text-center py-2 px-3">{player.gPm?.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
