import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { addAttachment } from '../../businessLogic/todos'

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)
const bucket = process.env.TODO_BUCKET

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  const authorization_header = event.headers.Authorization
  const split = authorization_header.split(' ')
  const jwtToken = split[1]

  const url =  s3.getSignedUrl('putObject', {
    Bucket: bucket,
    Key: todoId,
    Expires: urlExpiration
  })

  await addAttachment(todoId, jwtToken)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}
