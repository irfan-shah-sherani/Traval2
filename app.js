const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const qrcode = require("qrcode");
const crypto = require("crypto");
const axios = require("axios");
const methodOverride = require('method-override');
const fetch = require('node-fetch');
require("dotenv").config();
const bodyParser = require("body-parser");
const session = require("express-session");
const username = process.env.username;
const password =process.env.password;


const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const fs = require("fs");
app.use(methodOverride('_method'));


app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true
  }));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

db.connect((error) => {
  if (error) {
    console.log(`Database connect fail:${error}`);
    return;
  }
  console.log("Database is connected");
});







// login page

app.get("/", (req, res) => {
    res.render("login");
  });
app.post("/login",(req,res)=>{
    const {username,password }= req.body;
    if (username === "admin" && password === "123") {
        req.session.user = username;
        res.redirect("/portal");
      } else {
        res.redirect("/");
      }
})
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log("Logout error:", err);
      return res.redirect('/dashboard');
    }
    res.redirect('/');
  });
});



// portal page

app.get("/portal", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
      }
  res.sendFile(path.join(__dirname, "views", "portal.html"));
});

app.get("/records", (req, res) => {
  db.query("select* from  TravalRecord", (err, result) => {
    if (err) {
      console.log(`Error Fetching data : ${err}`);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
});

app.get("/openpdf", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "downloadpdf.html"));
  });

function safeValue(val) {
  return val === undefined || val === null || val === "" ? "EMPTY" : val;
}

app.post("/SaveRecords", (req, res) => {
  const {
    room_name,
    facility_name,
    facility_number,
    request_number,
    request_type,
    applicant_name,
    creation_date,
    request_amount,
    expiry_date,
    record_number,
    request_status,
    created_at,
    reference_number,
    passport_number,
    Phone_number,
    customer_reference,
    unified_number,
    ID_number,
    Nationality,
    first_party,
    second_party,
    salary,
    visa_number
  } = req.body;

  baseURL = process.env.baseURL;
  const record_id = crypto.randomBytes(4).toString("hex");
  const qrcode_url = `${baseURL}/form/?id=${record_id}`;
  const values = [
    record_id,
    safeValue(room_name),
    safeValue(facility_name),
    safeValue(facility_number),
    safeValue(request_number),
    safeValue(request_type),
    safeValue(applicant_name),
    safeValue(creation_date),
    safeValue(request_amount),
    safeValue(expiry_date),
    safeValue(record_number),
    safeValue(request_status),
    safeValue(created_at),
    safeValue(reference_number),
    safeValue(passport_number),
    qrcode_url,
    safeValue(Phone_number),
    safeValue(customer_reference),
    safeValue(unified_number),
    safeValue(ID_number),
    safeValue(Nationality),
    safeValue(first_party),
    safeValue(second_party),
    safeValue(salary),
    safeValue(visa_number),
    safeValue(creater)
  ];
  const insertQuery = `
    Insert into TravalRecord (
        record_id,
        room_name,
        facility_name,
        facility_number,
        request_number,
        request_type,
        applicant_name,
        creation_date,
        request_amount,
        expiry_date,
        record_number,
        request_status,
        created_at,
        reference_number,
        passport_number,
        qrcode_url,
        Phone_number,
        customer_reference,
        unified_number,
        ID_number,
        Nationality,
        first_party,
        second_party,
        salary,
        visa_number,
        creater
    )values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
  db.query(insertQuery, values, (error) => {
    if (error) {
      console.log(`Insert fail ${error}`);
      return res.status(500).json({ error: "Insert fail" });
    }

    res.redirect("/portal");
  });
});

app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM TravalRecord WHERE record_id = ?", [id], (err) => {
      if (err) return res.status(500).send("Delete failed");
      res.redirect("/portal");
  });
});



// download pdf

app.get("/Records/For/pdf/:id", (req, res) => {
  const record_id = req.params.id;

  db.query(
    "SELECT * FROM TravalRecord WHERE record_id = ?",
    [record_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ error: "Record not found" });

      res.json(results[0]);
    }
  );
});

app.get("/downloadpdf/:id", async (req, res) => {
  const id = req.params.id;
  baseURL = process.env.baseURL;
  const publicUrl = `${baseURL}/openpdf/?id=${id}`;



  try {
    const response = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        "X-API-Key": "sk_09b36ef833e45dc7fbd0282466a12ef35444d641",
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        source: publicUrl,
        landscape: false,
        use_print: false,
      }),
    });

    if (!response.ok) {
      return res.status(500).send("Failed to generate PDF");
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="record_${id}.pdf"`,
    });

    response.body.pipe(res);
  } catch (error) {
    console.error("PDF Error:", error.message);
    res.status(500).send("Error generating PDF");
  }
});




// from page
app.get('/form', (req, res) => {
    const id = req.query.id;
    res.sendFile(path.join(__dirname, "views", "form.html"));
  });
  

app.get('/Record/for/form/:id',(req,res)=>{
    const id = req.params.id;
    db.query(
        "select* from TravalRecord where reference_number = ?",
        [id],
        (error,result)=>{
        if(error){
            console.log("Fetch for Form error");
            return;
        }
        res.json(result);
    })
})



const port = 3000;
app.listen(port, () => {
  console.log(`live:${port}`);
});
