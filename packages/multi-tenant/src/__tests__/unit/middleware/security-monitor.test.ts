import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SecurityMonitor, withSecurityMonitoring } from '../../../middleware/security-monitor'
import { NextRequest, NextResponse } from 'next/server'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    group: vi.fn().mockReturnThis(),
    having: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    mockResolvedValue: vi.fn()
  })),
  rpc: vi.fn()
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}))

describe('SecurityMonitor', () => {
  let monitor: SecurityMonitor
  const mockContext = {
    organizationId: 'org-123',
    userId: 'user-456',
    role: 'admin' as const,
    permissions: ['*']
  }

  beforeEach(() => {
    vi.clearAllMocks()
    monitor = SecurityMonitor.getInstance()
  })

  describe('Threat Detection', () => {
    describe('SQL Injection Detection', () => {
      it('should detect SQL injection patterns', () => {
        const maliciousInputs = [
          "'; DROP TABLE users; --",
          "1' OR '1'='1",
          "UNION SELECT * FROM passwords",
          "'; INSERT INTO admin VALUES('hacker'); --"
        ]

        maliciousInputs.forEach(input => {
          expect(monitor.detectSQLInjection(input)).toBe(true)
        })
      })

      it('should not flag legitimate inputs', () => {
        const legitimateInputs = [
          "John's Restaurant",
          "Search for 'best practices'",
          "Email: john@company.com",
          "Description: This is a normal description"
        ]

        legitimateInputs.forEach(input => {
          expect(monitor.detectSQLInjection(input)).toBe(false)
        })
      })

      it('should detect case-insensitive SQL keywords', () => {
        expect(monitor.detectSQLInjection('select * from users')).toBe(true)
        expect(monitor.detectSQLInjection('SELECT * FROM users')).toBe(true)
        expect(monitor.detectSQLInjection('SeLeCt * FrOm users')).toBe(true)
      })
    })

    describe('XSS Detection', () => {
      it('should detect XSS patterns', () => {
        const xssInputs = [
          '<script>alert("xss")</script>',
          'javascript:alert(document.cookie)',
          '<iframe src="http://malicious.com"></iframe>',
          '<img onerror="alert(1)" src="x">',
          'onclick="maliciousFunction()"'
        ]

        xssInputs.forEach(input => {
          expect(monitor.detectXSS(input)).toBe(true)
        })
      })

      it('should not flag legitimate HTML', () => {
        const legitimateInputs = [
          '<p>This is a paragraph</p>',
          '<div class="container">Content</div>',
          'Email me at: user@domain.com'
        ]

        legitimateInputs.forEach(input => {
          expect(monitor.detectXSS(input)).toBe(false)
        })
      })
    })

    describe('Directory Traversal Detection', () => {
      it('should detect directory traversal attempts', () => {
        const traversalInputs = [
          '../../../etc/passwd',
          '..\\windows\\system32',
          '/etc/passwd',
          '/proc/self/environ',
          '%00%2e%2e%2f'
        ]

        traversalInputs.forEach(input => {
          expect(monitor.detectSuspiciousActivity(input)).toBe(true)
        })
      })
    })
  })

  describe('Request Analysis', () => {
    it('should analyze URL for threats', async () => {
      const maliciousUrl = 'http://localhost/api/users?id=1\' OR 1=1 --'
      const request = new NextRequest(maliciousUrl)

      const threats = await monitor.analyzeRequest(request, mockContext)

      expect(threats).toHaveLength(1)
      expect(threats[0].type).toBe('SQL_INJECTION')
      expect(threats[0].severity).toBe('HIGH')
    })

    it('should analyze request body for threats', async () => {
      const maliciousBody = JSON.stringify({
        comment: '<script>alert("xss")</script>'
      })

      const request = new NextRequest('http://localhost/api/comments', {
        method: 'POST',
        body: maliciousBody,
        headers: { 'content-type': 'application/json' }
      })

      const threats = await monitor.analyzeRequest(request, mockContext)

      expect(threats.length).toBeGreaterThan(0)
      expect(threats.some(t => t.type === 'XSS_ATTEMPT')).toBe(true)
    })

    it('should analyze headers for suspicious content', async () => {
      const request = new NextRequest('http://localhost/api/test', {
        headers: {
          'x-custom-header': 'SELECT * FROM users',
          'user-agent': 'Mozilla/5.0'
        }
      })

      const threats = await monitor.analyzeRequest(request, mockContext)

      expect(threats.some(t => t.type === 'SUSPICIOUS_ACTIVITY')).toBe(true)
    })

    it('should detect IP lockout attempts', async () => {
      // Mock IP lockout check
      vi.spyOn(monitor, 'isLockedOut').mockReturnValue(true)

      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.100' }
      })

      const threats = await monitor.analyzeRequest(request, mockContext)

      expect(threats.some(t => t.type === 'BRUTE_FORCE')).toBe(true)
    })

    it('should handle request analysis errors gracefully', async () => {
      const request = new NextRequest('http://localhost/api/test')
      
      // Mock error in threat detection
      vi.spyOn(monitor, 'detectSQLInjection').mockImplementation(() => {
        throw new Error('Analysis error')
      })

      const threats = await monitor.analyzeRequest(request, mockContext)

      // Should not throw and return empty array
      expect(threats).toEqual([])
    })
  })

  describe('Brute Force Protection', () => {
    it('should track failed attempts', () => {
      const key = 'login:192.168.1.1'
      
      expect(monitor.isLockedOut(key)).toBe(false)
      
      // Record multiple failed attempts
      for (let i = 0; i < 5; i++) {
        const isBruteForce = monitor.recordFailedAttempt(key)
        if (i === 4) {
          expect(isBruteForce).toBe(true) // 5th attempt should trigger lockout
        }
      }
      
      expect(monitor.isLockedOut(key)).toBe(true)
    })

    it('should reset attempts after timeout', async () => {
      const key = 'login:192.168.1.2'
      
      // Simulate old attempt (more than 1 hour ago)
      const oldTimestamp = Date.now() - 2 * 60 * 60 * 1000
      vi.spyOn(Date, 'now').mockReturnValueOnce(oldTimestamp)
      monitor.recordFailedAttempt(key)
      
      // New attempt should reset counter
      vi.spyOn(Date, 'now').mockRestore()
      const isBruteForce = monitor.recordFailedAttempt(key)
      expect(isBruteForce).toBe(false)
    })

    it('should handle lockout expiration', async () => {
      const key = 'login:192.168.1.3'
      
      // Trigger lockout
      for (let i = 0; i < 5; i++) {
        monitor.recordFailedAttempt(key)
      }
      
      expect(monitor.isLockedOut(key)).toBe(true)
      
      // Mock time advancement past lockout duration
      const futureTime = Date.now() + 31 * 60 * 1000 // 31 minutes
      vi.spyOn(Date, 'now').mockReturnValue(futureTime)
      
      expect(monitor.isLockedOut(key)).toBe(false)
      
      vi.spyOn(Date, 'now').mockRestore()
    })
  })

  describe('Security Event Logging', () => {
    it('should log security events to database', async () => {
      mockSupabase.from().insert.mockResolvedValue({ error: null })

      const event = {
        type: 'SQL_INJECTION' as const,
        severity: 'HIGH' as const,
        organizationId: 'org-123',
        userId: 'user-456',
        ip: '192.168.1.1',
        endpoint: '/api/test',
        details: { pattern: 'DROP TABLE' }
      }

      await monitor.logSecurityEvent(event)

      expect(mockSupabase.from).toHaveBeenCalledWith('security_events')
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SQL_INJECTION',
          severity: 'HIGH',
          organization_id: 'org-123',
          user_id: 'user-456',
          ip_address: '192.168.1.1',
          endpoint: '/api/test',
          details: { pattern: 'DROP TABLE' }
        })
      )
    })

    it('should also log critical events to audit logs', async () => {
      mockSupabase.from().insert.mockResolvedValue({ error: null })

      const criticalEvent = {
        type: 'SQL_INJECTION' as const,
        severity: 'CRITICAL' as const,
        organizationId: 'org-123',
        details: { attack: 'attempted database breach' }
      }

      await monitor.logSecurityEvent(criticalEvent)

      // Should be called twice: once for security_events, once for audit_logs
      expect(mockSupabase.from).toHaveBeenCalledTimes(2)
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs')
    })

    it('should handle logging errors gracefully', async () => {
      mockSupabase.from().insert.mockRejectedValue(new Error('Database error'))

      const event = {
        type: 'SUSPICIOUS_ACTIVITY' as const,
        severity: 'MEDIUM' as const,
        details: {}
      }

      // Should not throw
      await expect(monitor.logSecurityEvent(event)).resolves.not.toThrow()
    })
  })

  describe('Security Reports', () => {
    it('should generate security summary', async () => {
      const mockEvents = [
        { type: 'SQL_INJECTION', severity: 'HIGH', ip_address: '192.168.1.1' },
        { type: 'XSS_ATTEMPT', severity: 'MEDIUM', ip_address: '192.168.1.1' },
        { type: 'BRUTE_FORCE', severity: 'HIGH', ip_address: '192.168.1.2' }
      ]

      mockSupabase.from().eq().gte().order().limit().mockResolvedValue({
        data: mockEvents,
        error: null
      })

      const report = await monitor.generateSecurityReport('org-123', 7)

      expect(report).toEqual({
        organization_id: 'org-123',
        period_days: 7,
        total_events: 3,
        events_by_type: {
          'SQL_INJECTION': 1,
          'XSS_ATTEMPT': 1,
          'BRUTE_FORCE': 1
        },
        events_by_severity: { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 0 },
        top_threat_ips: {
          '192.168.1.1': 2,
          '192.168.1.2': 1
        },
        timeline: []
      })
    })

    it('should handle report generation errors', async () => {
      mockSupabase.from().eq().gte().order().limit().mockRejectedValue(new Error('Query error'))

      const report = await monitor.generateSecurityReport('org-123')

      expect(report).toBeNull()
    })
  })
})

