from flask import Flask, render_template, request, flash, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3

app = Flask(__name__)
app.secret_key = "123"

con = sqlite3.connect("database.db")
con.execute("CREATE TABLE IF NOT EXISTS customer(pid INTEGER PRIMARY KEY, name TEXT, password_hash TEXT)")
con.close()

@app.route('/')
def index():
    return render_template('index.html')

#login
@app.route('/login', methods=["GET", "POST"])
def login():
    if request.method == 'POST':
        name = request.form['name']
        password = request.form['password']
        con = sqlite3.connect("database.db")
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute("SELECT * FROM customer WHERE name=?", (name,))
        data = cur.fetchone()

        if data and check_password_hash(data['password_hash'], password):
            session["name"] = data["name"]
            return redirect(url_for("customer"))
        else:
            flash("Username and Password Mismatch", "danger")
    return redirect(url_for("index"))

#main page
@app.route('/customer', methods=["GET", "POST"])
def customer():
    return render_template("customer.html")

#register page
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        password = request.form['password']
        
        if len(password) < 8:
            flash('Password must be at least 8 characters long', 'danger')
            return redirect(url_for('index'))

        try:
            con = sqlite3.connect("database.db")
            cur = con.cursor()
            hashed_password = generate_password_hash(password)
            cur.execute("INSERT INTO customer(name, password_hash) VALUES(?, ?)", (name, hashed_password))
            con.commit()
            flash('Registration successful. Please log in.', 'success')
        except Exception as e:
            flash('An error occurred during registration.', 'danger')
            print(e)
        finally:
            con.close()
            return redirect(url_for('index'))

    return render_template('register.html')

# @app.route('/register',methods=['GET','POST'])
# def register():
#     if request.method=='POST':
#         try:
#             name=request.form['name']
#             address=request.form['address']
#             contact=request.form['contact']
#             password_main=request.form['password_main']
#             con=sqlite3.connect("database.db")
#             cur=con.cursor()
#             cur.execute("insert into customer(name,address,contact,password_main)values(?,?,?,?)",(name,address,contact,password_main))
#             con.commit()
#             flash()
#         except:
#             flash()
#         finally:
#             return redirect(url_for("index"))
#             con.close()

#     return render_template('register.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for("index"))

if __name__ == '__main__':
    app.run(debug=True)
