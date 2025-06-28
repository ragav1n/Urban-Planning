"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Bot, User, Download, Loader2, X, ArrowDown, Clock } from "lucide-react"

interface Ward {
  ward_no: number
  ward_name: string
  population: number
  area_sqkm: number
}

interface AnalysisResult {
  overall_assessment: string
  zone_viability: string
  population_analysis: string
  infrastructure_implications: string
  administrative_efficiency: string
  development_opportunities: string
  challenges: string
  recommendations: string[]
  estimated_cost?: string
  timeline?: string
  priority_score?: number
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ZoneChatProps {
  selectedWards: Ward[]
  analysisResult: AnalysisResult
  isVisible: boolean
  onClose: () => void
}

export default function ZoneChat({ selectedWards, analysisResult, isVisible, onClose }: ZoneChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello! I'm your zoning assistant. I can help you understand the analysis for your selected ${selectedWards.length} ward${selectedWards.length !== 1 ? "s" : ""} and answer any questions about optimal zoning strategies.

**Selected Wards:** ${selectedWards.map((w) => `Ward ${w.ward_no} (${w.ward_name})`).join(", ")}

**Key Insights:**
• Priority Score: ${analysisResult.priority_score}/100
• Estimated Cost: ${analysisResult.estimated_cost}
• Timeline: ${analysisResult.timeline}

What would you like to know more about?`,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollButton(!isNearBottom)
  }

  useEffect(() => {
    if (isVisible) {
      scrollToBottom()
    }
  }, [isVisible, messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/zoning/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          selectedWards,
          analysisResult,
          chatHistory: messages,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error("Failed to get response")
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const downloadChatHistory = () => {
    const totalPopulation = selectedWards.reduce((sum, ward) => sum + ward.population, 0)
    const totalArea = selectedWards.reduce((sum, ward) => sum + ward.area_sqkm, 0)

    const chatContent = `
ZONING CHAT HISTORY & ANALYSIS REPORT
Generated on: ${new Date().toLocaleString()}

===========================================
ZONE CONFIGURATION
===========================================
Selected Wards: ${selectedWards.length}
Ward Details: ${selectedWards.map((w) => `Ward ${w.ward_no} (${w.ward_name})`).join(", ")}
Total Population: ${totalPopulation.toLocaleString()}
Total Area: ${totalArea.toFixed(1)} km²
Average Density: ${Math.round(totalPopulation / totalArea)}/km²

===========================================
ANALYSIS SUMMARY
===========================================
Priority Score: ${analysisResult.priority_score}/100
Estimated Cost: ${analysisResult.estimated_cost}
Timeline: ${analysisResult.timeline}

Overall Assessment:
${analysisResult.overall_assessment}

Key Recommendations:
${analysisResult.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join("\n")}

===========================================
CHAT CONVERSATION
===========================================
${messages
  .map(
    (msg) => `
[${msg.timestamp.toLocaleTimeString()}] ${msg.role.toUpperCase()}:
${msg.content}
`,
  )
  .join("\n")}

===========================================
DETAILED ANALYSIS
===========================================

Zone Viability:
${analysisResult.zone_viability}

Population Analysis:
${analysisResult.population_analysis}

Infrastructure Implications:
${analysisResult.infrastructure_implications}

Administrative Efficiency:
${analysisResult.administrative_efficiency}

Development Opportunities:
${analysisResult.development_opportunities}

Challenges:
${analysisResult.challenges}

===========================================
WARD BREAKDOWN
===========================================
${selectedWards
  .map(
    (ward) => `
Ward ${ward.ward_no}: ${ward.ward_name}
- Population: ${ward.population.toLocaleString()}
- Area: ${ward.area_sqkm} km²
- Density: ${Math.round(ward.population / ward.area_sqkm)}/km²
`,
  )
  .join("")}

===========================================
END OF REPORT
===========================================
    `.trim()

    const blob = new Blob([chatContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `zoning-chat-${selectedWards.length}wards-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatMessage = (content: string) => {
    // Convert markdown-like formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/•/g, "•")
      .split("\n")
      .map((line, index) => (
        <div key={index} className={line.trim() === "" ? "h-2" : ""}>
          <span dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }} />
        </div>
      ))
  }

  if (!isVisible) return null

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-400" />
            Zoning Assistant Chat
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={downloadChatHistory} className="text-gray-400 hover:text-white">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedWards.slice(0, 3).map((ward) => (
            <Badge key={ward.ward_no} variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-500/30">
              Ward {ward.ward_no}
            </Badge>
          ))}
          {selectedWards.length > 3 && (
            <Badge variant="secondary" className="bg-gray-600/20 text-gray-300">
              +{selectedWards.length - 3} more
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 relative">
          <ScrollArea className="h-full px-4" ref={scrollAreaRef} onScrollCapture={handleScroll}>
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-700/50 text-gray-100"
                    }`}
                  >
                    <div className="text-sm leading-relaxed">{formatMessage(message.content)}</div>
                    <div className="flex items-center gap-1 mt-2 opacity-70">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{message.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-700/50 text-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {showScrollButton && (
            <Button
              onClick={scrollToBottom}
              size="sm"
              className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 p-0"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Separator className="bg-gray-700" />

        <div className="p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about zoning strategies, costs, timelines..."
              className="flex-1 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
