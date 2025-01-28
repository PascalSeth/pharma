import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient('https://ujochwqfrntumhlfifvd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqb2Nod3Fmcm50dW1obGZpZnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3OTAxMjQsImV4cCI6MjA1MTM2NjEyNH0.pYdJMzvb2YZpYiW-oU1Fj06aM95VVAm4NBrojdocCYo')
