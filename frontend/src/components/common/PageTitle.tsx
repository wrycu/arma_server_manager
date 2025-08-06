import { type ReactNode } from "react"

interface BreadcrumbItem {
  label: string
  onClick?: () => void
}

interface PageTitleProps {
  title: string
  description?: string
  actions?: ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

export function PageTitle({
  title,
  description,
  actions,
  breadcrumbs,
}: PageTitleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <>
              {breadcrumbs.map((item, index) => (
                <span key={index}>
                  <button
                    onClick={item.onClick}
                    className={`font-medium transition-all duration-200 ${
                      item.onClick
                        ? "text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-muted/50"
                        : "text-muted-foreground"
                    }`}
                    disabled={!item.onClick}
                  >
                    {item.label}
                  </button>
                  {index < breadcrumbs.length - 1 && (
                    <span className="text-muted-foreground/60 mx-2">/</span>
                  )}
                </span>
              ))}
              <span className="text-muted-foreground/60 mx-2">/</span>
            </>
          )}
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}
