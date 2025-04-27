import { NextRequest, NextResponse } from 'next/server'
import { baseURL } from '../helpers'

export async function PATCH(request: NextRequest) {
  try {
    // Leer el body que ahora tendrá id e is_active
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ success: false, message: 'Trip ID is required' }, { status: 400 })
    }

    // Enviar id y el resto del body al backend
    const response = await fetch(`${baseURL}/trip/update-trip?id=${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      throw new Error(`Error from backend: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update trip' }, { status: 500 })
  }
}
