import { NextRequest, NextResponse } from 'next/server'
import { baseURL } from '../helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Trip ID is required' },
        { status: 400 }
      )
    }

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
