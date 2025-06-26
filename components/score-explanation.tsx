"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react"

interface ScoreExplanationProps {
  slum?: {
    slumName: string
    redevelopmentScore: number
    notified: string
    population: number
    households: number
    tapPoints: number
    latrinesFlush: number
    latrinesPit: number
    electricityDomestic: number
    pavedRoads: number
  }
}

export default function ScoreExplanation({ slum }: ScoreExplanationProps) {
  if (!slum) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Scores & Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="text-white font-semibold mb-2">Redevelopment Score (0-100)</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-300 text-sm">75-100: Urgent Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-gray-300 text-sm">60-75: Medium Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-300 text-sm">0-60: Low Priority</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-700">
              <h4 className="text-white font-semibold mb-2">Notification Status</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-300 text-sm">Notified: Legally protected, eligible for schemes</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-gray-300 text-sm">Not Notified: No legal protection, limited access</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score > 75) return "text-red-400"
    if (score >= 60) return "text-orange-400"
    return "text-green-400"
  }

  const getScoreDescription = (score: number) => {
    if (score > 75) return "Urgent intervention needed"
    if (score >= 60) return "Moderate intervention needed"
    return "Relatively stable conditions"
  }

  const getPriorityLevel = (score: number) => {
    if (score > 75) return "HIGH"
    if (score >= 60) return "MEDIUM"
    return "LOW"
  }

  // Calculate individual component scores for explanation
  const waterScore = Math.min((slum.tapPoints / Math.max(slum.households * 0.1, 1)) * 100, 100)
  const toiletScore = Math.min(
    ((slum.latrinesFlush + slum.latrinesPit) / Math.max(slum.households * 0.2, 1)) * 100,
    100,
  )
  const electricityScore = Math.min((slum.electricityDomestic / Math.max(slum.households, 1)) * 100, 100)
  const roadScore = Math.min((slum.pavedRoads / Math.max(slum.population * 0.001, 0.1)) * 100, 100)

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Score Breakdown: {slum.slumName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center p-4 bg-gray-700/50 rounded-lg">
          <div className={`text-4xl font-bold ${getScoreColor(slum.redevelopmentScore)}`}>
            {slum.redevelopmentScore}/100
          </div>
          <div className="text-gray-300 text-sm mt-1">{getScoreDescription(slum.redevelopmentScore)}</div>
          <Badge
            variant={
              slum.redevelopmentScore > 75 ? "destructive" : slum.redevelopmentScore >= 60 ? "secondary" : "default"
            }
            className="mt-2"
          >
            {getPriorityLevel(slum.redevelopmentScore)} PRIORITY
          </Badge>
        </div>

        {/* Component Breakdown */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold">Infrastructure Components:</h4>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Water Access</span>
                <span className="text-white">{Math.round(waterScore)}/100</span>
              </div>
              <Progress value={waterScore} className="h-2" />
              <p className="text-xs text-gray-400 mt-1">
                {slum.tapPoints} tap points for {slum.households} households
                {waterScore < 50 ? " ⚠️ Insufficient" : waterScore < 80 ? " ⚖️ Adequate" : " ✅ Good"}
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Sanitation</span>
                <span className="text-white">{Math.round(toiletScore)}/100</span>
              </div>
              <Progress value={toiletScore} className="h-2" />
              <p className="text-xs text-gray-400 mt-1">
                {slum.latrinesFlush + slum.latrinesPit} toilets for {slum.households} households
                {toiletScore < 50 ? " ⚠️ Insufficient" : toiletScore < 80 ? " ⚖️ Adequate" : " ✅ Good"}
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Electricity</span>
                <span className="text-white">{Math.round(electricityScore)}/100</span>
              </div>
              <Progress value={electricityScore} className="h-2" />
              <p className="text-xs text-gray-400 mt-1">
                {slum.electricityDomestic} connections for {slum.households} households
                {electricityScore < 50
                  ? " ⚠️ Poor coverage"
                  : electricityScore < 80
                    ? " ⚖️ Partial coverage"
                    : " ✅ Good coverage"}
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Road Infrastructure</span>
                <span className="text-white">{Math.round(roadScore)}/100</span>
              </div>
              <Progress value={roadScore} className="h-2" />
              <p className="text-xs text-gray-400 mt-1">
                {slum.pavedRoads} km paved roads for {slum.population} people
                {roadScore < 50 ? " ⚠️ Poor access" : roadScore < 80 ? " ⚖️ Basic access" : " ✅ Good access"}
              </p>
            </div>
          </div>
        </div>

        {/* Notification Status */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold">Legal Status</h4>
            {slum.notified === "Yes" ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Notified
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Not Notified
              </Badge>
            )}
          </div>

          {slum.notified === "Yes" ? (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-green-300 font-medium mb-1">Officially Recognized Slum</p>
                  <ul className="text-green-200 text-xs space-y-1">
                    <li>• Protected from arbitrary eviction</li>
                    <li>• Eligible for government housing schemes</li>
                    <li>• Can receive infrastructure upgrades</li>
                    <li>• Residents have legal documentation rights</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-red-300 font-medium mb-1">Unrecognized Settlement</p>
                  <ul className="text-red-200 text-xs space-y-1">
                    <li>• Risk of sudden eviction or demolition</li>
                    <li>• Limited access to government programs</li>
                    <li>• No legal protection for residents</li>
                    <li>• Often excluded from city development plans</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Recommendations */}
        <div className="pt-4 border-t border-gray-700">
          <h4 className="text-white font-semibold mb-3">Recommended Actions</h4>
          <div className="space-y-2 text-sm">
            {slum.redevelopmentScore > 75 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-red-300">Immediate intervention required - allocate emergency resources</span>
              </div>
            )}

            {slum.notified === "No" && (
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-blue-300">Priority: Begin notification process for legal protection</span>
              </div>
            )}

            {waterScore < 50 && (
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full mt-0.5 flex-shrink-0"></div>
                <span className="text-blue-300">Install additional water tap points or tanker supply</span>
              </div>
            )}

            {toiletScore < 50 && (
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full mt-0.5 flex-shrink-0"></div>
                <span className="text-green-300">Build community toilet blocks or individual latrines</span>
              </div>
            )}

            {electricityScore < 50 && (
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mt-0.5 flex-shrink-0"></div>
                <span className="text-yellow-300">Extend electrical grid or provide solar solutions</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
