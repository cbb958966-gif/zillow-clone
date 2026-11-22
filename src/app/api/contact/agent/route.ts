import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

const recipientEmail = process.env.CONTACT_EMAIL || 'cbb958966@gmail.com'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (char) => {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }
  return entities[char]
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      propertyId,
      agentId,
      name,
      email,
      phone,
      message,
      preferredContact
    } = body

    const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const propertyLink = `${origin}/property/${propertyId}`

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    console.log('Contact form submission received:', {
      propertyId,
      hasProperty: Boolean(property)
    })

    const sendEmail = async () => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        replyTo: email,
        to: recipientEmail,
        subject: `New Inquiry for ${property?.title || 'Property'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0066cc;">New Property Inquiry</h2>
            <p><strong>Property:</strong> ${escapeHtml(property?.title || 'N/A')}</p>
            <p><strong>Property Address:</strong> ${escapeHtml(property?.address || 'N/A')}, ${escapeHtml(property?.city || '')}, ${escapeHtml(property?.state || '')} ${escapeHtml(property?.zipCode || '')}</p>
            <p><strong>Listing Link:</strong> <a href="${propertyLink}" style="color: #0066cc;">${propertyLink}</a></p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <h3 style="color: #333;">Client Information</h3>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
            <p><strong>Preferred Contact:</strong> ${escapeHtml(preferredContact || 'Email')}</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <h3 style="color: #333;">Message</h3>
            <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${escapeHtml(message).replace(/\n/g, '<br>')}</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This inquiry was sent from PRIMAHOMES real estate website.</p>
          </div>
        `,
      }

      await transporter.sendMail(mailOptions)
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { error: 'Email delivery is not configured. Please contact the site administrator.' },
        { status: 503 }
      )
    }

    try {
      await transporter.verify()
      await sendEmail()
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      return NextResponse.json(
        { error: 'Your message could not be delivered. Please try again later.' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent. We will contact you soon.',
      data: {
        propertyId,
        agentId,
        name,
        email,
        phone,
        message,
        preferredContact,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Contact API is running',
    methods: ['POST']
  })
}
