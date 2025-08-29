import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/layouts/AppLayout"

const Histories = () => {
  const histories = [
    { id: 1, title: "Project Planning Discussion", date: "2024-08-29", messages: 24 },
    { id: 2, title: "Code Review Session", date: "2024-08-28", messages: 12 },
    { id: 3, title: "API Integration Help", date: "2024-08-27", messages: 18 },
    { id: 4, title: "Database Design Chat", date: "2024-08-26", messages: 31 },
    { id: 5, title: "UI/UX Feedback", date: "2024-08-25", messages: 15 },
  ]

  return (
    <AppLayout>
      <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Chat Histories</h1>
        <p className="text-muted-foreground mt-2">
          Browse your previous conversation histories
        </p>
      </div>
      
      <div className="space-y-4">
        {histories.map((history) => (
          <Card key={history.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{history.title}</CardTitle>
                <Badge variant="secondary">{history.messages} messages</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Last updated: {history.date}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </AppLayout>
  )
}

export default Histories