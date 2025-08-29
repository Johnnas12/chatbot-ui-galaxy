import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppLayout } from "@/layouts/AppLayout"

const Collections = () => {
  return (
    <AppLayout>
      <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Collections</h1>
        <p className="text-muted-foreground mt-2">
          Organize and manage your chat collections
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Collection {i}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Sample collection with various conversations and topics.
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                {Math.floor(Math.random() * 20) + 1} conversations
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </AppLayout>
  )
}

export default Collections