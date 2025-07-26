import { IconTool } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SectionCards() {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center space-y-4 p-8">
          <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center">
            <IconTool className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl">Overview Page</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              This dashboard will be designed once the core functionality is built. The
              overview should summarize what's actually in the application, not
              placeholder data.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="w-fit mx-auto">
            Work in Progress
          </Badge>
        </CardHeader>
      </Card>
    </div>
  );
}
