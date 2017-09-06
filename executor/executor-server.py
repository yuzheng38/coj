import executor_utils as eu
import json
from flask import Flask
from flask import jsonify
from flask import request

app = Flask(__name__)   # current module name - built in variable

@app.route('/')
def hello():
    return 'hello world'

@app.route('/repl', methods=['POST'])
def repl():
    data = json.loads(request.data)
    if 'code' not in data or 'lang' not in data:
        return 'provide code or language in data'
    code = data['code']
    lang = data['lang']

    print 'API got called with code %s in %s' % (code, lang)
    # return jsonify({'build': 'build from flask', 'run': 'run from flask'})
    result = eu.repl(code, lang)
    return jsonify(result)

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1])
    eu.load_image()
    app.run(port=port)