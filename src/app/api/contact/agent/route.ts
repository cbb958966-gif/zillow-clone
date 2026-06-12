import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      propertyId, 
      agentId, 
      agentEmail,
      name, 
      email, 
      phone, 
      message,
      preferredContact 
    } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        agent: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    const agentContactEmail = agentEmail || property?.agent?.user?.email
    const agentName = property?.agent 
      ? `${property.agent.user?.firstName || ''} ${property.agent.user?.lastName || ''}`.trim()
      : 'Real Estate Agent'

    console.log('Contact form submission:', {
      propertyId,
      agentId,
      name,
      email,
      phone,
      message,
      preferredContact,
      propertyTitle: property?.title,
      agentContactEmail,
      agentName
    })

    const sendEmail = async () => {
      const recipientEmail = process.env.EMAIL_USER
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        replyTo: email,
        to: process.env.EMAIL_USER,
        subject: `New Inquiry for ${property?.title || 'Property'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0066cc;">New Property Inquiry</h2>
            <p><strong>Property:</strong> ${property?.title || 'N/A'}</p>
            <p><strong>Property Address:</strong> ${property?.address || 'N/A'}, ${property?.city || ''}, ${property?.state || ''} ${property?.zipCode || ''}</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <h3 style="color: #333;">Client Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Preferred Contact:</strong> ${preferredContact || 'Email'}</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <h3 style="color: #333;">Message</h3>
            <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This inquiry was sent from HomeVista real estate website.</p>
          </div>
        `,
      }

      await transporter.sendMail(mailOptions)
    }

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await transporter.verify()
        console.log('Email transporter verified successfully')
        await sendEmail()
        console.log('Email sent successfully')
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
      }
    } else {
      console.log('Email not configured - skipping email send')
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent to the agent. They will contact you soon.',
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
