import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления заметками (создание, чтение, обновление, удаление)
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters', {})
            user_id = query_params.get('userId', 'local_user')
            
            cur.execute(
                'SELECT id, title, content, created_at, updated_at FROM t_p36597579_calendar_week_grid.notes WHERE user_id = %s ORDER BY updated_at DESC',
                (user_id,)
            )
            
            rows = cur.fetchall()
            notes = [
                {
                    'id': row[0], 
                    'title': row[1], 
                    'content': row[2] or '',
                    'createdAt': row[3].isoformat() if row[3] else None,
                    'updatedAt': row[4].isoformat() if row[4] else None
                }
                for row in rows
            ]
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(notes),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            note_id = body_data.get('id')
            title = body_data.get('title')
            content = body_data.get('content', '')
            user_id = body_data.get('userId', 'local_user')
            
            if not all([note_id, title]):
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing required fields'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                'INSERT INTO t_p36597579_calendar_week_grid.notes (id, title, content, user_id) VALUES (%s, %s, %s, %s)',
                (note_id, title, content, user_id)
            )
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': note_id, 'title': title, 'content': content}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            note_id = body_data.get('id')
            title = body_data.get('title')
            content = body_data.get('content', '')
            user_id = body_data.get('userId', 'local_user')
            
            if not note_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing note id'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                'UPDATE t_p36597579_calendar_week_grid.notes SET title = %s, content = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s AND user_id = %s',
                (title, content, note_id, user_id)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': note_id, 'title': title, 'content': content}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {})
            note_id = query_params.get('id')
            user_id = query_params.get('userId', 'local_user')
            
            if not note_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing note id'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                'DELETE FROM t_p36597579_calendar_week_grid.notes WHERE id = %s AND user_id = %s',
                (note_id, user_id)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
