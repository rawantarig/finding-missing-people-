
from flask import Flask,send_from_directory
from report import report_bp
from about import about_bp
from contact import contact_bp

app = Flask(__name__,static_folder='static')
app.register_blueprint(report_bp)
app.register_blueprint(about_bp)

@app.route('/')
def home():
    return send_from_directory(app.static_folder, "index.html") 

if __name__=='__main__':
    app.run(debug=True)
