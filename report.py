from flask import Flask, Blueprint,render_template,request,jsonify
from werkzeug.utils import secure_filename
import os 
import smtplib
from email.mime.text import MIMEText
from io import BytesIO
import sqlite3
report_bp = Blueprint('report',__name__)
UPLOAD_FOLDER = 'uploads'

if not os.path.exists(UPLOAD_FOLDER):os.makedirs(UPLOAD_FOLDER)
DATABASE ='missing_reports.db'
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row 
    return conn

def create_table():
    conn =get_db_connection()
    cursor =conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS report( id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,age INTEGER,gdender TEXT,last-location TEXT,last_time TEXT,
    description TEXT,email TEXT,time TEXT, date TEXT,photo TEXT)
    ''')
    conn.commit()
    conn.close()

create_table()

missing_reports=[]
@report_bp.route('/report',methods=['POST'])
def report_missing():
    required_fields=['name','age','gender','location','date','time','description','contact']
    data=request.form
    for field in required_fields:
        if field not in data or not data[field].strip():
            return jsonify({'error':f'{field}is required.'}),400
        if 'photo' not in request.files:
            return jsonify({'error':'Photo is required.'}),400
        photo = request.files['photo']
        if photo.filename =='':
            return jsonify({'error':'No selected photo.'}),400
        filename =secure_filename(photo.filename)
        photo.save(os.path.join(UPLOAD_FOLDER,
        filename))
        conn = get_db_connection()
        cursor =conn.cursor()
        cursor.execute('''
        INSERT INTO reports(name,age,gender,last_location,date,time,description,email,photo)
       VALUES(?,?,?,?,?,?,?,?,?)
''',(
   data['name'], 
   int(data['age'],),
   data['gender'],
   data['location'],
   data['date'],
   data['time'],
   data['description'],
   data['contact'],
   data['photo'],
))
    conn.commit()
    conn.close()

    return jsonify({'message':'Report submitted successfully'}),200
about_bp =Blueprint('about',__name__)
@about_bp.route('/about')
def about_page():
    return render_template('about.html')
contact_bp =Blueprint('contact',__name__)
@contact_bp.route('/contact',methods=['GET'])
def contact_page():
    return render_template('contact.html')
@contact_bp.route('/contact',methods=['POST'])
def handle_contact():
    name =request.form.get('name')
    message =request.form.get('message')
    if not name or message:
       return jsonify({'error':'All fields are required'}),400
    return jsonify({'message':"Recepited successfully"})
