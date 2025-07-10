import { 
  profileFormSchema, 
  userPreferencesSchema, 
  avatarUploadSchema,
  type ProfileFormData,
  type UserPreferencesData 
} from '../profile-schemas'

describe('Profile Validation Schemas', () => {
  describe('profileFormSchema', () => {
    const validProfileData: ProfileFormData = {
      first_name: 'John',
      last_name: 'Doe',
      display_name: 'johndoe',
      bio: 'Software engineer passionate about building great products.',
      phone_number: '+1234567890',
      company: 'Acme Corp',
      job_title: 'Senior Developer',
      location: 'San Francisco, CA',
      timezone: 'America/Los_Angeles'
    }

    it('validates valid profile data', () => {
      const result = profileFormSchema.safeParse(validProfileData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validProfileData)
      }
    })

    it('validates minimal required data', () => {
      const minimalData = {
        first_name: 'John',
        last_name: 'Doe'
      }
      const result = profileFormSchema.safeParse(minimalData)
      expect(result.success).toBe(true)
    })

    it('rejects empty first name', () => {
      const invalidData = { ...validProfileData, first_name: '' }
      const result = profileFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['first_name'])
        expect(result.error.errors[0].message).toContain('required')
      }
    })

    it('rejects empty last name', () => {
      const invalidData = { ...validProfileData, last_name: '' }
      const result = profileFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['last_name'])
        expect(result.error.errors[0].message).toContain('required')
      }
    })

    it('validates bio with maximum length', () => {
      const longBio = 'A'.repeat(500)
      const validData = { ...validProfileData, bio: longBio }
      const result = profileFormSchema.safeParse(validData)
      expect(result.success).toBe(true)

      const tooLongBio = 'A'.repeat(501)
      const invalidData = { ...validProfileData, bio: tooLongBio }
      const invalidResult = profileFormSchema.safeParse(invalidData)
      expect(invalidResult.success).toBe(false)
    })

    it('validates display name format', () => {
      const validDisplayNames = ['johndoe', 'john_doe', 'john123', 'j']
      validDisplayNames.forEach(displayName => {
        const data = { ...validProfileData, display_name: displayName }
        const result = profileFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      const invalidDisplayNames = ['', 'john@doe', 'john doe', 'john-doe', 'A'.repeat(31)]
      invalidDisplayNames.forEach(displayName => {
        const data = { ...validProfileData, display_name: displayName }
        const result = profileFormSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    it('validates phone number format', () => {
      const validPhones = ['+1234567890', '+44123456789', undefined]
      validPhones.forEach(phone => {
        const data = { ...validProfileData, phone_number: phone }
        const result = profileFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      const invalidPhones = ['1234567890', '123-456-7890', 'invalid']
      invalidPhones.forEach(phone => {
        const data = { ...validProfileData, phone_number: phone }
        const result = profileFormSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    it('validates timezone format', () => {
      const validTimezones = ['America/Los_Angeles', 'Europe/London', 'Asia/Tokyo', undefined]
      validTimezones.forEach(timezone => {
        const data = { ...validProfileData, timezone }
        const result = profileFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      const invalidTimezones = ['PST', 'GMT+5', 'Invalid/Timezone']
      invalidTimezones.forEach(timezone => {
        const data = { ...validProfileData, timezone }
        const result = profileFormSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    it('trims whitespace from string fields', () => {
      const dataWithWhitespace = {
        first_name: '  John  ',
        last_name: '  Doe  ',
        display_name: '  johndoe  ',
        bio: '  Bio content  ',
        company: '  Acme Corp  '
      }
      const result = profileFormSchema.safeParse(dataWithWhitespace)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.first_name).toBe('John')
        expect(result.data.last_name).toBe('Doe')
        expect(result.data.display_name).toBe('johndoe')
        expect(result.data.bio).toBe('Bio content')
        expect(result.data.company).toBe('Acme Corp')
      }
    })
  })

  describe('userPreferencesSchema', () => {
    const validPreferencesData: UserPreferencesData = {
      theme: 'system',
      language: 'en',
      date_format: 'MM/dd/yyyy',
      time_format: '12h',
      email_notifications_enabled: true,
      email_frequency: 'immediate',
      email_digest: true,
      notify_security_alerts: true,
      notify_account_updates: true,
      notify_organization_updates: true,
      notify_project_updates: true,
      notify_mentions: true,
      notify_comments: true,
      notify_invitations: true,
      notify_billing_alerts: true,
      notify_feature_announcements: false,
      browser_notifications_enabled: false,
      desktop_notifications_enabled: false,
      mobile_notifications_enabled: false,
      marketing_emails: false,
      product_updates: true,
      newsletters: false,
      surveys: false,
      profile_visibility: 'organization',
      email_visibility: 'organization',
      activity_visibility: 'organization',
      hide_last_seen: false,
      hide_activity_status: false,
      quiet_hours_enabled: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      timezone_aware: true,
      reduce_motion: false,
      high_contrast: false,
      screen_reader_optimized: false,
      data_retention_period: 365,
      auto_delete_inactive: false,
    }

    it('validates valid preferences data', () => {
      const result = userPreferencesSchema.safeParse(validPreferencesData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validPreferencesData)
      }
    })

    it('validates theme options', () => {
      const validThemes = ['light', 'dark', 'system']
      validThemes.forEach(theme => {
        const data = { ...validPreferencesData, theme }
        const result = userPreferencesSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      const invalidTheme = { ...validPreferencesData, theme: 'invalid' }
      const result = userPreferencesSchema.safeParse(invalidTheme)
      expect(result.success).toBe(false)
    })

    it('validates language options', () => {
      const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh']
      validLanguages.forEach(language => {
        const data = { ...validPreferencesData, language }
        const result = userPreferencesSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      const invalidLanguage = { ...validPreferencesData, language: 'invalid' }
      const result = userPreferencesSchema.safeParse(invalidLanguage)
      expect(result.success).toBe(false)
    })

    it('validates date format options', () => {
      const validFormats = ['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd']
      validFormats.forEach(date_format => {
        const data = { ...validPreferencesData, date_format }
        const result = userPreferencesSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      const invalidFormat = { ...validPreferencesData, date_format: 'invalid' }
      const result = userPreferencesSchema.safeParse(invalidFormat)
      expect(result.success).toBe(false)
    })

    it('validates time format options', () => {
      const validFormats = ['12h', '24h']
      validFormats.forEach(time_format => {
        const data = { ...validPreferencesData, time_format }
        const result = userPreferencesSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      const invalidFormat = { ...validPreferencesData, time_format: 'invalid' }
      const result = userPreferencesSchema.safeParse(invalidFormat)
      expect(result.success).toBe(false)
    })

    it('validates email frequency options', () => {
      const validFrequencies = ['immediate', 'hourly', 'daily', 'weekly']
      validFrequencies.forEach(email_frequency => {
        const data = { ...validPreferencesData, email_frequency }
        const result = userPreferencesSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      const invalidFrequency = { ...validPreferencesData, email_frequency: 'invalid' }
      const result = userPreferencesSchema.safeParse(invalidFrequency)
      expect(result.success).toBe(false)
    })

    it('validates visibility options', () => {
      const validVisibilities = ['public', 'organization', 'private']
      const visibilityFields = ['profile_visibility', 'email_visibility', 'activity_visibility']
      
      visibilityFields.forEach(field => {
        validVisibilities.forEach(visibility => {
          const data = { ...validPreferencesData, [field]: visibility }
          const result = userPreferencesSchema.safeParse(data)
          expect(result.success).toBe(true)
        })

        const invalidData = { ...validPreferencesData, [field]: 'invalid' }
        const result = userPreferencesSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })

    it('validates quiet hours time format', () => {
      const validTimes = ['00:00', '12:30', '23:59']
      validTimes.forEach(time => {
        const data = { 
          ...validPreferencesData, 
          quiet_hours_start: time,
          quiet_hours_end: time
        }
        const result = userPreferencesSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      const invalidTimes = ['24:00', '12:60', 'noon', '12']
      invalidTimes.forEach(time => {
        const data = { ...validPreferencesData, quiet_hours_start: time }
        const result = userPreferencesSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    it('validates data retention period range', () => {
      const validPeriods = [30, 365, 2555]
      validPeriods.forEach(period => {
        const data = { ...validPreferencesData, data_retention_period: period }
        const result = userPreferencesSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      const invalidPeriods = [29, 2556, -1]
      invalidPeriods.forEach(period => {
        const data = { ...validPreferencesData, data_retention_period: period }
        const result = userPreferencesSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    it('validates boolean fields', () => {
      const booleanFields = [
        'email_notifications_enabled', 'email_digest', 'notify_security_alerts',
        'browser_notifications_enabled', 'marketing_emails', 'hide_last_seen',
        'reduce_motion', 'high_contrast', 'auto_delete_inactive'
      ]

      booleanFields.forEach(field => {
        [true, false].forEach(value => {
          const data = { ...validPreferencesData, [field]: value }
          const result = userPreferencesSchema.safeParse(data)
          expect(result.success).toBe(true)
        })

        const invalidData = { ...validPreferencesData, [field]: 'invalid' }
        const result = userPreferencesSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('avatarUploadSchema', () => {
    const createMockFile = (name: string, size: number, type: string): File => {
      const file = new File([''], name, { type })
      Object.defineProperty(file, 'size', { value: size, writable: false })
      return file
    }

    it('validates valid avatar upload', () => {
      const validFile = createMockFile('avatar.jpg', 1024 * 1024, 'image/jpeg')
      const data = {
        file: validFile,
        replace_existing: false
      }
      const result = avatarUploadSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('accepts valid image types', () => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      validTypes.forEach(type => {
        const file = createMockFile('avatar.jpg', 1024 * 1024, type)
        const data = { file, replace_existing: false }
        const result = avatarUploadSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('rejects invalid file types', () => {
      const invalidTypes = ['text/plain', 'application/pdf', 'video/mp4']
      invalidTypes.forEach(type => {
        const file = createMockFile('file.txt', 1024, type)
        const data = { file, replace_existing: false }
        const result = avatarUploadSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    it('validates file size limits', () => {
      // Valid size (5MB)
      const validFile = createMockFile('avatar.jpg', 5 * 1024 * 1024, 'image/jpeg')
      const validData = { file: validFile, replace_existing: false }
      const validResult = avatarUploadSchema.safeParse(validData)
      expect(validResult.success).toBe(true)

      // Too large (6MB)
      const largeFile = createMockFile('avatar.jpg', 6 * 1024 * 1024, 'image/jpeg')
      const largeData = { file: largeFile, replace_existing: false }
      const largeResult = avatarUploadSchema.safeParse(largeData)
      expect(largeResult.success).toBe(false)

      // Empty file
      const emptyFile = createMockFile('avatar.jpg', 0, 'image/jpeg')
      const emptyData = { file: emptyFile, replace_existing: false }
      const emptyResult = avatarUploadSchema.safeParse(emptyData)
      expect(emptyResult.success).toBe(false)
    })

    it('validates replace_existing boolean', () => {
      const file = createMockFile('avatar.jpg', 1024 * 1024, 'image/jpeg')
      
      [true, false].forEach(replace_existing => {
        const data = { file, replace_existing }
        const result = avatarUploadSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      const invalidData = { file, replace_existing: 'invalid' }
      const result = avatarUploadSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('has default value for replace_existing', () => {
      const file = createMockFile('avatar.jpg', 1024 * 1024, 'image/jpeg')
      const data = { file }
      const result = avatarUploadSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.replace_existing).toBe(false)
      }
    })
  })
})