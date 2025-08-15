import React, { useState, useEffect } from 'react'
import { usePlanStore } from '@/store/planStore'
import { generateShareUrl } from '@/lib/share'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Copy, Check, ExternalLink } from 'lucide-react'

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareModal({ open, onOpenChange }: ShareModalProps) {
  const { plan } = usePlanStore()
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) {
      try {
        console.log('📱 ShareModal: Generating URL for plan:', plan)
        const url = generateShareUrl(plan)
        console.log('✅ ShareModal: Generated URL:', url.substring(0, 100) + '...')
        setShareUrl(url)
      } catch (error) {
        console.error('❌ ShareModal: Failed to generate share URL:', error)
        setShareUrl(`Error: ${error.message}`)
      }
    }
  }, [plan, open])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleOpenUrl = () => {
    window.open(shareUrl, '_blank')
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="text-slate-900">Share Your Plan</DrawerTitle>
          <DrawerDescription className="text-slate-600">
            Share your financial plan with others or save it for later
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 px-4 overflow-y-auto">
          <div className="space-y-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="shareUrl">Shareable Link</Label>
            <div className="flex gap-2">
              <Input
                id="shareUrl"
                value={shareUrl}
                readOnly
                className="rounded-xl border-slate-200 font-mono text-sm"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 px-3"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={handleOpenUrl}
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 px-3"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              This link contains all your plan data. Anyone with this link can view your plan.
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
            <h4 className="font-medium text-emerald-900 mb-2">🔐 Privacy Notice</h4>
            <div className="text-sm text-emerald-800 space-y-1">
              <div>• Your plan data is stored locally in your browser</div>
              <div>• No data is stored on our servers</div>
              <div>• Links expire automatically after 30 days</div>
              <div>• Only share with people you trust</div>
              <div>• Links contain financial information</div>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
            <h4 className="font-medium text-blue-900 mb-2">✨ Ultra-Short URLs</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>• Maximum 10 characters for easy sharing</div>
              <div>• Links work across devices with shared browser data</div>
              <div>• Automatic cleanup of expired plans</div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <h4 className="font-medium text-slate-900 mb-2">Plan Summary</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <div>Profile: {plan.profile.name}, Age {plan.profile.age}</div>
              <div>Total Goals: {plan.goals.length}</div>
              <div>Total Savings: ₹{(plan.profile.savings.toNumber() / 100000).toFixed(1)}L</div>
            </div>
          </div>
          </div>
        </div>

        <DrawerFooter className="flex-shrink-0 border-t border-slate-100">
          <DrawerClose asChild>
            <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700">
              Done
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}