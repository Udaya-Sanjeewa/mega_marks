'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import AdminNav from '@/components/AdminNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Save, Search, RefreshCw } from 'lucide-react'

interface SEOSettings {
  id: string
  page_type: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  og_title: string
  og_description: string
}

export default function SEOSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_title: '',
    og_description: '',
  })
  const [settingsId, setSettingsId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login')
    } else if (user) {
      fetchSEOSettings()
    }
  }, [user, loading, router])

  const fetchSEOSettings = async () => {
    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .eq('page_type', 'vehicles')
      .maybeSingle()

    if (!error && data) {
      setFormData({
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        meta_keywords: data.meta_keywords || '',
        og_title: data.og_title || '',
        og_description: data.og_description || '',
      })
      setSettingsId(data.id)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const settingsData = {
        page_type: 'vehicles',
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords,
        og_title: formData.og_title,
        og_description: formData.og_description,
        updated_at: new Date().toISOString(),
      }

      if (settingsId) {
        const { error } = await supabase
          .from('seo_settings')
          .update(settingsData)
          .eq('id', settingsId)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('seo_settings')
          .insert([settingsData])
          .select()
          .single()

        if (error) throw error
        if (data) setSettingsId(data.id)
      }

      toast({
        title: 'Success',
        description: 'SEO settings updated successfully. All vehicle ads will use these meta tags.',
      })
    } catch (error) {
      console.error('Error saving SEO settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save SEO settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    fetchSEOSettings()
    toast({
      title: 'Reset',
      description: 'Form reset to saved values',
    })
  }

  if (loading || !user) {
    return null
  }

  return (
    <div className="flex">
      <AdminNav />
      <div className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Search className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">SEO Settings</h1>
              </div>
              <p className="text-gray-600">
                Configure meta tags for all vehicle advertisement pages. These settings will apply to every vehicle detail page.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Vehicle Pages SEO Configuration</CardTitle>
                <CardDescription>
                  Set default meta tags that will be applied to all vehicle detail pages. This helps improve search engine visibility.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Search className="h-5 w-5 text-blue-600" />
                      Basic Meta Tags
                    </h3>

                    <div>
                      <Label htmlFor="meta_title">Meta Title</Label>
                      <Input
                        id="meta_title"
                        value={formData.meta_title}
                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                        placeholder="Electric Vehicles for Sale | Mega Marks"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 50-60 characters. Currently: {formData.meta_title.length}/60
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="meta_description">Meta Description</Label>
                      <Textarea
                        id="meta_description"
                        value={formData.meta_description}
                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                        placeholder="Browse our selection of high-quality electric vehicles..."
                        rows={3}
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 150-160 characters. Currently: {formData.meta_description.length}/160
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="meta_keywords">Meta Keywords</Label>
                      <Textarea
                        id="meta_keywords"
                        value={formData.meta_keywords}
                        onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                        placeholder="electric vehicles, EV for sale, Nissan Leaf, electric cars, eco-friendly vehicles"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Comma-separated keywords. Example: electric vehicles, EV for sale, Nissan Leaf
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Open Graph Tags (Social Media)</h3>

                    <div>
                      <Label htmlFor="og_title">OG Title (Facebook, LinkedIn)</Label>
                      <Input
                        id="og_title"
                        value={formData.og_title}
                        onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                        placeholder="Electric Vehicles for Sale | Mega Marks"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Title shown when shared on social media
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="og_description">OG Description</Label>
                      <Textarea
                        id="og_description"
                        value={formData.og_description}
                        onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                        placeholder="Browse our selection of high-quality electric vehicles..."
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Description shown when shared on social media
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save SEO Settings
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={saving}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">How It Works</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>These settings apply to all vehicle detail pages automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Individual vehicle information (title, price, specs) will be combined with these base tags</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Changes take effect immediately on all vehicle pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Keywords help search engines understand your content better</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
