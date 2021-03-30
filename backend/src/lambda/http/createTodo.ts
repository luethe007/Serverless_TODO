import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import  { createTodo } from '../../businessLogic/todos'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const newTodoReq: CreateTodoRequest = JSON.parse(event.body)
  
  const authorization_header = event.headers.Authorization
  const split = authorization_header.split(' ')
  const jwtToken = split[1]
  const newTodoItem = await createTodo(newTodoReq, jwtToken)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: "New Todo item created",
      item: newTodoItem
    })
  }
}
