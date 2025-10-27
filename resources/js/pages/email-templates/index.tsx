import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { PageTemplate } from '@/components/page-template'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Search, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface EmailTemplate {
  id: number
  name: string
  from: string
  created_at: string
  email_template_langs: Array<{
    id: number
    lang: string
    subject: string
  }>
}

interface Props {
  templates: {
    data: EmailTemplate[]
    from: number
    to: number
    total: number
    links: Array<{
      url: string | null
      label: string
      active: boolean
    }>
  }
  filters: {
    search?: string
    sort_field?: string
    sort_direction?: string
    per_page?: number
  }
}

export default function EmailTemplatesIndex({ templates, filters: pageFilters = {} }: Props) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '')

  const handleAction = (action: string, item: EmailTemplate) => {
    if (action === 'view') {
      router.get(route('email-templates.show', item.id))
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  const applyFilters = () => {
    const params: any = { page: 1 }
    
    if (searchTerm) {
      params.search = searchTerm
    }
    
    if (pageFilters.per_page) {
      params.per_page = pageFilters.per_page
    }
    
    router.get(route('email-templates.index'), params, { preserveState: true, preserveScroll: true })
  }

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc'
    
    const params: any = { 
      sort_field: field, 
      sort_direction: direction, 
      page: 1 
    }
    
    if (searchTerm) {
      params.search = searchTerm
    }
    
    if (pageFilters.per_page) {
      params.per_page = pageFilters.per_page
    }
    
    router.get(route('email-templates.index'), params, { preserveState: true, preserveScroll: true })
  }



  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Email Templates') }
  ]

  const columns = [
    { 
      key: 'name', 
      label: t('Name'), 
      sortable: true
    }
  ]

  return (
    <PageTemplate 
      title={t('Email Templates')} 
      url={route('email-templates.index')}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      <Head title="Email Templates" />
      
      {/* Search section */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("Search templates...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9"
                />
              </div>
              <Button type="submit" size="sm">
                <Search className="h-4 w-4 mr-1.5" />
                {t("Search")}
              </Button>
            </form>
            
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">{t("Per Page:")}</Label>
              <Select 
                value={pageFilters.per_page?.toString() || "10"} 
                onValueChange={(value) => {
                  const params: any = { page: 1, per_page: parseInt(value) }
                  
                  if (searchTerm) {
                    params.search = searchTerm
                  }
                  
                  router.get(route('email-templates.index'), params, { preserveState: true, preserveScroll: true })
                }}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {columns.map((column) => (
                  <th 
                    key={column.key} 
                    className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && (
                        <span className="ml-1">
                          {pageFilters.sort_field === column.key ? (
                            pageFilters.sort_direction === 'asc' ? '↑' : '↓'
                          ) : ''}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium text-gray-500">
                  {t("Actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {templates?.data?.map((template: EmailTemplate) => (
                <tr key={template.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{template.name}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleAction('view', template)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('View')}</TooltipContent>
                    </Tooltip>
                  </td>
                </tr>
              ))}
              
              {(!templates?.data || templates.data.length === 0) && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                    {t("No email templates found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination section */}
        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t("Showing")} <span className="font-medium">{templates?.from || 0}</span> {t("to")} <span className="font-medium">{templates?.to || 0}</span> {t("of")} <span className="font-medium">{templates?.total || 0}</span> {t("templates")}
          </div>
          
          <div className="flex gap-1">
            {templates?.links?.map((link: any, i: number) => {
              const isTextLink = link.label === "&laquo; Previous" || link.label === "Next &raquo;"
              const label = link.label.replace("&laquo; ", "").replace(" &raquo;", "")
              
              return (
                <Button
                  key={i}
                  variant={link.active ? 'default' : 'outline'}
                  size={isTextLink ? "sm" : "icon"}
                  className={isTextLink ? "px-3" : "h-8 w-8"}
                  disabled={!link.url}
                  onClick={() => link.url && router.get(link.url)}
                >
                  {isTextLink ? label : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}