import { XMLParser } from 'fast-xml-parser'
import { jwtVerify, SignJWT } from 'jose'
import { createHash, createVerify } from 'crypto'
import type { 
  SAMLAssertion, 
  SAMLMetadata, 
  AttributeMapping, 
  SAMLValidationError,
  SSOConfiguration 
} from '../types/sso'

export class SAMLHandler {
  private parser: XMLParser

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      parseTagValue: true,
    })
  }

  /**
   * Parse SAML metadata XML into structured format
   */
  async parseMetadata(metadataXML: string): Promise<SAMLMetadata> {
    try {
      const parsed = this.parser.parse(metadataXML)
      const descriptor = parsed['md:EntityDescriptor'] || parsed.EntityDescriptor

      if (!descriptor) {
        throw new Error('Invalid SAML metadata: Missing EntityDescriptor')
      }

      const ssoDescriptor = descriptor['md:IDPSSODescriptor'] || descriptor.IDPSSODescriptor
      
      if (!ssoDescriptor) {
        throw new Error('Invalid SAML metadata: Missing IDPSSODescriptor')
      }

      // Extract SSO URL
      const ssoServices = Array.isArray(ssoDescriptor['md:SingleSignOnService']) 
        ? ssoDescriptor['md:SingleSignOnService']
        : [ssoDescriptor['md:SingleSignOnService'] || ssoDescriptor.SingleSignOnService]

      const httpRedirectBinding = ssoServices.find(service => 
        service?.['@_Binding']?.includes('HTTP-Redirect') ||
        service?.Binding?.includes('HTTP-Redirect')
      )

      const ssoUrl = httpRedirectBinding?.['@_Location'] || httpRedirectBinding?.Location

      if (!ssoUrl) {
        throw new Error('Invalid SAML metadata: Missing SSO URL')
      }

      // Extract SLO URL (optional)
      const sloServices = Array.isArray(ssoDescriptor['md:SingleLogoutService'])
        ? ssoDescriptor['md:SingleLogoutService'] 
        : [ssoDescriptor['md:SingleLogoutService'] || ssoDescriptor.SingleLogoutService]

      const sloService = sloServices?.find(service => 
        service?.['@_Binding']?.includes('HTTP-Redirect') ||
        service?.Binding?.includes('HTTP-Redirect')
      )

      const sloUrl = sloService?.['@_Location'] || sloService?.Location

      // Extract certificate
      const keyDescriptor = Array.isArray(ssoDescriptor['md:KeyDescriptor'])
        ? ssoDescriptor['md:KeyDescriptor'].find(kd => kd['@_use'] === 'signing' || !kd['@_use'])
        : ssoDescriptor['md:KeyDescriptor'] || ssoDescriptor.KeyDescriptor

      const certificate = keyDescriptor?.['ds:KeyInfo']?.['ds:X509Data']?.['ds:X509Certificate'] ||
                         keyDescriptor?.KeyInfo?.X509Data?.X509Certificate

      if (!certificate) {
        throw new Error('Invalid SAML metadata: Missing signing certificate')
      }

      // Extract entity ID
      const entityId = descriptor['@_entityID'] || descriptor.entityID

      if (!entityId) {
        throw new Error('Invalid SAML metadata: Missing entityID')
      }

      return {
        entity_id: entityId,
        sso_url: ssoUrl,
        slo_url: sloUrl,
        certificate: certificate.replace(/\s/g, ''), // Remove whitespace
        attribute_mapping: {
          email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          first_name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
          last_name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
          display_name: 'http://schemas.microsoft.com/identity/claims/displayname',
        },
        signature_algorithm: 'rsa-sha256',
        digest_algorithm: 'sha256',
        name_id_format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        allow_create: true,
      }
    } catch (error) {
      throw new Error(`Failed to parse SAML metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate SAML AuthnRequest URL
   */
  generateAuthnRequest(config: SSOConfiguration, callbackUrl: string): string {
    if (config.provider_type !== 'saml') {
      throw new Error('Invalid provider type for SAML request')
    }

    const metadata = config.metadata as SAMLMetadata
    const requestId = this.generateId()
    const issueInstant = new Date().toISOString()

    const authnRequest = `<samlp:AuthnRequest
      xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
      xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
      ID="${requestId}"
      Version="2.0"
      IssueInstant="${issueInstant}"
      Destination="${metadata.sso_url}"
      ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      AssertionConsumerServiceURL="${callbackUrl}">
      <saml:Issuer>${metadata.entity_id}</saml:Issuer>
      <samlp:NameIDPolicy Format="${metadata.name_id_format}" AllowCreate="${metadata.allow_create}" />
      <samlp:RequestedAuthnContext Comparison="exact">
        <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef>
      </samlp:RequestedAuthnContext>
    </samlp:AuthnRequest>`

    // Base64 encode and URL encode the request
    const encodedRequest = Buffer.from(authnRequest).toString('base64')
    const params = new URLSearchParams({
      SAMLRequest: encodedRequest,
      RelayState: config.organization_id, // Use org ID as relay state
    })

    return `${metadata.sso_url}?${params.toString()}`
  }

  /**
   * Validate and parse SAML response
   */
  async validateSAMLResponse(
    responseXML: string,
    config: SSOConfiguration
  ): Promise<SAMLAssertion> {
    if (config.provider_type !== 'saml') {
      throw new Error('Invalid provider type for SAML validation')
    }

    const metadata = config.metadata as SAMLMetadata

    try {
      const parsed = this.parser.parse(responseXML)
      const response = parsed['samlp:Response'] || parsed.Response

      if (!response) {
        throw new Error('Invalid SAML Response: Missing Response element')
      }

      // Check status
      const status = response['samlp:Status'] || response.Status
      const statusCode = status?.['samlp:StatusCode'] || status?.StatusCode
      
      if (statusCode?.['@_Value'] !== 'urn:oasis:names:tc:SAML:2.0:status:Success') {
        const statusMessage = status?.['samlp:StatusMessage'] || status?.StatusMessage || 'Unknown error'
        throw new Error(`SAML authentication failed: ${statusMessage}`)
      }

      // Extract assertion
      const assertion = response['saml:Assertion'] || response.Assertion

      if (!assertion) {
        throw new Error('Invalid SAML Response: Missing Assertion')
      }

      // Verify signature
      await this.verifySignature(assertion, metadata.certificate)

      // Validate conditions
      this.validateConditions(assertion, metadata.entity_id)

      // Extract attributes
      const attributes = this.extractAttributes(assertion, metadata.attribute_mapping)

      // Extract NameID
      const subject = assertion['saml:Subject'] || assertion.Subject
      const nameId = subject?.['saml:NameID'] || subject?.NameID
      
      if (!nameId) {
        throw new Error('Invalid SAML Response: Missing NameID')
      }

      // Extract session index
      const authnStatement = assertion['saml:AuthnStatement'] || assertion.AuthnStatement
      const sessionIndex = authnStatement?.['@_SessionIndex'] || authnStatement?.SessionIndex

      return {
        nameId: typeof nameId === 'object' ? nameId['#text'] : nameId,
        sessionIndex,
        attributes,
        conditions: this.extractConditions(assertion),
        authnContext: this.extractAuthnContext(authnStatement),
      }
    } catch (error) {
      throw new Error(`SAML validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Test SSO configuration
   */
  async testConfiguration(config: SSOConfiguration): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = []

    try {
      if (config.provider_type !== 'saml') {
        errors.push('Only SAML configurations are supported for testing')
        return { success: false, errors }
      }

      const metadata = config.metadata as SAMLMetadata

      // Test 1: Validate required fields
      if (!metadata.entity_id) errors.push('Missing entity ID')
      if (!metadata.sso_url) errors.push('Missing SSO URL')
      if (!metadata.certificate) errors.push('Missing certificate')

      // Test 2: Validate certificate format
      try {
        this.formatCertificate(metadata.certificate)
      } catch {
        errors.push('Invalid certificate format')
      }

      // Test 3: Test SSO URL accessibility
      try {
        const response = await fetch(metadata.sso_url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        })
        if (!response.ok) {
          errors.push(`SSO URL not accessible: ${response.status}`)
        }
      } catch {
        errors.push('SSO URL not reachable')
      }

      // Test 4: Validate attribute mapping
      if (!metadata.attribute_mapping.email) {
        errors.push('Email attribute mapping is required')
      }

      return { success: errors.length === 0, errors }
    } catch (error) {
      errors.push(`Configuration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return { success: false, errors }
    }
  }

  // Private helper methods

  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async verifySignature(assertion: any, certificate: string): Promise<void> {
    try {
      const signature = assertion['ds:Signature'] || assertion.Signature
      
      if (!signature) {
        throw new Error('Missing signature in SAML assertion')
      }

      const signedInfo = signature['ds:SignedInfo'] || signature.SignedInfo
      const signatureValue = signature['ds:SignatureValue'] || signature.SignatureValue
      
      // Format certificate
      const cert = this.formatCertificate(certificate)
      
      // Create verifier
      const verifier = createVerify('RSA-SHA256')
      verifier.update(JSON.stringify(signedInfo))
      
      const isValid = verifier.verify(cert, signatureValue, 'base64')
      
      if (!isValid) {
        throw new Error('Invalid SAML assertion signature')
      }
    } catch (error) {
      throw new Error(`Signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private validateConditions(assertion: any, expectedAudience: string): void {
    const conditions = assertion['saml:Conditions'] || assertion.Conditions
    
    if (!conditions) return

    // Check time bounds
    const notBefore = conditions['@_NotBefore']
    const notOnOrAfter = conditions['@_NotOnOrAfter']
    const now = new Date()

    if (notBefore && new Date(notBefore) > now) {
      throw new Error('SAML assertion not yet valid')
    }

    if (notOnOrAfter && new Date(notOnOrAfter) <= now) {
      throw new Error('SAML assertion has expired')
    }

    // Check audience restriction
    const audienceRestriction = conditions['saml:AudienceRestriction'] || conditions.AudienceRestriction
    if (audienceRestriction) {
      const audiences = Array.isArray(audienceRestriction['saml:Audience'])
        ? audienceRestriction['saml:Audience']
        : [audienceRestriction['saml:Audience'] || audienceRestriction.Audience]

      const hasValidAudience = audiences.some(audience => 
        (typeof audience === 'object' ? audience['#text'] : audience) === expectedAudience
      )

      if (!hasValidAudience) {
        throw new Error('SAML assertion audience restriction failed')
      }
    }
  }

  private extractAttributes(assertion: any, attributeMapping: AttributeMapping): Record<string, string | string[]> {
    const attributeStatement = assertion['saml:AttributeStatement'] || assertion.AttributeStatement
    
    if (!attributeStatement) {
      return {}
    }

    const attributes = Array.isArray(attributeStatement['saml:Attribute'])
      ? attributeStatement['saml:Attribute']
      : [attributeStatement['saml:Attribute'] || attributeStatement.Attribute]

    const result: Record<string, string | string[]> = {}

    for (const attr of attributes) {
      if (!attr) continue

      const name = attr['@_Name'] || attr.Name
      const values = Array.isArray(attr['saml:AttributeValue'])
        ? attr['saml:AttributeValue']
        : [attr['saml:AttributeValue'] || attr.AttributeValue]

      const extractedValues = values
        .filter(Boolean)
        .map(val => typeof val === 'object' ? val['#text'] : val)
        .filter(Boolean)

      if (extractedValues.length > 0) {
        result[name] = extractedValues.length === 1 ? extractedValues[0] : extractedValues
      }
    }

    // Map to standard attributes
    const mappedResult: Record<string, string | string[]> = {}
    
    for (const [key, samlAttr] of Object.entries(attributeMapping)) {
      if (samlAttr && result[samlAttr]) {
        mappedResult[key] = result[samlAttr]
      }
    }

    return mappedResult
  }

  private extractConditions(assertion: any) {
    const conditions = assertion['saml:Conditions'] || assertion.Conditions
    
    if (!conditions) return undefined

    return {
      notBefore: conditions['@_NotBefore'] ? new Date(conditions['@_NotBefore']) : undefined,
      notOnOrAfter: conditions['@_NotOnOrAfter'] ? new Date(conditions['@_NotOnOrAfter']) : undefined,
    }
  }

  private extractAuthnContext(authnStatement: any) {
    if (!authnStatement) return undefined

    const authnContext = authnStatement['saml:AuthnContext'] || authnStatement.AuthnContext
    
    if (!authnContext) return undefined

    return {
      authnContextClassRef: authnContext['saml:AuthnContextClassRef'] || authnContext.AuthnContextClassRef,
    }
  }

  private formatCertificate(certificate: string): string {
    // Remove any existing formatting
    const cleanCert = certificate.replace(/\s/g, '')
    
    // Add proper PEM formatting
    const pemCert = cleanCert.match(/.{1,64}/g)?.join('\n')
    
    return `-----BEGIN CERTIFICATE-----\n${pemCert}\n-----END CERTIFICATE-----`
  }
}