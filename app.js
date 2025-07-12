const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const qrcode = require("qrcode");
const crypto = require("crypto");
const axios = require("axios");
const methodOverride = require('method-override');
const fetch = require('node-fetch');
require("dotenv").config();



const app = express();

app.use(express.static(path.join(__dirname, "public")));


app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const fs = require("fs");
app.use(methodOverride('_method'));

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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "portal.html"));
});

app.get("/records", (req, res) => {
  db.query("select* from  TravalRecord", (err, result) => {
    if (err) {
      console.log(`Error Fetching data : ${err}`);
      return res.status(500).json({ error: "Database error" });
    }
    // console.log(result);
    res.json(result);
  });
});

app.get("/openpdf", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "downloadpdf.html"));
  });


app.get("/Records/For/pdf/:id", (req, res) => {
  const record_id = req.params.id;

  db.query(
    "SELECT * FROM TravalRecord WHERE record_id = ?",
    [record_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ error: "Record not found" });

      res.json(results[0]); // Send the first record only
    }
  );
});



app.get("/downloadpdf/:id", async (req, res) => {
  const id = req.params.id;
  const publicUrl = `https://traval2.onrender.com/openpdf/?id=${id}`;

  try {
    const response = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        "X-API-Key": "sk_a7186186a35085a9c04c1c73e3b2b0b52fc75fc5",
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        source: publicUrl,
        landscape: false,
        use_print: true,
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

app.get('/form', (req, res) => {
    const id = req.query.id;
    res.sendFile(path.join(__dirname, "views", "form.html"));
  });
  

app.get('/Record/for/form/:id',(req,res)=>{
    const id = req.params.id;
    db.query(
        "select* from TravalRecord where record_id = ?",
        [id],
        (error,result)=>{
        if(error){
            console.log("Fetch for Form error");
            return;
        }
        res.json(result);
    })
})









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
  } = req.body;

  const record_id = crypto.randomBytes(4).toString("hex");
//   const qrcode_url = `http://localhost:3000/form/?id=${record_id}`;
  const qrcode_url = `${baseURL}/form/?id=${record_id}`;
  const values = [
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
        qrcode_url
    )values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
  db.query(insertQuery, values, (error) => {
    if (error) {
      console.log(`Insert fail ${error}`);
      return res.status(500).json({ error: "Insert fail" });
    }

    res.redirect("/");
  });
});










//Delete
app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM TravalRecord WHERE record_id = ?", [id], (err) => {
        if (err) return res.status(500).send("Delete failed");
        res.redirect("/");
    });
});
  







const port = 3000;
app.listen(port, () => {
  console.log(`live:${port}`);
});



























