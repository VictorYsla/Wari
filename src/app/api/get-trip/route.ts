import { NextRequest, NextResponse } from 'next/server'
import { baseURL } from '../helpers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Trip ID is required' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(`${baseURL}/trip/get-trip-by-id?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch trip' },
      { status: 500 }
    )
  }
}
