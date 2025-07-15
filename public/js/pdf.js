document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  fetch(`/Records/For/pdf/${id}`)
    .then(res => res.json())
    .then(data => {
      if (!data || data.error) return console.error("No record found");

      // QR Code
      const qrImg = document.getElementById("qrcode");
      if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data.qrcode_url)}&size=150x150`;
        qrImg.alt = "QR Code";
      }

      // English
      document.getElementById("phone_number").innerHTML = data.Phone_number;
      document.getElementById("Unified_no").innerHTML = data.unified_number;
      document.getElementById("cr_no").innerHTML = data.customer_reference;
      document.getElementById("date").innerHTML = data.creation_date;
      document.getElementById("Ref_no").innerHTML = data.reference_number;

      // Arabic
      document.getElementById("aphone_number").innerHTML = data.Phone_number;
      document.getElementById("aUnified_no").innerHTML = data.unified_number;
      document.getElementById("acr_no").innerHTML = data.customer_reference;
      document.getElementById("adate").innerHTML = data.creation_date;
      document.getElementById("aRef_no").innerHTML = data.reference_number;


      // Center
      // Right
      document.querySelector(".created_at").innerHTML = data.created_at;
      document.querySelector(".first_party").innerHTML = data.first_party;
      document.querySelector(".second_party").innerHTML = data.second_party;
      document.querySelector(".passport_number").innerHTML = data.passport_number;
      document.querySelector(".visa_number").innerHTML = data.visa_number;


      //Left
      

      document.querySelector(".facility_name").innerHTML = data.facility_name;
      document.querySelector(".Nationality").innerHTML = data.Nationality;
      document.querySelector(".facility_number").innerHTML = data.facility_number;
      document.querySelector(".salary").innerHTML = data.salary;


      // last date
      document.querySelector(".last_date").innerHTML = data.expiry_date;
      document.querySelector(".alast_date").innerHTML = data.expiry_date;

      // last
      document.querySelector(".creater").innerHTML = data.creater;
    })
    .catch(err => {
      console.error("Error fetching record:", err);
    });
});
