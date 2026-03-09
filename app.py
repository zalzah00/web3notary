from flask import Flask, render_template, request, jsonify
import hashlib

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_hash', methods=['POST'])
def generate_hash():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    # Generate the SHA-256 fingerprint
    content = file.read()
    file_hash = "0x" + hashlib.sha256(content).hexdigest()
    
    return jsonify({
        "hash": file_hash,
        "filename": file.filename
    })

if __name__ == '__main__':
    app.run(debug=True)
