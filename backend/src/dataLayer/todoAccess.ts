import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoItem } from '../models/TodoItem'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('todoAccess')

export class TodoAccess {
    constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly todoTable = process.env.TODO_TABLE,
      private readonly bucket = process.env.TODO_BUCKET,
      private readonly index = process.env.INDEX
    ) {}
  
    async getAllTodos(userId: string): Promise<TodoItem[]> {
      logger.info('Fetch all todo items')
  
      var params = {
        TableName: this.todoTable,
        IndexName: this.index,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }
  
      const result = await this.docClient.query(params).promise()
      return result.Items as TodoItem[]
    }
  
    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
      logger.info('Create todo item')
  
      var params = {
        TableName: this.todoTable,
        Item: todoItem
      }
  
      await this.docClient.put(params).promise()
  
      return todoItem
    }
  
    async updateTodo(todoId: string, updateTodo: TodoUpdate, userId: string): Promise<void> {
      var params = {
        TableName: this.todoTable,
        Key: {
          todoId: todoId,
          userId: userId
        },
        UpdateExpression:
          'SET #todo = :n, dueDate = :dd, done = :d',
        ExpressionAttributeNames: {
          '#todo': 'name'
        },
        ExpressionAttributeValues: {
          ':n': updateTodo.name,
          ':dd': updateTodo.dueDate,
          ':d': updateTodo.done,
          ':userId': userId
        },
        IndexName: this.index,
        ConditionExpression: 'userId = :userId',
        ReturnValues: 'UPDATED_NEW'
      }
      await this.docClient.update(params).promise()
      return
    }
  
    async deleteTodo(todoId: string, userId: string): Promise<void> {
      logger.info('Delete todo item', { todoId, userId })
      const params = {
        TableName: this.todoTable,
        Key: {
          todoId: todoId,
          userId: userId
        },
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ConditionExpression: 'userId = :userId'
      }
  
      await this.docClient.delete(params).promise()
  
      return
    }
  
    async addAttachment(todoId: string, userId: string): Promise<void> {
      logger.info('Update todo item')
  
      var params = {
        TableName: this.todoTable,
        Key: {
          todoId: todoId,
          userId: userId
        },
        UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${this.bucket}.s3.amazonaws.com/${todoId}`,
          ':userId': userId
        },
        IndexName: this.index,
        ConditionExpression: 'userId = :userId',
        ReturnValues: 'UPDATED_NEW'
      }
  
      await this.docClient.update(params).promise()
  
      return
    }
  }
