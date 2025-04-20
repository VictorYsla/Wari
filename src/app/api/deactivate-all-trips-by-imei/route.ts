import { NextResponse } from 'next/server'
import { baseURL } from '../helpers'

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const imei = searchParams.get('imei')

  if (!imei) {
    return NextResponse.json({ success: false, message: 'IMEI is required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${baseURL}/trip/deactivate-all-trips-by-imei?imei=${imei}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error while calling Nest backend:', error)
    return NextResponse.json({ success: false, message: 'Failed to deactivate trips' }, { status: 500 })
  }
}
