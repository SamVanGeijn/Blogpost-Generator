import json
import markovify

def generateBlog(event, context):
    # Genereer blog
    language = "nl"
    if 'pathParameters' in event:
        if 'language' in event.get('pathParameters'):
            language = event.get('pathParameters').get('language')
    
    with open(language+".txt") as f:
        textForModel = f.read()

    text_model = markovify.NewlineText(textForModel)

    blogText = ''
    for i in range(50):
        blogText += text_model.make_sentence() + '.\n'

    # Maak en stuur de response
    body = {
        "blog": blogText
    }

    response = {
        "headers": {
            "Access-Control-Allow-Origin": "*"
        },
        "statusCode": 200,
        "body": json.dumps(body)
    }

    return response
