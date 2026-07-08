import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SECRET_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

async function testSMTP() {
  console.log('Fetching SMTP settings...')
  const { data: settings, error } = await supabaseAdmin.from('smtp_settings').select('*').single()
  
  if (error) {
    console.error('Error fetching settings:', error)
    return
  }
  
  console.log('Settings found:', { 
    host: settings.host, 
    port: settings.port, 
    username: settings.username,
    from_email: settings.from_email 
  })
  
  const transport = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.port === 465,
    auth: {
      user: settings.username,
      pass: settings.password,
    },
  })
  console.log('Password being used:', settings.password)
  
  try {
    console.log('Verifying connection...')
    await transport.verify()
    console.log('Connection verified!')
    
    console.log('Sending test email...')
    const info = await transport.sendMail({
      from: `"${settings.from_name}" <${settings.from_email}>`,
      to: 'servingbuilderapp@gmail.com',
      subject: 'Test directly from script',
      text: 'This is a test.',
    })
    console.log('Email sent:', info.response)
  } catch (err: any) {
    console.error('SMTP Error:', err.message)
  }
}

testSMTP()
