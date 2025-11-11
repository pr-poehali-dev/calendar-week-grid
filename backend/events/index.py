import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления событиями календаря (создание, чтение, обновление, удаление)
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
            user_id = query_params.get('userId')
            
            if user_id:
                cur.execute('SELECT id, text, color, date, user_id, repeat, repeat_group_id, order_num FROM t_p36597579_calendar_week_grid.events WHERE user_id = %s ORDER BY date, order_num, created_at', (user_id,))
            else:
                cur.execute('SELECT id, text, color, date, user_id, repeat, repeat_group_id, order_num FROM t_p36597579_calendar_week_grid.events ORDER BY date, order_num, created_at')
            
            rows = cur.fetchall()
            events = [
                {
                    'id': row[0], 
                    'text': row[1], 
                    'color': row[2], 
                    'date': row[3],
                    'userId': row[4],
                    'repeat': row[5],
                    'repeat_group_id': row[6],
                    'order': row[7]
                }
                for row in rows
            ]
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(events),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            event_id = body_data.get('id')
            text = body_data.get('text')
            color = body_data.get('color')
            date = body_data.get('date')
            user_id = body_data.get('userId')
            
            if not all([event_id, text, color, date, user_id]):
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
                'INSERT INTO t_p36597579_calendar_week_grid.events (id, text, color, date, user_id) VALUES (%s, %s, %s, %s, %s)',
                (event_id, text, color, date, user_id)
            )
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': event_id, 'text': text, 'color': color, 'date': date, 'userId': user_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            event_id = body_data.get('id')
            text = body_data.get('text')
            color = body_data.get('color')
            date = body_data.get('date')
            user_id = body_data.get('userId')
            order = body_data.get('order')
            
            if not event_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing event id'}),
                    'isBase64Encoded': False
                }
            
            if order is not None:
                cur.execute(
                    'UPDATE t_p36597579_calendar_week_grid.events SET text = %s, color = %s, date = %s, user_id = %s, order_num = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s',
                    (text, color, date, user_id, order, event_id)
                )
            else:
                cur.execute(
                    'UPDATE t_p36597579_calendar_week_grid.events SET text = %s, color = %s, date = %s, user_id = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s',
                    (text, color, date, user_id, event_id)
                )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': event_id, 'text': text, 'color': color, 'date': date, 'userId': user_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {})
            event_id = query_params.get('id')
            
            if not event_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing event id'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('DELETE FROM t_p36597579_calendar_week_grid.events WHERE id = %s', (event_id,))
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