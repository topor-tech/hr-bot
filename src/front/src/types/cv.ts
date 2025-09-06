export interface CV {
  id: number
  name: string
  uploaded_at: string
  file_id: number
  file_original_filename: string | null
  file_s3_key: string | null
  file_extension: string | null
  pdf_file_id: number | null
  pdf_file_original_filename: string | null
  pdf_file_s3_key: string | null
  pdf_file_extension: string | null
  extracted_text: string | null
  phone_number: string | null
  email: string | null
  telegram: string | null
  tags: string[] | null
}
