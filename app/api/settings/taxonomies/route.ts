import { NextRequest, NextResponse } from 'next/server'
import { getSettings, saveSettings } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET /api/settings/taxonomies - Get all taxonomies
export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json(settings.taxonomies || {})
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/settings/taxonomies - Bulk update taxonomies
export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const settings = await getSettings()
    settings.taxonomies = body
    await saveSettings(settings)
    return NextResponse.json(settings.taxonomies)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