describe('withSecurityMonitoring Middleware', () => {
  const mockHandler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }))
  const mockContext = {
    organizationId: 'org-123',
    userId: 'user-456',
    role: 'admin' as const,
    permissions: ['*']
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Request Monitoring', () => {
    it('should analyze requests automatically', async () => {
      const monitoredHandler = withSecurityMonitoring()(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      vi.spyOn(SecurityMonitor.prototype, 'analyzeRequest').mockResolvedValue([])

      await monitoredHandler(request, mockContext)

      expect(SecurityMonitor.prototype.analyzeRequest).toHaveBeenCalledWith(request, mockContext)
      expect(mockHandler).toHaveBeenCalled()
    })

    it('should block requests with critical threats', async () => {
      const criticalThreats = [
        {
          type: 'SQL_INJECTION' as const,
          severity: 'CRITICAL' as const,
          details: {}
        }
      ]

      vi.spyOn(SecurityMonitor.prototype, 'analyzeRequest').mockResolvedValue(criticalThreats)

      const monitoredHandler = withSecurityMonitoring()(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      const response = await monitoredHandler(request, mockContext)

      expect(response.status).toBe(403)
      expect(mockHandler).not.toHaveBeenCalled()

      const body = await response.json()
      expect(body.error).toBe('Request blocked due to security policy')
    })

    it('should allow requests with non-critical threats', async () => {
      const mediumThreats = [
        {
          type: 'SUSPICIOUS_ACTIVITY' as const,
          severity: 'MEDIUM' as const,
          details: {}
        }
      ]

      vi.spyOn(SecurityMonitor.prototype, 'analyzeRequest').mockResolvedValue(mediumThreats)

      const monitoredHandler = withSecurityMonitoring()(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      const response = await monitoredHandler(request, mockContext)

      expect(response.status).toBe(200)
      expect(mockHandler).toHaveBeenCalled()
    })

    it('should add security headers to responses', async () => {
      vi.spyOn(SecurityMonitor.prototype, 'analyzeRequest').mockResolvedValue([])

      const monitoredHandler = withSecurityMonitoring()(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      const response = await monitoredHandler(request, mockContext)

      expect(response.headers.get('X-Security-Scan')).toBe('enabled')
    })

    it('should add threat count header when threats detected', async () => {
      const threats = [
        { type: 'SUSPICIOUS_ACTIVITY' as const, severity: 'LOW' as const, details: {} },
        { type: 'XSS_ATTEMPT' as const, severity: 'MEDIUM' as const, details: {} }
      ]

      vi.spyOn(SecurityMonitor.prototype, 'analyzeRequest').mockResolvedValue(threats)

      const monitoredHandler = withSecurityMonitoring()(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      const response = await monitoredHandler(request, mockContext)

      expect(response.headers.get('X-Threats-Detected')).toBe('2')
    })

    it('should block locked out IPs', async () => {
      vi.spyOn(SecurityMonitor.prototype, 'analyzeRequest').mockResolvedValue([])
      vi.spyOn(SecurityMonitor.prototype, 'isLockedOut').mockReturnValue(true)

      const monitoredHandler = withSecurityMonitoring()(mockHandler)
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.100' }
      })

      const response = await monitoredHandler(request, mockContext)

      expect(response.status).toBe(429)
      expect(mockHandler).not.toHaveBeenCalled()

      const body = await response.json()
      expect(body.error).toBe('IP address temporarily blocked due to suspicious activity')
    })
  })

  describe('Error Handling', () => {
    it('should handle analysis errors gracefully', async () => {
      vi.spyOn(SecurityMonitor.prototype, 'analyzeRequest').mockRejectedValue(new Error('Analysis failed'))
      vi.spyOn(SecurityMonitor.prototype, 'logSecurityEvent').mockResolvedValue()

      const monitoredHandler = withSecurityMonitoring()(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      const response = await monitoredHandler(request, mockContext)

      // Should continue to handler despite analysis error
      expect(response.status).toBe(200)
      expect(mockHandler).toHaveBeenCalled()
      expect(SecurityMonitor.prototype.logSecurityEvent).toHaveBeenCalled()
    })

    it('should log analysis failures as security events', async () => {
      const analysisError = new Error('Security monitoring failure')
      vi.spyOn(SecurityMonitor.prototype, 'analyzeRequest').mockRejectedValue(analysisError)
      vi.spyOn(SecurityMonitor.prototype, 'logSecurityEvent').mockResolvedValue()

      const monitoredHandler = withSecurityMonitoring()(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      await monitoredHandler(request, mockContext)

      expect(SecurityMonitor.prototype.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SUSPICIOUS_ACTIVITY',
          severity: 'MEDIUM',
          details: expect.objectContaining({
            error: 'Security monitoring failure',
            reason: 'Security monitoring failure'
          })
        })
      )
    })
  })

  describe('Configuration Options', () => {
    it('should apply custom threat detection config', async () => {
      const customConfig = {
        sqlInjectionPatterns: [/CUSTOM_ATTACK_PATTERN/i],
        enabled: true
      }

      vi.spyOn(SecurityMonitor, 'getInstance').mockReturnValue(
        new SecurityMonitor(customConfig)
      )

      const monitoredHandler = withSecurityMonitoring(customConfig)(mockHandler)
      const request = new NextRequest('http://localhost/api/test?q=CUSTOM_ATTACK_PATTERN')

      const response = await monitoredHandler(request, mockContext)

      expect(response.status).toBe(403) // Should be blocked by custom pattern
    })

    it('should disable monitoring when configured', async () => {
      const disabledConfig = { enabled: false }

      const monitoredHandler = withSecurityMonitoring(disabledConfig)(mockHandler)
      const request = new NextRequest('http://localhost/api/test?q=SELECT * FROM users')

      const response = await monitoredHandler(request, mockContext)

      // Should not block even with SQL injection pattern
      expect(response.status).toBe(200)
      expect(mockHandler).toHaveBeenCalled()
    })
  })

  describe('Performance', () => {
    it('should not significantly impact response time', async () => {
      vi.spyOn(SecurityMonitor.prototype, 'analyzeRequest').mockResolvedValue([])

      const monitoredHandler = withSecurityMonitoring()(mockHandler)
      const request = new NextRequest('http://localhost/api/test')

      const startTime = performance.now()
      await monitoredHandler(request, mockContext)
      const endTime = performance.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(100) // Should complete within 100ms
    })

    it('should handle concurrent requests efficiently', async () => {
      vi.spyOn(SecurityMonitor.prototype, 'analyzeRequest').mockResolvedValue([])

      const monitoredHandler = withSecurityMonitoring()(mockHandler)
      
      const requests = Array.from({ length: 10 }, (_, i) => 
        monitoredHandler(
          new NextRequest(`http://localhost/api/test${i}`),
          mockContext
        )
      )

      const responses = await Promise.all(requests)

      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
      expect(mockHandler).toHaveBeenCalledTimes(10)
    })
  })
})