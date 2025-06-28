import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ZoningLoading() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-96 mx-auto bg-gray-800" />
          <Skeleton className="h-6 w-[500px] mx-auto bg-gray-800" />
        </div>

        {/* Statistics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-800/50 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-5 bg-gray-700" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-gray-700" />
                    <Skeleton className="h-8 w-16 bg-gray-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ward Selection Interface Skeleton */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <Skeleton className="h-10 w-full bg-gray-700" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg border border-gray-600 bg-gray-900/50">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-5 w-20 bg-gray-700" />
                    <Skeleton className="h-4 w-4 bg-gray-700" />
                  </div>
                  <Skeleton className="h-4 w-32 mb-2 bg-gray-700" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-full bg-gray-700" />
                    <Skeleton className="h-3 w-full bg-gray-700" />
                    <Skeleton className="h-3 w-full bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analyze Button Skeleton */}
        <div className="text-center">
          <Skeleton className="h-12 w-40 mx-auto bg-gray-800" />
        </div>
      </div>
    </div>
  )
}
