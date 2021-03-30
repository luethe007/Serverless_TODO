import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDAzCCAeugAwIBAgIJbKr0Rj0x3eIVMA0GCSqGSIb3DQEBCwUAMB8xHTAbBgNV
BAMTFGx1ZXRpZnkuZXUuYXV0aDAuY29tMB4XDTIxMDMyNzEyMjcyMFoXDTM0MTIw
NDEyMjcyMFowHzEdMBsGA1UEAxMUbHVldGlmeS5ldS5hdXRoMC5jb20wggEiMA0G
CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCfJ6Oqr26qJNavFH4rk/egrU5zvNtW
Wd+zkuJk3bkPoxh0JYf//u5TgfltctHG9Qxt5Wkp23iskfyEbWN7yTSGLATVzJbp
8Ounfmo9C+GPdIPFmtMMntUirU8uy7tLPo2ZOHS6hISL1AqyAkdbJf2IZKsciWvN
6WTTUZANZD4y4a4F8r7ghZTUPPzUbEdWixhwO1tBri1C3dVRnje+IhM5EEwKMKL+
0rZJxCk8WXgSVNZWoGw635igzlL4hbOBuVFtAv/uGDzqdRTC2gUKn2J1n4tTAg2D
sFShLy7zaxJ350OTbhs/oMMcGkeFS6flmmt5fqgna4PDZbhDIDq+JUKXAgMBAAGj
QjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFInWOMXZ5TjiLmpbGC7FbgeU
SqwzMA4GA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEAJTE5J9ES+uPI
7qu2qA910pksK8i2N2KIhD4vbU2EMntabUmLa8cjYr2r8nvoE/b2QsweRR3qgLZu
OVmwjQMHaAgqlHhh4qXKHTTU40mXzQdQiHVrlgDK7ObddXjhieAoM715+Xb5V833
GDTnwAeHNGVzQYTqNVMOx0/whxLj/pS3oubCEbWvM00XNMxsyqBNh7BgEI+6GUUI
3mFLUs3QXzCf8E+EA6BS+PhD+SzsrPi87gprJFve9ZiIZrcD4nHXozf9cnaiPRf4
YHwwped0NDsfcdCz6imYfuUGCg2zcnPCyuWiEWcRu9UKLekEyWsQpfVTsHOkeBVL
DlxShTv5vA==
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
